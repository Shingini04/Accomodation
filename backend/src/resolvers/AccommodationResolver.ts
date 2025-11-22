import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Accommodation } from "../entities/Accommodation";
import { User } from "../entities/User";
import { PaymentTransaction } from "../entities/PaymentTransaction";
import { CreateAccommodationInput, CreateAllotmentInput, UpdateCheckInOutInput } from "../inputs/AccommodationInput";
import { Allotment } from "../entities/Allotment";
import { Room } from "../entities/Room";
import Razorpay from "razorpay";
import crypto from "crypto";
import { sendEmail } from "../services/emailService";

@Resolver(Accommodation)
export class AccommodationResolver {
  @Query(() => [Accommodation])
  async getAccommodations(@Ctx() ctx: any): Promise<Accommodation[]> {
    // require admin access
    if (!ctx?.admin) {
      throw new Error('Unauthorized: admin access required');
    }
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    // return ALL accommodations (both paid and unpaid), most recent first
    return await accommodationRepo.find({ order: { createdAt: 'DESC' }, relations: ["user", "allotment"] });
  }

  @Query(() => Accommodation, { nullable: true })
  async getAccommodation(@Arg("id") id: string): Promise<Accommodation | null> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    return await accommodationRepo.findOne({ where: { accoId: id }, relations: ["user", "allotment"] });
  }

  @Query(() => Accommodation, { nullable: true })
  async pollAccommodationPayment(@Arg("orderId") orderId: string): Promise<Accommodation | null> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    return await accommodationRepo.findOne({ where: { orderId }, relations: ["user"] });
  }

  @Query(() => [Accommodation])
  async getUserAccommodations(@Arg("userId") userId: string): Promise<Accommodation[]> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    return await accommodationRepo.find({ 
      where: { user: { id: userId } }, 
      order: { createdAt: 'DESC' }, 
      relations: ["user", "allotment", "allotment.room"] 
    });
  }

  @Mutation(() => Accommodation)
  async createAccommodation(@Arg("data") data: CreateAccommodationInput, @Ctx() ctx: any): Promise<Accommodation> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const userRepo = AppDataSource.getRepository(User);
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);

    // require authenticated user from context
    const authUser = ctx?.user;
    if (!authUser || !authUser.userId) {
      throw new Error("Authentication required");
    }

    const user = await userRepo.findOne({ where: { id: authUser.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // ensure only verified participants can submit
    if (!user.verified) {
      throw new Error("Your account is not verified. Please verify your account before submitting an accommodation request.");
    }

    if (!data.termsAndConditions) {
      throw new Error("You must accept the terms and conditions");
    }

    // basic server-side validations
    const arrival = new Date(data.arrivalDate);
    const departure = new Date(data.departureDate);
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      throw new Error("Invalid arrival or departure date");
    }
    if (departure <= arrival) {
      throw new Error("Departure must be after arrival");
    }
    if (data.numberOfPeople < 1) {
      throw new Error("Number of people must be at least 1");
    }
    if (Array.isArray(data.guestGenders) && data.guestGenders.length > 0 && data.guestGenders.length !== data.numberOfPeople) {
      throw new Error("Guest genders count must match the number of people");
    }

    const useBypass = process.env.DISABLE_RAZORPAY === "true";
    let generatedOrderId: string;

    if (useBypass) {
      generatedOrderId = `dev_order_${Date.now()}`;
    } else {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_SECRET!,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(300 * Math.max(1, Math.ceil((new Date(data.departureDate).getTime() - new Date(data.arrivalDate).getTime()) / (1000 * 60 * 60 * 24))) * data.numberOfPeople * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      generatedOrderId = order.id;
    }

    // prevent duplicate entries: check for same user and same arrival/departure
    const duplicate = await accommodationRepo.findOne({ where: { user: { id: user.id }, arrivalDate: data.arrivalDate, departureDate: data.departureDate } });
    if (duplicate) {
      throw new Error("You have already submitted an accommodation request for these dates");
    }

    // calculate nights and amount (fixed ₹300 per day per person)
    const nights = data.arrivalDate && data.departureDate
      ? Math.max(1, Math.ceil((new Date(data.departureDate).getTime() - new Date(data.arrivalDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const computedAmount = 300 * nights * data.numberOfPeople;

    const accommodation = accommodationRepo.create({
      user,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      dob: data.dob,
      gender: data.gender,
      idType: data.idType,
      idNumber: data.idNumber,
      address: data.address,
      organization: data.organization,
      arrivalDate: data.arrivalDate,
      departureDate: data.departureDate,
      numberOfPeople: data.numberOfPeople,
      guestGenders: data.guestGenders,
      accommodationDates: data.accommodationDates,
      amount: computedAmount,
      orderId: generatedOrderId,
      termsAndConditions: data.termsAndConditions,
      eventName: data.eventName,
      paid: false,
    });

    const savedAccommodation = await accommodationRepo.save(accommodation);

    const transaction = paymentRepo.create({
      accommodationId: savedAccommodation.accoId,
      orderId: generatedOrderId,
      amount: computedAmount,
      currency: "INR",
      status: "created",
    });

    await paymentRepo.save(transaction);

    // Notify user that the accommodation request has been received
    try {
      await sendEmail({
        to: savedAccommodation.email,
        subject: "Shaastra Accommodation Request Received",
        html: `
          <h2>Accommodation Request Submitted</h2>
          <p>Dear ${savedAccommodation.name},</p>
          <p>We've received your accommodation request. Please proceed to complete the payment to confirm your booking.</p>
          <ul>
            <li><strong>Order ID:</strong> ${savedAccommodation.orderId}</li>
            <li><strong>Amount:</strong> ₹${savedAccommodation.amount}</li>
            <li><strong>Check-in:</strong> ${new Date(savedAccommodation.arrivalDate).toLocaleString()}</li>
            <li><strong>Check-out:</strong> ${new Date(savedAccommodation.departureDate).toLocaleString()}</li>
          </ul>
          <p>You will receive a confirmation email after successful payment.</p>
          <p>Best regards,<br/>Shaastra Team</p>
        `,
      });
    } catch (e) {
      console.error('Failed to send submission email:', e);
    }

    return savedAccommodation;
  }

  @Mutation(() => Accommodation)
  async verifyRazorpayPayment(
    @Arg("orderId") orderId: string,
    @Arg("paymentId") paymentId: string,
    @Arg("signature") signature: string
  ): Promise<Accommodation> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);

    const accommodation = await accommodationRepo.findOne({
      where: { orderId },
      relations: ["user"],
    });

    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      const transaction = await paymentRepo.findOne({ where: { orderId } });
      if (transaction) {
        transaction.status = "failed";
        transaction.errorDescription = "Invalid payment signature";
        await paymentRepo.save(transaction);
      }
      // send payment failure email (do not block)
      try {
        await sendEmail({
          to: accommodation.email,
          subject: "Payment Failed - Shaastra Accommodation",
          html: `
            <h2>Payment Failed</h2>
            <p>Dear ${accommodation.name},</p>
            <p>We could not verify your payment for order <strong>${orderId}</strong>.</p>
            <p>Please try again. If the amount was debited, it will be auto-reversed by your bank.</p>
            <p>Best regards,<br/>Shaastra Team</p>
          `,
        });
      } catch (e) {
        console.error('Failed to send payment failure email:', e);
      }
      throw new Error("Invalid payment signature");
    }

    accommodation.paid = true;
    accommodation.paymentId = paymentId;
    accommodation.paymentSignature = signature;

    await accommodationRepo.save(accommodation);

    const transaction = await paymentRepo.findOne({ where: { orderId } });
    if (transaction) {
      transaction.paymentId = paymentId;
      transaction.signature = signature;
      transaction.status = "success";
      await paymentRepo.save(transaction);
    }

    console.log('=== PAYMENT SUCCESS - SENDING EMAIL ===');
    console.log('Recipient email:', accommodation.email);
    console.log('Recipient name:', accommodation.name);
    console.log('Order ID:', orderId);
    console.log('Payment ID:', paymentId);
    
    try {
      await sendEmail({
        to: accommodation.email,
        subject: "Thank You! Your Shaastra Accommodation Payment is Confirmed",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 5px; margin-top: 20px; }
            .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank You! Payment Successful</h2>
            </div>
            <div class="content">
              <p>Dear ${accommodation.name},</p>
              <p>Your accommodation payment has been successfully processed. We're excited to host you!</p>
              
              <div class="details">
                <h3>Booking Details:</h3>
                <ul style="list-style: none; padding-left: 0;">
                  <li>🏷️ Booking ID: ${accommodation.accoId}</li>
                  <li>💳 Amount Paid: ₹${accommodation.amount}</li>
                  <li>🧾 Payment ID: ${paymentId}</li>
                  <li>📅 Check-in: ${accommodation.arrivalDate}</li>
                  <li>📅 Check-out: ${accommodation.departureDate}</li>
                  <li>👥 Number of Guests: ${accommodation.numberOfPeople}</li>
                </ul>
                <p style="margin-top: 15px; padding: 10px; background: #e0f2fe; border-left: 4px solid #2563eb; font-size: 13px;">
                  <strong>Payment Receipt</strong><br/>
                  This email serves as your official payment receipt. Please save this for your records. Order ID: ${orderId}
                </p>
              </div>

              <p>You will receive your room allotment details shortly. If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>We look forward to welcoming you!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>Shaastra Team</p>
              <small>This is an automated message, please do not reply to this email.</small>
            </div>
          </div>
        </body>
        </html>
      `,
      });
      console.log('✅ SUCCESS: Payment confirmation email sent to:', accommodation.email);
    } catch (emailError) {
      console.error('❌ FAILED: Could not send payment confirmation email');
      console.error('Error details:', emailError);
      // Don't throw here - we want the payment to succeed even if email fails
    }
    
    return accommodation;
  }

  @Query(() => String)
  async generateReceipt(@Arg("accommodationId") accommodationId: string): Promise<string> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const accommodation = await accommodationRepo.findOne({
      where: { accoId: accommodationId },
      relations: ["user"],
    });

    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    if (!accommodation.paid) {
      throw new Error("Payment not completed for this accommodation");
    }

    // Generate simple text-based receipt (can be enhanced to PDF binary if needed)
    const receipt = `
========================================
        SHAASTRA ACCOMMODATION
           PAYMENT RECEIPT
========================================

Receipt Date: ${new Date().toLocaleString()}
Booking ID: ${accommodation.accoId}
Order ID: ${accommodation.orderId}
Payment ID: ${accommodation.paymentId || 'N/A'}

----------------------------------------
GUEST DETAILS
----------------------------------------
Name: ${accommodation.name}
Email: ${accommodation.email}
Mobile: ${accommodation.mobile}
Organization: ${accommodation.organization}

----------------------------------------
ACCOMMODATION DETAILS
----------------------------------------
Check-in: ${accommodation.arrivalDate}
Check-out: ${accommodation.departureDate}
Number of Guests: ${accommodation.numberOfPeople}
Gender: ${accommodation.gender}

----------------------------------------
PAYMENT DETAILS
----------------------------------------
Amount Paid: ₹${accommodation.amount}
Payment Status: Paid
Currency: INR

========================================
Thank you for choosing Shaastra!
For support, contact: ${process.env.SENDGRID_FROM_EMAIL || 'support@shaastra.org'}
========================================
    `;

    return receipt;
  }

  @Mutation(() => Allotment)
  async createAllotment(@Arg("data") data: CreateAllotmentInput, @Ctx() ctx: any): Promise<Allotment> {
    // restrict to admins
    if (!ctx?.admin) {
      throw new Error('Unauthorized: admin access required');
    }
    const allotmentRepo = AppDataSource.getRepository(Allotment);
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const roomRepo = AppDataSource.getRepository(Room);

    const accommodation = await accommodationRepo.findOne({
      where: { accoId: data.accommodationId },
      relations: ["user"],
    });
    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    if (!accommodation.paid) {
      throw new Error("Payment not completed for this accommodation");
    }

    const room = await roomRepo.findOne({ where: { id: data.roomId } });
    if (!room) {
      throw new Error("Room not found");
    }

    // Check room capacity
    if (room.occupied >= room.capacity) {
      throw new Error("Room is full");
    }

    // Check hostel-level capacity: prevent overbooking at hostel level
    const allRoomsInHostel = await roomRepo.find({ where: { hostelName: room.hostelName } });
    const hostelTotalCapacity = allRoomsInHostel.reduce((sum, r) => sum + r.capacity, 0);
    const hostelCurrentOccupancy = allRoomsInHostel.reduce((sum, r) => sum + r.occupied, 0);
    
    if (hostelCurrentOccupancy + accommodation.numberOfPeople > hostelTotalCapacity) {
      throw new Error(`Hostel ${room.hostelName} does not have enough capacity for ${accommodation.numberOfPeople} guests`);
    }

    const existingAllotment = await allotmentRepo.findOne({
      where: { accommodation: { accoId: data.accommodationId } },
    });
    if (existingAllotment) {
      throw new Error("Accommodation already allotted");
    }

    const allotment = allotmentRepo.create({
      accommodation,
      room,
      allottedBy: data.allottedBy,
      notes: data.notes,
    });

    await allotmentRepo.save(allotment);

    room.occupied += accommodation.numberOfPeople;
    if (room.occupied >= room.capacity) {
      room.available = false;
    }
    await roomRepo.save(room);

    await sendEmail({
      to: accommodation.email,
      subject: "Room Allotment Confirmed - Shaastra",
      html: `
        <h2>Room Allotment</h2>
        <p>Dear ${accommodation.name},</p>
        <p>Your room has been allotted.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Hostel: ${room.hostelName}</li>
          <li>Room Number: ${room.roomNumber}</li>
          <li>Room Type: ${room.roomType}</li>
          <li>Check-in: ${accommodation.arrivalDate}</li>
          <li>Check-out: ${accommodation.departureDate}</li>
        </ul>
        <p>Best regards,<br>Shaastra Team</p>
      `,
    });

    return allotment;
  }

  @Mutation(() => Accommodation)
  async updateCheckInOut(@Arg("data") data: UpdateCheckInOutInput, @Ctx() ctx: any): Promise<Accommodation> {
    // restrict to admins (hostel PoC)
    if (!ctx?.admin) {
      throw new Error('Unauthorized: admin access required');
    }
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const allotmentRepo = AppDataSource.getRepository(Allotment);
    const roomRepo = AppDataSource.getRepository(Room);

    const accommodation = await accommodationRepo.findOne({
      where: { accoId: data.accommodationId },
      relations: ["user", "allotment", "allotment.room"],
    });

    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    if (data.type === "checkin") {
      accommodation.checkInAt = new Date();
    } else if (data.type === "checkout") {
      accommodation.checkOutAt = new Date();
      
      // Decrement room occupancy on checkout if allotment exists
      if (accommodation.allotment && accommodation.allotment.room) {
        const room = accommodation.allotment.room;
        const roomEntity = await roomRepo.findOne({ where: { id: room.id } });
        if (roomEntity) {
          roomEntity.occupied = Math.max(0, roomEntity.occupied - accommodation.numberOfPeople);
          if (roomEntity.occupied < roomEntity.capacity) {
            roomEntity.available = true;
          }
          await roomRepo.save(roomEntity);
        }
      }
    }

    await accommodationRepo.save(accommodation);

    // notify user about check-in/check-out
    try {
      await sendEmail({
        to: accommodation.email,
        subject: data.type === 'checkin' ? 'Check-in Recorded - Shaastra Accommodation' : 'Check-out Recorded - Shaastra Accommodation',
        html: `
          <h2>${data.type === 'checkin' ? 'Check-in Recorded' : 'Check-out Recorded'}</h2>
          <p>Dear ${accommodation.name},</p>
          <p>Your ${data.type === 'checkin' ? 'check-in' : 'check-out'} has been recorded successfully.</p>
          <ul>
            <li><strong>Booking ID:</strong> ${accommodation.accoId}</li>
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Best regards,<br/>Shaastra Team</p>
        `,
      });
    } catch (e) {
      console.error('Failed to send check-in/out email:', e);
    }

    return accommodation;
  }
}
