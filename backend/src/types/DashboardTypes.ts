import { ObjectType, Field, Int, Float } from "type-graphql";

@ObjectType()
export class DashboardStats {
  @Field(() => Int)
  totalAccommodations: number;

  @Field(() => Int)
  paidAccommodations: number;

  @Field(() => Int)
  pendingAccommodations: number;

  @Field(() => Int)
  totalRooms: number;

  @Field(() => Int)
  occupiedRooms: number;

  @Field(() => Float)
  occupancyRate: number;

  @Field(() => Int)
  maleParticipants: number;

  @Field(() => Int)
  femaleParticipants: number;

  @Field(() => Int)
  otherGenderParticipants: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  checkedIn: number;

  @Field(() => Int)
  checkedOut: number;

  @Field(() => Int)
  openTickets: number;
}

@ObjectType()
export class HostelUtilization {
  @Field()
  hostelName: string;

  @Field(() => Int)
  totalRooms: number;

  @Field(() => Int)
  occupiedRooms: number;

  @Field(() => Int)
  totalCapacity: number;

  @Field(() => Int)
  occupiedCapacity: number;

  @Field(() => Float)
  utilizationRate: number;
}

@ObjectType()
export class PaymentStats {
  @Field()
  date: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  count: number;
}
