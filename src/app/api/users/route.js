import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import validator from "validator";
import { prisma } from "@/lib/prisma";


//create new user
export async function POST(request) {
  try {
    const { first_name, last_name, email, password, gender, mobile, address } = await request.json();

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !gender ||
      !mobile||
      !address
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
        address
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
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(
      100,
      parseInt(searchParams.get("limit") ?? "20", 10),
    );
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() ?? "";
    const role = searchParams.get("role")?.trim() ?? "";

    // ── Build where clause ────────────────────────────────────────────────
    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // ── Run count + page query in parallel ────────────────────────────────
    const [total, users] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          mobile: true,
          gender: true,
          role: true,
          address: true,
          is_email_verified: true,
          is_blocked: true,
          created_at: true,
          // password intentionally excluded
        },
      }),
    ]);

    return NextResponse.json({ users, total }, { status: 200 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
