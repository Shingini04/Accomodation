import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ObjectType, Field, ID, Int } from "type-graphql";
import { Allotment } from "./Allotment";

@Entity()
@ObjectType()
export class Room {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  roomNumber: string;

  @Column()
  @Field()
  hostelName: string;

  @Column()
  @Field()
  roomType: string;

  @Column("int")
  @Field(() => Int)
  capacity: number;

  @Column("int", { default: 0 })
  @Field(() => Int)
  occupied: number;

  @Column({ default: true })
  @Field()
  available: boolean;

  @OneToMany(() => Allotment, allotment => allotment.room)
  @Field(() => [Allotment], { nullable: true })
  allotments?: Allotment[];
}
