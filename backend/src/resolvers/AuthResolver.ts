import { Resolver, Mutation, Arg, ObjectType, Field } from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace_with_real_secret";

@ObjectType()
class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthPayload)
  async login(@Arg("shaastraId") shaastraId: string, @Arg("password") password: string): Promise<AuthPayload> {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { shaastraId } });
    if (!user) {
      throw new Error("Invalid Shaastra ID or password");
    }

    if (!user.password) {
      throw new Error("User has no password set. Please contact admin to set a password.");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Shaastra ID or password");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // send login email (non-blocking)
    try {
      // lazy-import to avoid circular dependency issues
      const { sendEmail } = await import("../services/emailService");
      sendEmail({
        to: user.email,
        subject: "Shaastra Portal - Login Successful",
        html: `<p>Hi ${user.name},</p><p>You have successfully logged into the Shaastra Accommodation Portal.</p>`,
      }).catch((e) => console.error("Login email failed:", e));
    } catch (e) {
      console.error("Failed to send login email:", e);
    }

    return { token, user };
  }

  // Optional helper to create a user (admin use). Not exposed publicly in UI by default.
  @Mutation(() => User)
  async registerUser(
    @Arg("shaastraId") shaastraId: string,
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("mobile") mobile: string,
    @Arg("password") password: string
  ): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { shaastraId } });
    if (existing) {
      throw new Error("User with this Shaastra ID already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo.create({ shaastraId, name, email, mobile, password: hashed, verified: true });
    return await userRepo.save(user);
  }
}
