import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { revalidateTag, revalidatePath } from "next/cache";

const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// GET /api/gallery/images - Fetch all gallery images
export async function GET() {
  try {
    const images = await prisma.gallery_images.findMany({
      orderBy: { created_at: "desc" },
    });
    return ok({ images });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return err("Failed to fetch gallery images", 500);
  }
}

// POST /api/gallery/images - Upload image to Cloudinary and save to database
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return err("Unauthorized. Admin privileges required.", 403);
    }

    const formData = await request.formData();
    const file = formData.get("image");
    const category = formData.get("category");

    if (!file || typeof file === "string") {
      return err("Image file is required.");
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return err("Category / heading name is required.");
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return err("Invalid file format. Please upload JPG, PNG, or WEBP.");
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Custom filename: gallery_timestamp_random
    const timestamp = Math.floor(Date.now() / 1000);
    const random4Digits = Math.floor(1000 + Math.random() * 9000);
    const customFilename = `gallery_${timestamp}_${random4Digits}`;

    // Upload to Cloudinary folder "nexlearn/gallery"
    const uploadResult = await uploadToCloudinary(
      buffer,
      "nexlearn/gallery",
      customFilename
    );

    // Save record to DB
    const newImage = await prisma.gallery_images.create({
      data: {
        image_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        category: category.trim(),
      },
    });

    // Automatically ensure the category exists in gallery_categories table
    await prisma.gallery_categories.upsert({
      where: { name: category.trim() },
      update: {},
      create: { name: category.trim() },
    });

    // Invalidate ISR cache so the public gallery updates
    revalidateTag("gallery-images");
    revalidatePath("/gallery");

    return ok({ image: newImage, message: "Image uploaded successfully." }, 201);
  } catch (error) {
    console.error("Gallery image upload error:", error);
    return err(error.message || "Failed to upload image.", 500);
  }
}
