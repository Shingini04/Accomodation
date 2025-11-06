import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { SupportTicket } from "../entities/SupportTicket";
import { CreateSupportTicketInput, RespondToTicketInput } from "../inputs/SupportInput";
import { sendEmail } from "../services/emailService";

@Resolver(SupportTicket)
export class SupportResolver {
  @Query(() => [SupportTicket])
  async getSupportTickets(): Promise<SupportTicket[]> {
    const ticketRepo = AppDataSource.getRepository(SupportTicket);
    return await ticketRepo.find({ order: { createdAt: "DESC" } });
  }

  @Query(() => [SupportTicket])
  async getUserSupportTickets(@Arg("userId") userId: string): Promise<SupportTicket[]> {
    const ticketRepo = AppDataSource.getRepository(SupportTicket);
    return await ticketRepo.find({ where: { userId }, order: { createdAt: "DESC" } });
  }

  @Query(() => SupportTicket, { nullable: true })
  async getSupportTicket(@Arg("id") id: string): Promise<SupportTicket | null> {
    const ticketRepo = AppDataSource.getRepository(SupportTicket);
    return await ticketRepo.findOne({ where: { id } });
  }

  @Mutation(() => SupportTicket)
  async createSupportTicket(@Arg("data") data: CreateSupportTicketInput): Promise<SupportTicket> {
    const ticketRepo = AppDataSource.getRepository(SupportTicket);

    const ticket = ticketRepo.create({
      userId: data.userId,
      name: data.name,
      email: data.email,
      category: data.category,
      message: data.message,
      status: "open",
    });

    await ticketRepo.save(ticket);

    await sendEmail({
      to: data.email,
      subject: "Support Ticket Created - Shaastra",
      html: `
        <h2>Support Ticket Created</h2>
        <p>Dear ${data.name},</p>
        <p>Your support ticket has been created successfully.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Ticket ID: ${ticket.id}</li>
          <li>Category: ${data.category}</li>
          <li>Status: Open</li>
        </ul>
        <p>We will respond to your query shortly.</p>
        <p>Best regards,<br>Shaastra Support Team</p>
      `,
    });

    return ticket;
  }

  @Mutation(() => SupportTicket)
  async respondToTicket(@Arg("data") data: RespondToTicketInput): Promise<SupportTicket> {
    const ticketRepo = AppDataSource.getRepository(SupportTicket);

    const ticket = await ticketRepo.findOne({ where: { id: data.ticketId } });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.response = data.response;
    ticket.respondedBy = data.respondedBy;
    ticket.respondedAt = new Date();
    ticket.status = "resolved";

    await ticketRepo.save(ticket);

    await sendEmail({
      to: ticket.email,
      subject: "Support Ticket Resolved - Shaastra",
      html: `
        <h2>Support Ticket Update</h2>
        <p>Dear ${ticket.name},</p>
        <p>Your support ticket has been resolved.</p>
        <p><strong>Your Query:</strong></p>
        <p>${ticket.message}</p>
        <p><strong>Response:</strong></p>
        <p>${data.response}</p>
        <p>If you have any further questions, please create a new ticket.</p>
        <p>Best regards,<br>Shaastra Support Team</p>
      `,
    });

    return ticket;
  }
}
