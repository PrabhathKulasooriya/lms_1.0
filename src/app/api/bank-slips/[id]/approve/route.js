import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEnrollmentApprovedEmail } from "@/lib/email";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return err("Unauthorized. Admin access required.", 403);
    }

    const { id } = await params;
    const slipId = parseInt(id);
    if (!slipId || isNaN(slipId)) {
      return err("Invalid slip ID");
    }

    // Fetch Bank Slip
    const bankSlip = await prisma.bank_slips.findUnique({
      where: { id: slipId },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        course: { select: { id: true, title: true, grade: true, type: true } },
      },
    });

    if (!bankSlip) {
      return err("Bank slip record not found", 404);
    }

    if (bankSlip.status === "APPROVED") {
      return err("This payment slip has already been approved");
    }

    // Determine Expiry Date for Enrollment
    let expiresAt = null;
    if (bankSlip.course.grade) {
      const settingKey = `EXPIRY_DATE_G${bankSlip.course.grade}`;
      const gradeExpirySetting = await prisma.system_settings.findUnique({
        where: { key: settingKey },
      });
      if (gradeExpirySetting) {
        expiresAt = new Date(gradeExpirySetting.value);
      }
    }

    // Check existing enrollment
    const existingEnrollment = await prisma.enrollments.findUnique({
      where: {
        user_id_course_id: {
          user_id: bankSlip.user_id,
          course_id: bankSlip.course_id,
        },
      },
    });

    // Run DB update + enrollment in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update slip status to APPROVED
      await tx.bank_slips.update({
        where: { id: slipId },
        data: { status: "APPROVED" },
      });

      // 2. Create or activate enrollment if not present
      if (!existingEnrollment) {
        await tx.enrollments.create({
          data: {
            user_id: bankSlip.user_id,
            course_id: bankSlip.course_id,
            expires_at: expiresAt,
            is_active: true,
          },
        });
      } else if (!existingEnrollment.is_active) {
        await tx.enrollments.update({
          where: { id: existingEnrollment.id },
          data: { is_active: true, expires_at: expiresAt },
        });
      }
    });

    // Format full course title with Grade / Type
    const fullCourseTitle = `${bankSlip.course.title}${bankSlip.course.grade ? ` (Grade ${bankSlip.course.grade})` : ""}${bankSlip.course.type === "pastpaper" ? " (Past Paper)" : ""}`;

    // Send Approval Email to Student
    const userName = `${bankSlip.user.first_name || ""} ${bankSlip.user.last_name || ""}`.trim() || "Student";
    sendEnrollmentApprovedEmail(bankSlip.user.email, userName, fullCourseTitle);

    return ok({ message: "Bank slip approved and student enrolled successfully!" });
  } catch (error) {
    console.error("[POST /api/bank-slips/[id]/approve]", error);
    return err("Internal Server Error: " + (error.message || ""), 500);
  }
}
