import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CartPageClient from "@/app/_components/CartPageClient";

export const metadata = {
  title: "Shopping Cart – NexLearn",
  description: "Review your selected courses in the shopping cart",
};

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/cart");
  }

  return <CartPageClient />;
}
