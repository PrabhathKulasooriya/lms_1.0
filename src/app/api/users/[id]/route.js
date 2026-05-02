import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── PUT  /api/users/[id]  – update a user ─────────────────────
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

    const body = await request.json();
    const { first_name, last_name, mobile, gender, is_blocked, address } = body;

    // ── check user exists (shared for both update paths) ──────
    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // ── block/unblock only ────────────────────────────────────
    // When only is_blocked is sent, skip profile validation entirely
    if (is_blocked !== undefined && !first_name && !last_name) {
      const updatedUser = await prisma.users.update({
        where: { id },
        data: { is_blocked: Boolean(is_blocked) },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      return NextResponse.json(
        {
          success: true,
          message: `User ${is_blocked ? "blocked" : "unblocked"} successfully`,
          user: userWithoutPassword,
        },
        { status: 200 },
      );
    }

    // ── profile update – field-level validation ───────────────
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

    // ── perform profile update ────────────────────────────────
    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        ...(mobile && { mobile: mobile.trim() }),
        ...(gender && { gender: gender.toLowerCase() }),
        ...(address && { address: address.trim() }),
        // allow is_blocked to be updated alongside profile fields too
        ...(is_blocked !== undefined && { is_blocked: Boolean(is_blocked) }),
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
