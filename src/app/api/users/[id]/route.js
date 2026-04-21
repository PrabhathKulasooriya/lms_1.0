import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── PUT  /api/users/[id]  – update a user ─────────────────────
// Place this handler in  app/api/users/[id]/route.js
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
 
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

