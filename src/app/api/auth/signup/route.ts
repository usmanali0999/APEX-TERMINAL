import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema } from "@/infrastructure/db/client";
import { eq } from "drizzle-orm";
import { signToken } from "@/infrastructure/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const now = Date.now();

    await db.insert(schema.usersTable).values({
      id: userId,
      email,
      name,
      passwordHash,
      createdAt: now,
    });

    await db.insert(schema.portfoliosTable).values({
      id: `portfolio-${userId}`,
      userId,
      balance: 100000,
      totalPnl: 0,
      updatedAt: now,
    });

    const token = signToken({ userId, email });

    const res = NextResponse.json({
      success: true,
      user: { id: userId, email, name },
    });

    res.cookies.set("apex_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}