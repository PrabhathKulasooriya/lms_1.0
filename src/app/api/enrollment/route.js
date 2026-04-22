import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";


// ── POST  /api/enrollment  – enroll a user in a course ─────────────────────
export async function POST(request) {

    const { userId, courseId } = await request.json();

    if(!userId || !courseId) {
        return NextResponse.json(
            { success: false, message: "User ID and Course ID are required" },
            { status: 400 },
        );
    }

    try {
        const alreadyEnrolled = await prisma.enrollments.findFirst({
            where: {
                user_id: parseInt(userId),
                course_id: parseInt(courseId),
            },
        });

        if (alreadyEnrolled) {
            return NextResponse.json(
                { success: false, message: "User is already enrolled in the course" },
                { status: 400 },
            );
        }

        const enrollment = await prisma.enrollments.create({
            data: {
                user_id: parseInt(userId),
                course_id: parseInt(courseId),
            },
        });

        return NextResponse.json(
            { success: true, message: "Enrollment successful", enrollment },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error enrolling user:", error.message || error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 },    
            );
        }
    }

