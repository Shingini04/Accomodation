import { InputType, Field, Int, Float } from "type-graphql";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

@InputType()
export class CreateAccommodationInput {
  @Field()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(10)
  mobile: string;

  @Field()
  @IsNotEmpty()
  dob: string;

  @Field()
  @IsNotEmpty()
  gender: string;

  @Field()
  @IsNotEmpty()
  idType: string;

  @Field()
  @IsNotEmpty()
  idNumber: string;

  @Field()
  @IsNotEmpty()
  address: string;

  @Field()
  @IsNotEmpty()
  organization: string;

  @Field()
  @IsNotEmpty()
  arrivalDate: string;

  @Field()
  @IsNotEmpty()
  departureDate: string;

  @Field(() => Int)
  numberOfPeople: number;

  @Field()
  @IsNotEmpty()
  accommodationType: string;

  @Field()
  @IsNotEmpty()
  accommodationDates: string;

  @Field(() => Float)
  amount: number;

  @Field()
  termsAndConditions: boolean;
}

@InputType()
export class CreateAllotmentInput {
  @Field()
  accommodationId: string;

  @Field()
  roomId: string;

  @Field()
  allottedBy: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateCheckInOutInput {
  @Field()
  accommodationId: string;

  @Field()
  type: string;
}
