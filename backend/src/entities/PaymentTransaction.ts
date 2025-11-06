import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { ObjectType, Field, ID, Float } from "type-graphql";

@Entity()
@ObjectType()
export class PaymentTransaction {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  accommodationId: string;

  @Column()
  @Field()
  orderId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  paymentId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  signature?: string;

  @Column("float")
  @Field(() => Float)
  amount: number;

  @Column()
  @Field()
  currency: string;

  @Column()
  @Field()
  status: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  method?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  errorCode?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  errorDescription?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
