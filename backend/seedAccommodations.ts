import { AppDataSource } from "./src/data-source";
import { User } from "./src/entities/User";
import { Accommodation } from "./src/entities/Accommodation";

async function seedAccommodations() {
  await AppDataSource.initialize();
  console.log("Database initialized");

  const userRepo = AppDataSource.getRepository(User);
  const accoRepo = AppDataSource.getRepository(Accommodation);

  // Find existing test user
  let testUser = await userRepo.findOne({ where: { shaastraId: "TEST12345" } });
  
  if (!testUser) {
    console.log("Test user not found, creating...");
    testUser = userRepo.create({
      shaastraId: "TEST12345",
      name: "Test User",
      email: "test@shaastra.org",
      mobile: "9876543210",
      role: "participant",
      verified: true,
      password: "$2b$10$rI2qC5qM0hY7zxYx3xZxYeZ5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q", // Test@1234
    });
    await userRepo.save(testUser);
  }

  // Create additional test users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    let user = await userRepo.findOne({ where: { shaastraId: `SHAA${2025000 + i}` } });
    if (!user) {
      user = userRepo.create({
        shaastraId: `SHAA${2025000 + i}`,
        name: `Participant ${i}`,
        email: `participant${i}@example.com`,
        mobile: `98765432${i}0`,
        role: "participant",
        verified: true,
      });
      await userRepo.save(user);
    }
    users.push(user);
  }

  console.log("Users created/verified");

  // Create fake accommodations
  const genders = ["Male", "Female", "Other"];
  const organizations = ["IIT Madras", "IIT Bombay", "NIT Trichy", "Anna University", "VIT Chennai"];
  const hostelNames = ["Sharavati", "Narmada", "Alaknanda", "Mandakini"];

  // Clear existing accommodations if any
  const existingAccommodations = await accoRepo.find();
  if (existingAccommodations.length > 0) {
    await accoRepo.remove(existingAccommodations);
    console.log("Cleared existing accommodations");
  }

  const accommodations = [];
  
  // Create 15 paid accommodations
  for (let i = 0; i < 15; i++) {
    const user = i === 0 ? testUser : users[i % users.length];
    const numberOfPeople = Math.floor(Math.random() * 3) + 1; // 1-3 people
    const amount = numberOfPeople * 500;
    const arrivalDate = new Date(2025, 0, 2 + Math.floor(i / 3)); // Jan 2-6, 2025
    const departureDate = new Date(2025, 0, 5 + Math.floor(i / 3)); // Jan 5-9, 2025
    
    const acco = accoRepo.create({
      user: user,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: `199${5 + (i % 5)}-0${(i % 9) + 1}-15`,
      gender: genders[i % 3],
      idType: "Aadhar",
      idNumber: `${1234 + i}${5678 + i}${9012 + i}`,
      address: `${100 + i} Test Street, Chennai, Tamil Nadu - 60000${i % 10}`,
      organization: organizations[i % 5],
      arrivalDate: arrivalDate.toISOString(),
      departureDate: departureDate.toISOString(),
      numberOfPeople: numberOfPeople,
      accommodationDates: `${arrivalDate.toLocaleDateString()} - ${departureDate.toLocaleDateString()}`,
      amount: amount,
      paid: true,
      orderId: `order_${Date.now()}_${i}`,
      paymentId: `pay_${Date.now()}_${i}`,
      paymentSignature: `sig_${Date.now()}_${i}`,
      termsAndConditions: true,
      createdAt: new Date(Date.now() - (15 - i) * 86400000), // Spread over last 15 days
    });
    
    accommodations.push(acco);
  }

  // Create 5 pending (unpaid) accommodations
  for (let i = 15; i < 20; i++) {
    const user = users[(i - 15) % users.length];
    const numberOfPeople = Math.floor(Math.random() * 3) + 1;
    const amount = numberOfPeople * 500;
    const arrivalDate = new Date(2025, 0, 3 + Math.floor((i - 15) / 2));
    const departureDate = new Date(2025, 0, 6 + Math.floor((i - 15) / 2));
    
    const acco = accoRepo.create({
      user: user,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      dob: `199${5 + (i % 5)}-0${(i % 9) + 1}-15`,
      gender: genders[i % 3],
      idType: "Passport",
      idNumber: `P${1234567 + i}`,
      address: `${100 + i} Sample Road, Chennai, Tamil Nadu - 60000${i % 10}`,
      organization: organizations[i % 5],
      arrivalDate: arrivalDate.toISOString(),
      departureDate: departureDate.toISOString(),
      numberOfPeople: numberOfPeople,
      accommodationDates: `${arrivalDate.toLocaleDateString()} - ${departureDate.toLocaleDateString()}`,
      amount: amount,
      paid: false,
      orderId: `order_pending_${i}`,
      termsAndConditions: true,
      createdAt: new Date(Date.now() - (20 - i) * 43200000), // Recent orders
    });
    
    accommodations.push(acco);
  }

  await accoRepo.save(accommodations);
  console.log(`✅ Created ${accommodations.length} fake accommodations`);
  console.log(`   - 15 paid accommodations`);
  console.log(`   - 5 pending (unpaid) accommodations`);
  
  await AppDataSource.destroy();
}

seedAccommodations().catch(console.error);
