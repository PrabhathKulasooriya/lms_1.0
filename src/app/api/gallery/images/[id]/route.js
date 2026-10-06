import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag, revalidatePath } from "next/cache";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// DELETE /api/gallery/images/[id] - Delete image from DB and Cloudinary
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return err("Unauthorized. Admin privileges required.", 403);
    }

    const { id } = await params;
    const imageId = parseInt(id);
    if (!imageId || isNaN(imageId)) {
      return err("Invalid image ID.");
    }

    const image = await prisma.gallery_images.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return err("Gallery image not found.", 404);
    }

    // Delete asset from Cloudinary
    if (image.public_id) {
      await deleteFromCloudinary(image.public_id);
    }

    // Delete from DB
    await prisma.gallery_images.delete({
      where: { id: imageId },
    });

    // Invalidate ISR cache
    revalidateTag("gallery-images");
    revalidatePath("/gallery");

    return ok({ message: "Image removed successfully." });
  } catch (error) {
    console.error("Gallery image deletion error:", error);
    return err(error.message || "Failed to delete image.", 500);
  }
}
