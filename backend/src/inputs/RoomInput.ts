import { InputType, Field, Int } from "type-graphql";
import { IsNotEmpty } from "class-validator";

@InputType()
export class CreateRoomInput {
  @Field()
  @IsNotEmpty()
  roomNumber: string;

  @Field()
  @IsNotEmpty()
  hostelName: string;

  @Field()
  @IsNotEmpty()
  roomType: string;

  @Field(() => Int)
  capacity: number;
}
