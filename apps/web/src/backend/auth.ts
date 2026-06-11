import express from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { signToken } from "./jwt";

/**
 * Auth Routes
 * Register / Login system
 */

export const authRouter = express.Router();

/**
 * Register
 */
authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashed as any
      }
    });

    const token = signToken({ userId: user.id });

    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: "Auth error" });
  }
});

/**
 * Login
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, (user as any).password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user.id });

    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ error: "Auth error" });
  }
});