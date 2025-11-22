import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from './src/services/emailService';

async function main() {
  const to = process.env.TEST_EMAIL_TO || 'lahirishingini@gmail.com';
  try {
    await sendEmail({
      to,
      subject: 'Test Email — Accommodation Portal',
      html: `
        <h3>Test Email</h3>
        <p>If you received this, the SendGrid integration is working.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    console.log('sendTestEmail: done');
  } catch (err: any) {
    console.error('sendTestEmail: failed', err);
    process.exit(1);
  }
}

main();
