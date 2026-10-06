import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

const DEFAULT_CATEGORIES = [
  "Theory",
  "Seminars",
  "Workshops",
  "Materials",
  "Achievements",
];

// GET /api/gallery/categories - Fetch all categories for the dropdown
export async function GET() {
  try {
    let categories = await prisma.gallery_categories.findMany({
      orderBy: { name: "asc" },
    });

    // If no categories exist yet, seed default categories
    if (categories.length === 0) {
      await prisma.gallery_categories.createMany({
        data: DEFAULT_CATEGORIES.map((name) => ({ name })),
        skipDuplicates: true,
      });
      categories = await prisma.gallery_categories.findMany({
        orderBy: { name: "asc" },
      });
    }

    return ok({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return err("Failed to fetch categories", 500);
  }
}

// POST /api/gallery/categories - Add a new category to the dropdown
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return err("Unauthorized. Admin privileges required.", 403);
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return err("Category / heading name cannot be empty.");
    }

    const cleanName = name.trim();

    // Check if category already exists
    const existing = await prisma.gallery_categories.findUnique({
      where: { name: cleanName },
    });

    if (existing) {
      return err("Category already exists.");
    }

    const newCategory = await prisma.gallery_categories.create({
      data: { name: cleanName },
    });

    return ok({ category: newCategory, message: "Category added successfully." }, 201);
  } catch (error) {
    console.error("Error creating category:", error);
    return err(error.message || "Failed to add category", 500);
  }
}
