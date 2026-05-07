import Dashboard from "./Dashboard";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const getCourses = unstable_cache(
  async () => {
    return await prisma.courses.findMany({
      orderBy: { created_at: "desc" },
    });
  },
  ["courses-data"],
  { tags: ["courses-data"], revalidate: 86400 },
);

// We removed auth() and the try/catch around it from here!
const getUser = async (userId) => {
  if (!userId) return null;

  try {
    return await prisma.users.findUnique({
      where: { id: parseInt(userId) },
    });
  } catch (error) {
    console.error("Error fetching DB user:", error);
    return null;
  }
};

// We removed auth() and the try/catch around it from here too!
const getEnrollments = async (userId) => {
  if (!userId) return [];

  try {
    return await prisma.enrollments.findMany({
      where: { user_id: parseInt(userId) },
      include: { course: true },
    });
  } catch (error) {
    console.error("Error fetching DB enrollments:", error);
    return [];
  }
};

export default async function Page() {
  // 1. Call auth() at the TOP LEVEL, outside of any try/catch!
  // This allows Next.js to properly hear the "dynamic" signal.
  const session = await auth();

  // 2. If no session, redirect immediately during runtime
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 3. Fetch data using the userId
  const [courses, user, enrollment] = await Promise.all([
    getCourses(),
    getUser(userId),
    getEnrollments(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return <Dashboard courses={courses} user={user} enrollment={enrollment} />;
}
