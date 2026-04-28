import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, type UserDoc } from "./models.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-shopora-secret-change-me";
const JWT_TTL = "7d";

export interface JwtPayload {
  sub: string;
  role: "user" | "admin";
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(user: Pick<UserDoc, "_id" | "role">): string {
  const payload: JwtPayload = { sub: user._id.toString(), role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function userFromAuthHeader(header: string | undefined): Promise<UserDoc | null> {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  const payload = decodeToken(token);
  if (!payload) return null;
  const user = await UserModel.findById(payload.sub).lean<UserDoc>();
  return user;
}
