import { AppDataSource } from "./src/data-source";
import { SupportTicket } from "./src/entities/SupportTicket";

async function seedSupportTickets() {
  await AppDataSource.initialize();
  console.log("Database initialized");

  const ticketRepo = AppDataSource.getRepository(SupportTicket);

  // Clear existing tickets
  const existingTickets = await ticketRepo.find();
  if (existingTickets.length > 0) {
    await ticketRepo.remove(existingTickets);
    console.log("Cleared existing tickets");
  }

  const categories = ["Room Issue", "Payment Issue", "Food Complaint", "General Query", "Facility Request"];
  const statuses = ["open", "in-progress", "resolved"];
  
  const sampleTickets = [
    { userId: "TEST12345", name: "Test User", email: "test@shaastra.org", category: "Room Issue", message: "AC not working in room SH015", status: "open" },
    { userId: "SHAA2025001", name: "Participant 1", email: "participant1@example.com", category: "Payment Issue", message: "Payment was deducted but booking not confirmed", status: "in-progress" },
    { userId: "SHAA2025002", name: "Participant 2", email: "participant2@example.com", category: "Food Complaint", message: "Food quality needs improvement", status: "resolved" },
    { userId: "SHAA2025003", name: "Participant 3", email: "participant3@example.com", category: "General Query", message: "What time is check-in available?", status: "resolved" },
    { userId: "SHAA2025004", name: "Participant 4", email: "participant4@example.com", category: "Facility Request", message: "Need extra bedding", status: "in-progress" },
    { userId: "TEST12345", name: "Test User", email: "test@shaastra.org", category: "General Query", message: "Can I extend my stay by one day?", status: "open" },
    { userId: "SHAA2025001", name: "Participant 1", email: "participant1@example.com", category: "Room Issue", message: "Room key card not working", status: "resolved" },
    { userId: "SHAA2025005", name: "Participant 5", email: "participant5@example.com", category: "Food Complaint", message: "Need vegetarian meal options", status: "open" },
  ];

  const tickets = [];
  
  for (let i = 0; i < sampleTickets.length; i++) {
    const ticket = ticketRepo.create({
      ...sampleTickets[i],
      createdAt: new Date(Date.now() - (sampleTickets.length - i) * 86400000 / 2), // Spread over last few days
    });
    tickets.push(ticket);
  }

  await ticketRepo.save(tickets);
  console.log(`✅ Created ${tickets.length} support tickets`);
  console.log(`   - Open: ${tickets.filter(t => t.status === 'open').length}`);
  console.log(`   - In Progress: ${tickets.filter(t => t.status === 'in-progress').length}`);
  console.log(`   - Resolved: ${tickets.filter(t => t.status === 'resolved').length}`);
  
  await AppDataSource.destroy();
}

seedSupportTickets().catch(console.error);
