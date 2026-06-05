// Phase 28.2 - Auth Service (Register / Login / OTP Flow)
// Core runtime authentication logic for WordCom SaaS

import crypto from "crypto";
import { hashPassword, verifyPassword } from "./password";
import { createToken } from "./jwt";
import { User, createBaseUser } from "./user.model";

// Temporary in-memory user store (replace with DB in Phase 29)
const users = new Map<string, User>();

// OTP config
const OTP_TTL_MS = 90 * 1000; // 1.30 minutes

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function sendEmail(email: string, subject: string, message: string) {
  // Stub: replace with real provider (SendGrid, SES, etc)
  console.log(`[EMAIL to=${email}] ${subject}: ${message}`);
}

export class AuthService {
  // REGISTER USER
  static register(email: string, password: string) {
    const existing = Array.from(users.values()).find(u => u.email === email);
    if (existing) throw new Error("User already exists");

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    const user = createBaseUser({ id, email, passwordHash });
    users.set(id, user);

    // send OTP for email verification
    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    user.otp = {
      codeHash: otpHash,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      used: false,
    };

    sendEmail(
      email,
      "Verify your WordCom account",
      `Your OTP code is ${otp}. It expires in 90 seconds.`
    );

    return { userId: id, message: "OTP sent to email" };
  }

  // VERIFY OTP
  static verifyOTP(userId: string, code: string) {
    const user = users.get(userId);
    if (!user || !user.otp) throw new Error("Invalid request");

    const otp = user.otp;

    if (otp.used) throw new Error("OTP already used");
    if (Date.now() > otp.expiresAt) throw new Error("OTP expired");

    const hashed = hashOTP(code);

    otp.attempts += 1;
    if (otp.attempts > 5) throw new Error("Too many attempts");

    if (hashed !== otp.codeHash) throw new Error("Invalid OTP");

    otp.used = true;
    user.emailVerified = true;

    return { success: true };
  }

  // LOGIN USER
  static login(email: string, password: string) {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) throw new Error("User not found");

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }

    const token = createToken({
      userId: user.id,
      workspaceId: user.defaultWorkspaceId || "default",
      role: user.role,
    });

    return { token, user };
  }
}
