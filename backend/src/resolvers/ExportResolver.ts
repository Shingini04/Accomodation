import { Resolver, Query } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Accommodation } from "../entities/Accommodation";
import { Room } from "../entities/Room";
import { PaymentTransaction } from "../entities/PaymentTransaction";
import { accommodationsToCSV, roomsToCSV, paymentsToCSV } from "../services/exportService";

@Resolver()
export class ExportResolver {
  @Query(() => String)
  async exportAccommodationsCSV(): Promise<string> {
    const accommodationRepo = AppDataSource.getRepository(Accommodation);
    const accommodations = await accommodationRepo.find({ relations: ["user"] });
    return accommodationsToCSV(accommodations);
  }

  @Query(() => String)
  async exportRoomsCSV(): Promise<string> {
    const roomRepo = AppDataSource.getRepository(Room);
    const rooms = await roomRepo.find();
    return roomsToCSV(rooms);
  }

  @Query(() => String)
  async exportPaymentsCSV(): Promise<string> {
    const paymentRepo = AppDataSource.getRepository(PaymentTransaction);
    const payments = await paymentRepo.find({ where: { status: "success" } });
    return paymentsToCSV(payments);
  }
}
