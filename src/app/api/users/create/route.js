import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import { prisma } from "@/lib/prisma";

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
