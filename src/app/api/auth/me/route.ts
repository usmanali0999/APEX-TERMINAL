import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/infrastructure/db/client";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/infrastructure/auth/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("apex_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const users = await db
    .select()
    .from(schema.usersTable)
    .where(eq(schema.usersTable.id, payload.userId))
    .limit(1);

  const user = users[0];

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}