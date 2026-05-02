import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await prisma.system_settings.findMany({
      where: { key: { in: ["EXPIRY_DATE_G10", "EXPIRY_DATE_G11"] } },
    });

    // Format into a clean object for the frontend
    const dates = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ success: true, dates });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching dates" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { targetGrade, newDate } = await request.json();

    if (!targetGrade || !newDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const settingKey = `EXPIRY_DATE_G${targetGrade}`;
    // Set to end of the selected day in local time before converting to UTC ISO string
    const targetDate = new Date(`${newDate}T23:59:59.000`);

    // Just update the settings table. No bulk updates to enrollments.
    await prisma.system_settings.upsert({
      where: { key: settingKey },
      update: { value: targetDate.toISOString() },
      create: { key: settingKey, value: targetDate.toISOString() },
    });

    return NextResponse.json({
      success: true,
      message: `Default expiry for Grade ${targetGrade} updated to ${newDate}.`,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
