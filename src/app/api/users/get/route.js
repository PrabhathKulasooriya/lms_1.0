import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET() {
  try {
    
    const allUsers = await prisma.users.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(allUsers, { status: 200 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
