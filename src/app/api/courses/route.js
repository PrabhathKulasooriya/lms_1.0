import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

// POST /api/courses - Create a new course
export async function POST(request) {
  try {
    const { title, type, grade, price } = await request.json();

    if (!title || !type || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Title, type and price are required" },
        { status: 400 },
      );
    }

    if (!["theory", "pastpaper"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid course type" },
        { status: 400 },
      );
    }

    // Grade is required for theory, must be null for pastpaper
    if (type === "theory") {
      if (!grade) {
        return NextResponse.json(
          { success: false, message: "Grade is required for theory courses" },
          { status: 400 },
        );
      }
      const gradeNum = parseInt(grade);
      if (gradeNum < 1 || gradeNum > 13) {
        return NextResponse.json(
          { success: false, message: "Grade must be between 1 and 13" },
          { status: 400 },
        );
      }
    }

    const newCourse = await prisma.courses.create({
      data: {
        title,
        type,
        grade: type === "theory" ? parseInt(grade) : null,
        price: parseInt(price),
        is_published: false,
      },
    });

    revalidateTag("courses-data");
    return NextResponse.json(
      { success: true, course: newCourse },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PUT /api/courses - Update a course
export async function PUT(request) {
  try {
    const { id, title, type, grade, price, is_published } =
      await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    if (type && !["theory", "pastpaper"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid course type" },
        { status: 400 },
      );
    }

    if (type === "theory" && grade !== undefined) {
      const gradeNum = parseInt(grade);
      if (gradeNum < 1 || gradeNum > 13) {
        return NextResponse.json(
          { success: false, message: "Grade must be between 1 and 13" },
          { status: 400 },
        );
      }
    }

    // Build update payload with only the fields that were sent
    const data = {};

    if (title !== undefined) data.title = title;
    if (type !== undefined) data.type = type;
    if (price !== undefined) data.price = parseInt(price);
    if (is_published !== undefined) data.is_published = is_published;

    // Handle grade based on type
    if (type === "pastpaper") {
      data.grade = null; // always clear grade for pastpapers
    } else if (grade !== undefined) {
      data.grade = parseInt(grade);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.courses.update({
      where: { id },
      data,
    });

    revalidateTag("courses-data");
    return NextResponse.json(
      { success: true, course: updated },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE /api/courses - Delete a course
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Course ID is required" },
        { status: 400 },
      );
    }

    const deleted = await prisma.courses.delete({
      where: { id },
    });

    revalidateTag("courses-data");
    return NextResponse.json(
      { success: true, course: deleted },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
