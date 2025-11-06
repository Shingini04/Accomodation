import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (process.env.DISABLE_EMAIL === "true") {
      console.log("Email sending disabled (DISABLE_EMAIL=true). Would send to:", options.to);
      return;
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.log("SendGrid not configured. Email would be sent to:", options.to);
      console.log("Subject:", options.subject);
      return;
    }

    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@shaastra.org",
      subject: options.subject,
      html: options.html,
      // allow tests to use SendGrid sandbox mode to avoid actual delivery
      ...(process.env.SENDGRID_SANDBOX === 'true' ? { mailSettings: { sandboxMode: { enable: true } } } : {}),
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    // Better error details for SendGrid errors
    // @ts-ignore
    if (error && error.response && error.response.body) {
      // @ts-ignore
      console.error('SendGrid response body:', error.response.body);
    }
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}
