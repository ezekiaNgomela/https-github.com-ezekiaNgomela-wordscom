// Phase 31.0 - Email System (OTP + Notifications + Security Emails)
// Provides pluggable email delivery layer for WordCom SaaS

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(email: EmailPayload): Promise<boolean>;
}

// Fallback provider (dev mode)
export class ConsoleEmailProvider implements EmailProvider {
  async send(email: EmailPayload): Promise<boolean> {
    console.log("[EMAIL SENDING]");
    console.log("To:", email.to);
    console.log("Subject:", email.subject);
    console.log("Text:", email.text);
    console.log("HTML:", email.html);
    return true;
  }
}

// Main Email Service
export class EmailService {
  private static provider: EmailProvider = new ConsoleEmailProvider();

  static setProvider(provider: EmailProvider) {
    this.provider = provider;
  }

  static async sendOTP(email: string, otp: string) {
    return this.provider.send({
      to: email,
      subject: "Your WordCom OTP Code",
      text: `Your OTP code is ${otp}. It expires in 90 seconds.`,
      html: `<h2>WordCom Verification</h2><p>Your OTP code is <b>${otp}</b></p><p>Expires in 90 seconds.</p>`,
    });
  }

  static async sendWelcome(email: string) {
    return this.provider.send({
      to: email,
      subject: "Welcome to WordCom",
      text: "Your account has been created successfully.",
      html: `<h2>Welcome to WordCom</h2><p>Your account is ready to use.</p>`,
    });
  }

  static async sendPasswordReset(email: string, otp: string) {
    return this.provider.send({
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${otp}. It expires in 90 seconds.`,
      html: `<h2>Password Reset</h2><p>Your reset code is <b>${otp}</b></p><p>Expires in 90 seconds.</p>`,
    });
  }
}
