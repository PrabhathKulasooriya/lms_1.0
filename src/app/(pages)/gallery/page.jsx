import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import Gallery from "@/app/_components/Gallery";
import Footer from "@/app/_components/home_page/Footer";

// ============================================================================
// GALLERY CACHE CONFIGURATION
// ----------------------------------------------------------------------------
// Cache revalidation duration in seconds (Default: 86,400s = 24 hours / 1 day).
// Next.js caches the gallery data so Cloudinary and the database are NOT called
// on every page visit. Refetches happen at most once a day on user visits.
//
// To adjust cache time easily:
//   1. Change GALLERY_CACHE_SECONDS below (or set GALLERY_CACHE_REVALIDATE_SECONDS in .env)
//   2. Change 'revalidate' export below to match your desired seconds
//
// Examples:
//   - 86400  : 1 day (24 hours) [Default]
//   - 43200  : 12 hours
//   - 3600   : 1 hour
//   - 60     : 1 minute (for testing)
// ============================================================================
export const GALLERY_CACHE_SECONDS =
  Number(process.env.GALLERY_CACHE_REVALIDATE_SECONDS) || 86400;

// Revalidate once a day (86,400 seconds) for Next.js ISR route segment revalidation
export const revalidate = 86400;

export const metadata = {
  title: "Photo Gallery | NexLearn",
  description:
    "Explore our photo gallery featuring interactive seminars, Grade 10 & 11 Commerce classes, tute distributions, and student achievement ceremonies at NexLearn.",
};

// Cached gallery data fetcher: cached for the configured duration (default: 24h / 1 day),
// revalidating on visit after expiration.
const getCachedGalleryData = unstable_cache(
  async () => {
    try {
      // 1. Fetch images and categories from database (where uploaded Cloudinary images are saved)
      const [dbImages, dbCategories] = await Promise.all([
        prisma.gallery_images.findMany({
          orderBy: { created_at: "desc" },
        }),
        prisma.gallery_categories.findMany({
          orderBy: { name: "asc" },
        }),
      ]);

      const categories = dbCategories.map((c) => c.name);

      if (dbImages && dbImages.length > 0) {
        const formattedImages = dbImages.map((img) => ({
          id: img.id,
          src: img.image_url,
          title: img.category || "Gallery Photo",
          sinhalaTitle: "",
          category: img.category || "General",
          date: img.created_at
            ? new Date(img.created_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "",
          description: `NexLearn Gallery • ${img.category || "General"}`,
        }));

        return {
          images: formattedImages,
          categories: categories.length > 0 ? categories : null,
        };
      }

      // 2. If no DB records found, query Cloudinary directly for any uploaded assets under folder 'nexlearn/gallery'
      try {
        const cloudResult = await cloudinary.api.resources({
          type: "upload",
          prefix: "nexlearn/gallery",
          max_results: 100,
          context: true,
          tags: true,
        });

        if (cloudResult?.resources && cloudResult.resources.length > 0) {
          const cloudImages = cloudResult.resources.map((r, idx) => {
            const category = r.tags?.[0] || "General";
            return {
              id: r.asset_id || r.public_id || idx + 1,
              src: r.secure_url,
              title: r.context?.custom?.caption || "Gallery Photo",
              sinhalaTitle: "",
              category,
              date: r.created_at
                ? new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "",
              description: `NexLearn Gallery • ${category}`,
            };
          });

          const derivedCategories = Array.from(
            new Set([...categories, ...cloudImages.map((img) => img.category)])
          );

          return {
            images: cloudImages,
            categories: derivedCategories.length > 0 ? derivedCategories : null,
          };
        }
      } catch (cloudErr) {
        // If Cloudinary search API returns error or no resources, continue with empty
        console.warn("Direct Cloudinary search check:", cloudErr?.message);
      }

      // 3. No images found in DB or Cloudinary -> return empty array (NO dummy images!)
      return {
        images: [],
        categories: categories.length > 0 ? categories : null,
      };
    } catch (err) {
      console.error("Error fetching gallery from database / cloud:", err);
      return {
        images: [],
        categories: null,
      };
    }
  },
  ["gallery-images-cache"],
  { tags: ["gallery-images"], revalidate: GALLERY_CACHE_SECONDS }
);

export default async function GalleryPage() {
  const { images, categories } = await getCachedGalleryData();

  return (
    <main className="min-h-screen bg-slate-50 pt-20 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <Gallery images={images} categories={categories} />
      <Footer />
    </main>
  );
}
