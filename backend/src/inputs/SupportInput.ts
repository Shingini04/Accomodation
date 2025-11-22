import { InputType, Field } from "type-graphql";
import { IsNotEmpty, IsEmail, MinLength, MaxLength } from "class-validator";

@InputType()
export class CreateSupportTicketInput {
  @Field()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @Field()
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(500, { message: 'Message must be at most 500 characters' })
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
