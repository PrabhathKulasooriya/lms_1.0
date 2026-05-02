import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── POST  /api/enrollment/deactivate-expired ───────────────────────────────────
// Called daily by Vercel Cron (see vercel.json).
// Finds every enrollment that is still marked active but whose expires_at has
// already passed, and flips is_active to false in a single bulk update.
export async function GET(request) {
  // Guard: only allow Vercel Cron or your own server (via the shared secret).
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return err("Unauthorized", 401);
  }

  try {
    const now = new Date();

    const { count } = await prisma.enrollments.updateMany({
      where: {
        is_active: true,
        expires_at: { lte: now },
      },
      data: {
        is_active: false,
      },
    });

    console.log(
      `[deactivate-expired] Deactivated ${count} enrollment(s) at ${now.toISOString()}`,
    );
    return ok({ deactivated: count });
  } catch (error) {
    console.error("[POST /api/enrollment/deactivate-expired]", error);
    return err("Internal Server Error", 500);
  }
}
