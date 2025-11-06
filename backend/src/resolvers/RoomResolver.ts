import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { Room } from "../entities/Room";
import { CreateRoomInput } from "../inputs/RoomInput";

@Resolver(Room)
export class RoomResolver {
  @Query(() => [Room])
  async getRooms(): Promise<Room[]> {
    const roomRepo = AppDataSource.getRepository(Room);
    return await roomRepo.find({ relations: ["allotments"] });
  }

  @Query(() => [Room])
  async getAvailableRooms(): Promise<Room[]> {
    const roomRepo = AppDataSource.getRepository(Room);
    return await roomRepo.find({ where: { available: true } });
  }

  @Query(() => Room, { nullable: true })
  async getRoom(@Arg("id") id: string): Promise<Room | null> {
    const roomRepo = AppDataSource.getRepository(Room);
    return await roomRepo.findOne({ where: { id }, relations: ["allotments"] });
  }

  @Mutation(() => Room)
  async createRoom(@Arg("data") data: CreateRoomInput): Promise<Room> {
    const roomRepo = AppDataSource.getRepository(Room);

    const existingRoom = await roomRepo.findOne({
      where: { roomNumber: data.roomNumber, hostelName: data.hostelName },
    });

    if (existingRoom) {
      throw new Error("Room already exists");
    }

    const room = roomRepo.create({
      roomNumber: data.roomNumber,
      hostelName: data.hostelName,
      roomType: data.roomType,
      capacity: data.capacity,
      occupied: 0,
      available: true,
    });

    return await roomRepo.save(room);
  }

  @Mutation(() => Boolean)
  async deleteRoom(@Arg("id") id: string): Promise<boolean> {
    const roomRepo = AppDataSource.getRepository(Room);
    const room = await roomRepo.findOne({ where: { id }, relations: ["allotments"] });

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.allotments && room.allotments.length > 0) {
      throw new Error("Cannot delete room with existing allotments");
    }

    await roomRepo.remove(room);
    return true;
  }
}
