import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function getUserFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get("apex_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId ?? null;
}