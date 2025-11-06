import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Accommodation } from "./Accommodation";

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  shaastraId: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  mobile: string;

  @Column({ default: "participant" })
  @Field()
  role: string;

  @Column({ default: true })
  @Field()
  verified: boolean;

  @OneToMany(() => Accommodation, accommodation => accommodation.user)
  @Field(() => [Accommodation], { nullable: true })
  accommodations?: Accommodation[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;
}
