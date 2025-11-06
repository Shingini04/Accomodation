import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Room } from "./Room";
import { Accommodation } from "./Accommodation";

@Entity()
@ObjectType()
export class Allotment {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @OneToOne(() => Accommodation, accommodation => accommodation.allotment, { eager: true })
  @JoinColumn()
  @Field(() => Accommodation)
  accommodation: Accommodation;

  @ManyToOne(() => Room, room => room.allotments, { eager: true })
  @JoinColumn()
  @Field(() => Room)
  room: Room;

  @Column()
  @Field()
  allottedBy: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
