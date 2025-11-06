import { Resolver, Query, Mutation, Arg } from "type-graphql";
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
  async getAccommodations(): Promise<Accommodation[]> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    return await accommodationRepo.find({ relations: ["user", "allotment"] });
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

  @Mutation(() => Accommodation)
  async createAccommodation(@Arg("data") data: CreateAccommodationInput): Promise<Accommodation> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const userRepo = AppDataSource.getRepository(User);
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);

    const user = await userRepo.findOne({ where: { id: data.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    if (!data.termsAndConditions) {
      throw new Error("You must accept the terms and conditions");
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
        amount: Math.round(data.amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      generatedOrderId = order.id;
    }

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
      accommodationType: data.accommodationType,
      accommodationDates: data.accommodationDates,
      amount: data.amount,
      orderId: generatedOrderId,
      termsAndConditions: data.termsAndConditions,
      paid: false,
    });

    const savedAccommodation = await accommodationRepo.save(accommodation);

    const transaction = paymentRepo.create({
      accommodationId: savedAccommodation.accoId,
      orderId: generatedOrderId,
      amount: data.amount,
      currency: "INR",
      status: "created",
    });

    await paymentRepo.save(transaction);

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

    console.log('Sending confirmation email to:', accommodation.email);
    
    try {
    console.log('Attempting to send confirmation email to:', accommodation.email);
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
      console.log('Confirmation email sent successfully to:', accommodation.email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw here - we want the payment to succeed even if email fails
    }    return accommodation;
  }

  @Mutation(() => Allotment)
  async createAllotment(@Arg("data") data: CreateAllotmentInput): Promise<Allotment> {
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

    if (room.occupied >= room.capacity) {
      throw new Error("Room is full");
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

    room.occupied += 1;
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
  async updateCheckInOut(@Arg("data") data: UpdateCheckInOutInput): Promise<Accommodation> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);

    const accommodation = await accommodationRepo.findOne({
      where: { accoId: data.accommodationId },
      relations: ["user"],
    });

    if (!accommodation) {
      throw new Error("Accommodation not found");
    }

    if (data.type === "checkin") {
      accommodation.checkInAt = new Date();
    } else if (data.type === "checkout") {
      accommodation.checkOutAt = new Date();
    }

    await accommodationRepo.save(accommodation);

    return accommodation;
  }
}
