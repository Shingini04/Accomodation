import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import bcrypt from "bcryptjs";

async function main() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const shaastraId = process.env.TEST_SHAASTRA_ID || "TEST12345";
  const password = process.env.TEST_PASSWORD || "Test@1234";
  const name = process.env.TEST_NAME || "Test User";
  const email = process.env.TEST_EMAIL || "test.user@example.com";
  const mobile = process.env.TEST_MOBILE || "9999999999";

  let user = await userRepo.findOne({ where: { shaastraId } });
  const hashed = await bcrypt.hash(password, 10);

  if (user) {
    console.log(`User with Shaastra ID ${shaastraId} already exists. Updating password and info.`);
    user.password = hashed;
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.verified = true;
    await userRepo.save(user);
  } else {
    user = userRepo.create({ shaastraId, name, email, mobile, password: hashed, verified: true });
    await userRepo.save(user);
    console.log(`Created user ${shaastraId}`);
  }

  console.log("Credentials:");
  console.log(`  Shaastra ID: ${shaastraId}`);
  console.log(`  Password: ${password}`);

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
