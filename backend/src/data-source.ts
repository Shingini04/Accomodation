import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Accommodation } from "./entities/Accommodation";
import { Room } from "./entities/Room";
import { Allotment } from "./entities/Allotment";
import { PaymentTransaction } from "./entities/PaymentTransaction";
import { SupportTicket } from "./entities/SupportTicket";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [User, Accommodation, Room, Allotment, PaymentTransaction, SupportTicket],
  migrations: [],
  subscribers: [],
});
