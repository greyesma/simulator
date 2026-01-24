import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user directly - use error handling for duplicate email
    // This avoids the race condition where two concurrent registrations
    // both pass the findUnique check before either creates the user
    try {
      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: "USER",
          emailVerified: new Date(),
        },
      });

      // Return user without password
      return NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      // Handle unique constraint violation (P2002) - email already exists
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
      // Re-throw other errors to be handled by outer catch
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
