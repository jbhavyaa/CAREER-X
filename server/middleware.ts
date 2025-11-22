import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(role: "student" | "admin") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ message: "Access forbidden" });
    }
    next();
  };
}
