import Dashboard from "./Dashboard";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// Wrap the Prisma call in unstable_cache
const getCourses = unstable_cache(
  async () => {
    console.log("Fetching courses from database...");
    return await prisma.courses.findMany({
      orderBy: { created_at: "desc" },
    });
  },
  ["courses-data"], 
  {
    tags: ["courses-data"], 
    revalidate: 86400, // 24 hours in seconds
  },
);

export default async function Page() {
  let courses = [];

  try {
    courses = await getCourses();
  } catch (error) {
    console.error("Error fetching courses:", error);
  }

  return <Dashboard courses={courses} />;
}
