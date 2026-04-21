import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import { prisma } from "@/lib/prisma";


//create new user
export async function POST(request) {
  try {
    const { first_name, last_name, email, password, gender, mobile } = await request.json();

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !gender ||
      !mobile
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const mobilePattern = /^07\d{8}$/;
    if (!mobilePattern.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile format. Must be 10 digits starting with 07",
        },
        { status: 400 },
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists in the system" },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.users.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        gender,
        mobile,
        role: "student",
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error Registering User:", error.message || error);

    return NextResponse.json(
      { success: false, message: "Error registering user" },
      { status: 500 },
    );
  }
}

//get all users
export async function GET() {
  try {
    const allUsers = await prisma.users.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(allUsers, { status: 200 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// ── PUT  /api/users/[id]  – update a user ─────────────────────
// Place this handler in  app/api/users/[id]/route.js
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id, 10);
 
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 },
      );
    }
 
    const { first_name, last_name, mobile, gender } = await request.json();
 
    // ── field-level validation ────────────────────────────────
    if (!first_name || !last_name) {
      return NextResponse.json(
        { success: false, message: "First name and last name are required" },
        { status: 400 },
      );
    }
 
    if (mobile) {
      const mobilePattern = /^07\d{8}$/;
      if (!mobilePattern.test(mobile)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid mobile format. Must be 10 digits starting with 07",
          },
          { status: 400 },
        );
      }
    }
 
    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: "Invalid gender value" },
        { status: 400 },
      );
    }
 
    // ── check user exists ─────────────────────────────────────
    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
 
    // ── perform update ────────────────────────────────────────
    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        ...(mobile && { mobile: mobile.trim() }),
        ...(gender && { gender: gender.toLowerCase() }),
      },
    });
 
    const { password: _, ...userWithoutPassword } = updatedUser;
 
    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        user: userWithoutPassword,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error Updating User:", error.message || error);
    return NextResponse.json(
      { success: false, message: "Error updating user" },
      { status: 500 },
    );
  }
}
