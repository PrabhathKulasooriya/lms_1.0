import Dashboard from "./Dashboard";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Force this page to render on every request (required for auth)
export const dynamic = "force-dynamic";

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
    revalidate: 86400,
  },
);

const getUser = async (session) => {
  if (!session?.user?.id) return null;
  try {
    const userId = parseInt(session.user.id);
    return await prisma.users.findUnique({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

const getEnrollments = async (session) => {
  if (!session?.user?.id) return [];
  try {
    const userId = parseInt(session.user.id);
    return await prisma.enrollments.findMany({
      where: { user_id: userId },
      include: { course: true },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
};

export default async function Page() {
  const session = await auth();

  // 1. Protect the route: If no session, go to login
  if (!session) {
    redirect("/login");
  }

  const [courses, user, enrollment] = await Promise.all([
    getCourses(),
    getUser(session),
    getEnrollments(session),
  ]);

  // 2. Secondary protection: If user is not in DB
  if (!user) {
    redirect("/login");
  }

  return <Dashboard courses={courses} user={user} enrollment={enrollment} />;
}
