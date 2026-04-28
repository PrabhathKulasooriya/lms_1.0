import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, type = "EMAIL_VERIFICATION" } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required." },
        { status: 400 },
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 },
      );

    const tokenRecord = await prisma.verificationToken.findFirst({
      where: { userId: user.id, type },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "No active code found." },
        { status: 400 },
      );
    }

    if (new Date() > tokenRecord.expires) {
      await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json({ message: "Code expired." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, tokenRecord.token);
    if (!isValid)
      return NextResponse.json({ message: "Invalid code." }, { status: 400 });

    // Handle database updates based on TYPE
    if (type === "EMAIL_VERIFICATION") {
      await prisma.$transaction([
        prisma.users.update({
          where: { id: user.id },
          data: { is_email_verified: true },
        }),
        prisma.verificationToken.delete({ where: { id: tokenRecord.id } }),
      ]);
      return NextResponse.json(
        { message: "Email verified successfully!" },
        { status: 200 },
      );
    } else if (type === "PASSWORD_RESET") {
      // DO NOT delete the token yet. Just return success.
      // The frontend will route to /reset-password, and that final API will delete the token.
      return NextResponse.json(
        { message: "Code verified. Proceed to reset password." },
        { status: 200 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Verification failed." },
      { status: 500 },
    );
  }
}
