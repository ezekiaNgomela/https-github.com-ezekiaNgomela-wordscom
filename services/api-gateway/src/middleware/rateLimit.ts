import { Request, Response, NextFunction } from "express";

const hits: Record<string, { count: number; ts: number }> = {};

export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();

  if (!hits[ip]) {
    hits[ip] = { count: 1, ts: now };
    return next();
  }

  const record = hits[ip];

  // reset window after 60s
  if (now - record.ts > 60 * 1000) {
    record.count = 1;
    record.ts = now;
    return next();
  }

  record.count += 1;

  if (record.count > 60) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  next();
}
