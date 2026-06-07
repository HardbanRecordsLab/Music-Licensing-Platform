import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth.js";
import { findUserById } from "../users.js";

export function attachUserOptional(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      const user = findUserById(payload.userId);
      if (user) {
        (req as any).user = user;
      }
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Zły token autoryzacyjny" });
  }
  const user = findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: "Użytkownik nie istnieje" });
  }
  (req as any).user = user;
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }
    if (user.role !== role) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }
    next();
  };
}
