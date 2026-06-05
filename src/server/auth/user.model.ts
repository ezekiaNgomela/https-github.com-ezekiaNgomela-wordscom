// Phase 28.4 - Auth Hardening: User Model + Premium + OTP System
// Core identity + workspace + subscription + email verification layer

export type UserPlan = "free" | "premium";

export interface OTPState {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  used: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;

  emailVerified: boolean;
  plan: UserPlan;

  workspaceIds: string[];
  defaultWorkspaceId?: string;

  role: "user" | "admin";

  otp?: OTPState;

  createdAt: number;
  updatedAt: number;
}

export function createBaseUser(params: {
  id: string;
  email: string;
  passwordHash: string;
}): User {
  const now = Date.now();

  return {
    id: params.id,
    email: params.email,
    passwordHash: params.passwordHash,

    emailVerified: false,
    plan: "free",

    workspaceIds: [],
    role: "user",

    createdAt: now,
    updatedAt: now,
  };
}
