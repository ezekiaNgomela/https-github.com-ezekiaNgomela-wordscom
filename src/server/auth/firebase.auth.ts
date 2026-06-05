// Phase 32.4 - Firebase Google Login Activation
// Verifies Firebase ID tokens and maps Google users into WordCom auth system

import admin from "firebase-admin";
import { UserRepository } from "../db/user.repo";
import crypto from "crypto";

let initialized = false;

function initFirebase() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase credentials");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
}

export interface FirebaseAuthResult {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
}

export class FirebaseAuthService {
  static async verifyGoogleToken(idToken: string): Promise<FirebaseAuthResult> {
    initFirebase();

    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      throw new Error("Google account missing email");
    }

    // Check if user exists
    let user = await UserRepository.findByEmail(decoded.email);

    // Auto-create user if not exists
    if (!user) {
      user = await UserRepository.create({
        id: crypto.randomUUID(),
        email: decoded.email,
        passwordHash: "GOOGLE_OAUTH",
        plan: "free",
        verified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
    }

    return {
      userId: user.id,
      email: user.email,
      name: decoded.name,
      picture: decoded.picture,
    };
  }
}
