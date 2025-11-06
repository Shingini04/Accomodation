import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";

@Entity()
@ObjectType()
export class SupportTicket {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  category: string;

  @Column("text")
  @Field()
  message: string;

  @Column({ default: "open" })
  @Field()
  status: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  response?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  respondedBy?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  respondedAt?: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
