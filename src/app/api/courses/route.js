import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

// POST /api/courses - Create a new course
export async function POST(request) {
  try {
    const { title, grade, price } = await request.json();
    if (!title || !grade || !price) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const newCourse = await prisma.courses.create({
      data: {
        title,
        grade: parseInt(grade),
        price: parseFloat(price),
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
    const { id, title, grade, price, is_published } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    // Build update payload with only the fields that were sent
    const data = {};

    if (is_published !== undefined) {
      data.is_published = is_published;
    }

    if (title !== undefined) data.title = title;
    if (grade !== undefined) data.grade = parseInt(grade);
    if (price !== undefined) data.price = parseFloat(price);

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