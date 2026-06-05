// Phase 32 - Real Email Provider: SendGrid Integration
// Replace ConsoleEmailProvider in production for real OTP delivery

import sgMail from "@sendgrid/mail";
import type { EmailProvider, EmailPayload } from "../email.service";

export class SendGridEmailProvider implements EmailProvider {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(email: EmailPayload): Promise<boolean> {
    try {
      await sgMail.send({
        to: email.to,
        from: process.env.SMTP_FROM || "no-reply@wordcom.app",
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      return true;
    } catch (err) {
      console.error("SendGrid email failed:", err);
      return false;
    }
  }
}

// Helper to activate provider
export function initSendGridEmail() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("Missing SENDGRID_API_KEY");
  }

  const { EmailService } = require("../email.service");
  const provider = new SendGridEmailProvider(process.env.SENDGRID_API_KEY);
  EmailService.setProvider(provider);
}
