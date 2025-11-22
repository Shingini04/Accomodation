import { Resolver, Query, Ctx } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Accommodation } from "../entities/Accommodation";
import { Room } from "../entities/Room";
import { PaymentTransaction } from "../entities/PaymentTransaction";
import { accommodationsToCSV, roomsToCSV, paymentsToCSV, supportTicketsToCSV } from "../services/exportService";
import { SupportTicket } from "../entities/SupportTicket";

@Resolver()
export class ExportResolver {
  @Query(() => String)
  async exportAccommodationsCSV(): Promise<string> {
    // protect exports: require admin
    throw new Error('Use exportAccommodationsCSVAdmin via GraphQL client with admin header');
  }

  @Query(() => String)
  async exportRoomsCSV(): Promise<string> {
    const roomRepo = AppDataSource.getRepository(Room);
    const rooms = await roomRepo.find();
    return roomsToCSV(rooms);
  }

  @Query(() => String)
  async exportAccommodationsCSVAdmin(@Ctx() ctx: any): Promise<string> {
    if (!ctx?.admin) {
      throw new Error('Unauthorized: admin access required');
    }
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const accommodations = await accommodationRepo.find({ 
      where: { paid: true }, 
      order: { createdAt: 'DESC' },
      relations: ['user']
    });
    return accommodationsToCSV(accommodations);
  }

  @Query(() => String)
  async exportPaymentsCSV(): Promise<string> {
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);
    const payments = await paymentRepo.find({ where: { status: "success" } });
    return paymentsToCSV(payments);
  }

  @Query(() => String)
  async exportSupportTicketsCSV(@Ctx() ctx: any): Promise<string> {
    if (!ctx?.admin) {
      throw new Error('Unauthorized: admin access required');
    }
    const ticketRepo = AppDataSource.getRepository(SupportTicket);
    const tickets = await ticketRepo.find({ order: { createdAt: 'DESC' } });
    return supportTicketsToCSV(tickets);
  }
}
