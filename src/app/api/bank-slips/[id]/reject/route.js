import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

    const body = await request.json().catch(() => ({}));
    const { rejectionNote } = body;

    const bankSlip = await prisma.bank_slips.findUnique({
      where: { id: slipId },
    });

    if (!bankSlip) {
      return err("Bank slip record not found", 404);
    }

    await prisma.bank_slips.update({
      where: { id: slipId },
      data: {
        status: "REJECTED",
        rejection_note: rejectionNote || "Payment slip rejected by administrator",
      },
    });

    return ok({ message: "Bank slip rejected successfully" });
  } catch (error) {
    console.error("[POST /api/bank-slips/[id]/reject]", error);
    return err("Internal Server Error", 500);
  }
}
