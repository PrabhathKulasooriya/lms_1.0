import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutPageClient from "@/app/_components/CheckoutPageClient";

export const metadata = {
  title: "Checkout & Bank Payment – NexLearn",
  description: "Upload your bank transfer payment slip to complete course enrollments",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return <CheckoutPageClient />;
}
