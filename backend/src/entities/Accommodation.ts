import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { ObjectType, Field, ID, Float } from "type-graphql";
import { User } from "./User";
import { Allotment } from "./Allotment";

@Entity()
@ObjectType()
export class Accommodation {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  accoId: string;

  @ManyToOne(() => User, user => user.accommodations, { eager: true })
  @JoinColumn()
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  mobile: string;

  @Column()
  @Field()
  dob: string;

  @Column()
  @Field()
  gender: string;

  @Column()
  @Field()
  idType: string;

  @Column()
  @Field()
  idNumber: string;

  @Column("text")
  @Field()
  address: string;

  @Column()
  @Field()
  organization: string;

  @Column()
  @Field()
  arrivalDate: string;

  @Column()
  @Field()
  departureDate: string;

  @Column("int")
  @Field()
  numberOfPeople: number;

  // store genders for each guest (first guest is the primary applicant)
  @Column("simple-json", { nullable: true })
  @Field(() => [String], { nullable: true })
  guestGenders?: string[];

  @Column()
  @Field()
  accommodationDates: string;

  @Column("float")
  @Field(() => Float)
  amount: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  eventName?: string;

  @Column({ default: false })
  @Field()
  paid: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  orderId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  paymentSignature?: string;

  @Column({ default: false })
  @Field()
  termsAndConditions: boolean;

  @OneToOne(() => Allotment, allotment => allotment.accommodation, { nullable: true })
  @Field(() => Allotment, { nullable: true })
  allotment?: Allotment;

  @Column({ nullable: true })
  @Field({ nullable: true })
  checkInAt?: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  checkOutAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
