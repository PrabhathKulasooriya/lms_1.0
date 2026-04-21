import Dashboard from "./Dashboard";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import {auth} from "@/auth";

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

const getUser = async () => {
  try {
    const session = await auth();
    const userId = parseInt(session?.user?.id) ;

    return await prisma.users.findUnique({
      where: { id: userId },
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export default async function Page() {
  let courses = [];
  let user = null;

  try {
    courses = await getCourses();
    user = await getUser();
  } catch (error) {
    console.error("Error fetching courses:", error);
  }

  return <Dashboard courses={courses} user={user} />;
}
