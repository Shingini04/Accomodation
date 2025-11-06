import { Resolver, Query } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Accommodation } from "../entities/Accommodation";
import { Room } from "../entities/Room";
import { PaymentTransaction } from "../entities/PaymentTransaction";
import { SupportTicket } from "../entities/SupportTicket";
import { DashboardStats, HostelUtilization, PaymentStats } from "../types/DashboardTypes";
import { Not, IsNull } from "typeorm";

@Resolver()
export class DashboardResolver {
  @Query(() => DashboardStats)
  async getDashboardStats(): Promise<DashboardStats> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const roomRepo = AppDataSource.getRepository(Room);
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);
    const ticketRepo = AppDataSource.getRepository(SupportTicket);

    const totalAccommodations = await accommodationRepo.count();
    const paidAccommodations = await accommodationRepo.count({ where: { paid: true } });
    const pendingAccommodations = await accommodationRepo.count({ where: { paid: false } });

    const maleParticipants = await accommodationRepo.count({ where: { gender: "Male" } });
    const femaleParticipants = await accommodationRepo.count({ where: { gender: "Female" } });
    const otherGenderParticipants = await accommodationRepo.count({ where: { gender: "Other" } });

    const checkedIn = await accommodationRepo.count({
      where: { checkInAt: { $ne: null } as any },
    });
    const checkedOut = await accommodationRepo.count({
      where: { checkOutAt: { $ne: null } as any },
    });

    const allRooms = await roomRepo.find();
    const totalRooms = allRooms.length;
    const occupiedRooms = allRooms.filter(room => room.occupied > 0).length;
    const totalCapacity = allRooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalOccupied = allRooms.reduce((sum, room) => sum + room.occupied, 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

    const successfulPayments = await paymentRepo.find({ where: { status: "success" } });
    const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);

    const openTickets = await ticketRepo.count({ where: { status: "open" } });

    return {
      totalAccommodations,
      paidAccommodations,
      pendingAccommodations,
      totalRooms,
      occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      maleParticipants,
      femaleParticipants,
      otherGenderParticipants,
      totalRevenue,
      checkedIn,
      checkedOut,
      openTickets,
    };
  }

  @Query(() => [HostelUtilization])
  async getHostelUtilization(): Promise<HostelUtilization[]> {
    const roomRepo = AppDataSource.getRepository(Room);
    const allRooms = await roomRepo.find();

    const hostelMap = new Map<string, HostelUtilization>();

    allRooms.forEach(room => {
      if (!hostelMap.has(room.hostelName)) {
        hostelMap.set(room.hostelName, {
          hostelName: room.hostelName,
          totalRooms: 0,
          occupiedRooms: 0,
          totalCapacity: 0,
          occupiedCapacity: 0,
          utilizationRate: 0,
        });
      }

      const hostel = hostelMap.get(room.hostelName)!;
      hostel.totalRooms += 1;
      hostel.totalCapacity += room.capacity;
      hostel.occupiedCapacity += room.occupied;
      if (room.occupied > 0) {
        hostel.occupiedRooms += 1;
      }
    });

    const result = Array.from(hostelMap.values());
    result.forEach(hostel => {
      hostel.utilizationRate =
        hostel.totalCapacity > 0
          ? Math.round((hostel.occupiedCapacity / hostel.totalCapacity) * 10000) / 100
          : 0;
    });

    return result;
  }

  @Query(() => [PaymentStats])
  async getPaymentStats(): Promise<PaymentStats[]> {
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);
    const successfulPayments = await paymentRepo.find({
      where: { status: "success" },
      order: { createdAt: "ASC" },
    });

    const dateMap = new Map<string, PaymentStats>();

    successfulPayments.forEach(payment => {
      const date = payment.createdAt.toISOString().split("T")[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          amount: 0,
          count: 0,
        });
      }

      const stat = dateMap.get(date)!;
      stat.amount += payment.amount;
      stat.count += 1;
    });

    return Array.from(dateMap.values());
  }
}
