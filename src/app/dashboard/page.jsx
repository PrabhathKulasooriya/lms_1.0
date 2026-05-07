import Dashboard from "./Dashboard";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// STRICT DIRECTIVES: Tell Vercel NEVER to cache or prerender this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

const getCourses = unstable_cache(
  async () => {
    return await prisma.courses.findMany({
      orderBy: { created_at: "desc" },
    });
  },
  ["courses-data"],
  { tags: ["courses-data"], revalidate: 86400 },
);

const getUser = async (session) => {
  if (!session?.user?.id) return null;
  try {
    const userId = parseInt(session.user.id);
    return await prisma.users.findUnique({
      where: { id: userId },
    });
  } catch (error) {
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
    return [];
  }
};

export default async function Page() {
  const session = await auth();

  // If no session is found, immediately redirect (safe from Next.js builds)
  if (!session) {
    redirect("/login");
  }

  const [courses, user, enrollment] = await Promise.all([
    getCourses(),
    getUser(session),
    getEnrollments(session),
  ]);

  if (!user) {
    redirect("/login");
  }

  return <Dashboard courses={courses} user={user} enrollment={enrollment} />;
}
