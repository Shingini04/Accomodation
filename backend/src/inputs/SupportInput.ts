import { InputType, Field } from "type-graphql";
import { IsNotEmpty, IsEmail } from "class-validator";

@InputType()
export class CreateSupportTicketInput {
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
  category: string;

  @Field()
  @IsNotEmpty()
  message: string;
}

@InputType()
export class RespondToTicketInput {
  @Field()
  ticketId: string;

  @Field()
  response: string;

  @Field()
  respondedBy: string;
}
