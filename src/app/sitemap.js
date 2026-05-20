import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// 1. Reusing your exact cached database query layout to prevent over-fetching
const getSitemapCourses = unstable_cache(
  async () => {
    return await prisma.courses.findMany({
      where: { is_published: true },
      select: {
        id: true,
        updated_at: true,
      },
    });
  },
  ["sitemap-courses-data"],
  { tags: ["courses-data"], revalidate: 86400 }, // Clears automatically whenever "courses-data" revalidates
);

export default async function sitemap() {
  const baseUrl = "https://nexlearn.lk";

  // 2. Core Static Pages (Extracted from your route setup)
  const staticRoutes = [
    { url: "", changeFrequency: "daily", priority: 1.0 },
    { url: "/courses", changeFrequency: "daily", priority: 0.9 },
    { url: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { url: "/forgot-password", changeFrequency: "yearly", priority: 0.3 },
    { url: "/learnings", changeFrequency: "weekly", priority: 0.7 },
    { url: "/terms", changeFrequency: "monthly", priority: 0.4 },
    { url: "/verify-email", changeFrequency: "yearly", priority: 0.3 },
    { url: "/login", changeFrequency: "monthly", priority: 0.6 },
    { url: "/register", changeFrequency: "monthly", priority: 0.6 },
    { url: "/dashboard", changeFrequency: "daily", priority: 0.7 },
  ];

  const staticEntries = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 3. Dynamic Course Pages Mapping
  try {
    const courses = await getSitemapCourses();

    const dynamicCourseEntries = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      // Fallback to current date if updated_at is missing from the record instance
      lastModified: course.updated_at
        ? new Date(course.updated_at)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...dynamicCourseEntries];
  } catch (error) {
    console.error("Failed to compile sitemap dynamic paths:", error);
    // Gracefully fallback to static paths so the sitemap build doesn't crash the deployment
    return staticEntries;
  }
}
