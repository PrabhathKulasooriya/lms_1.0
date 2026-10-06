import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// DELETE /api/gallery/categories/[id] - Remove a category from dropdown list
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return err("Unauthorized. Admin privileges required.", 403);
    }

    const { id } = await params;
    const catId = parseInt(id);
    if (!catId || isNaN(catId)) {
      return err("Invalid category ID.");
    }

    const category = await prisma.gallery_categories.findUnique({
      where: { id: catId },
    });

    if (!category) {
      return err("Category not found.", 404);
    }

    await prisma.gallery_categories.delete({
      where: { id: catId },
    });

    return ok({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return err(error.message || "Failed to delete category", 500);
  }
}
