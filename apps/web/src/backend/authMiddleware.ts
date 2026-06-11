import { verifyToken } from "./jwt";
import { db } from "./db";

/**
 * Auth Middleware
 * Protects routes using JWT
 */

export async function authMiddleware(req: any, res: any, next: any) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });

    const token = header.split(" ")[1];
    const decoded: any = verifyToken(token);

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ error: "Invalid user" });

    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
}