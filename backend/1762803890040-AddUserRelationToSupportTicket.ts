import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelationToSupportTicket1762803890040 implements MigrationInterface {
    name = 'AddUserRelationToSupportTicket1762803890040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roomNumber" character varying NOT NULL, "hostelName" character varying NOT NULL, "roomType" character varying NOT NULL, "capacity" integer NOT NULL, "occupied" integer NOT NULL DEFAULT '0', "available" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "allotment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "allottedBy" character varying NOT NULL, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "accommodationAccoId" uuid, "roomId" uuid, CONSTRAINT "REL_c594f5ec538ede444c6cb7303f" UNIQUE ("accommodationAccoId"), CONSTRAINT "PK_f79a1c7405757a3e4c98a632515" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "accommodation" ("accoId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "mobile" character varying NOT NULL, "dob" character varying NOT NULL, "gender" character varying NOT NULL, "idType" character varying NOT NULL, "idNumber" character varying NOT NULL, "address" text NOT NULL, "organization" character varying NOT NULL, "arrivalDate" character varying NOT NULL, "departureDate" character varying NOT NULL, "numberOfPeople" integer NOT NULL, "guestGenders" text, "accommodationDates" character varying NOT NULL, "amount" double precision NOT NULL, "paid" boolean NOT NULL DEFAULT false, "orderId" character varying, "paymentId" character varying, "paymentSignature" character varying, "termsAndConditions" boolean NOT NULL DEFAULT false, "checkInAt" TIMESTAMP, "checkOutAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_4387d48505794f12461471fd512" PRIMARY KEY ("accoId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "shaastraId" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "mobile" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'participant', "verified" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1258e937f3c329ca77c6838a0a6" UNIQUE ("shaastraId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accommodationId" character varying NOT NULL, "orderId" character varying NOT NULL, "paymentId" character varying, "signature" character varying, "amount" double precision NOT NULL, "currency" character varying NOT NULL, "status" character varying NOT NULL, "method" character varying, "errorCode" character varying, "errorDescription" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_82c3470854cf4642dfb0d7150cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "support_ticket" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "category" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'open', "response" character varying, "respondedBy" character varying, "respondedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_506b4b9f579fb3adbaebe3950c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "allotment" ADD CONSTRAINT "FK_c594f5ec538ede444c6cb7303f9" FOREIGN KEY ("accommodationAccoId") REFERENCES "accommodation"("accoId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "allotment" ADD CONSTRAINT "FK_5a442bed9844a239465c15e30a1" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "accommodation" ADD CONSTRAINT "FK_c91ce0c30fb47def102a94aa17d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accommodation" DROP CONSTRAINT "FK_c91ce0c30fb47def102a94aa17d"`);
        await queryRunner.query(`ALTER TABLE "allotment" DROP CONSTRAINT "FK_5a442bed9844a239465c15e30a1"`);
        await queryRunner.query(`ALTER TABLE "allotment" DROP CONSTRAINT "FK_c594f5ec538ede444c6cb7303f9"`);
        await queryRunner.query(`DROP TABLE "support_ticket"`);
        await queryRunner.query(`DROP TABLE "payment_transaction"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "accommodation"`);
        await queryRunner.query(`DROP TABLE "allotment"`);
        await queryRunner.query(`DROP TABLE "room"`);
    }

}
