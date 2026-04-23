import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id))
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 },
      );

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password)
      return NextResponse.json(
        { success: false, message: "Both passwords are required" },
        { status: 400 },
      );

    if (new_password.length < 6)
      return NextResponse.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
        { status: 400 },
      );

    const user = await prisma.users.findUnique({ where: { id } });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    const valid = await bcrypt.compare(current_password, user.password);
    if (!valid)
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 },
      );

    const hashed = await bcrypt.hash(new_password, 12);
    await prisma.users.update({ where: { id }, data: { password: hashed } });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("[POST /api/users/[id]/change-password]", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
