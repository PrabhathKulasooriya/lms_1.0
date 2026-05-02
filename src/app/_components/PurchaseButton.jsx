"use client";

import { handlePurchase } from "@/app/api/actions/checkout";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; 
import toast from "react-hot-toast";
import { Check } from "lucide-react";

export default function PurchaseButton({ courseId, price, title, isEnrolled }) {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const pathname = usePathname();

  const onPurchase = async () => {

    if (status === "unauthenticated" || !session) {
      toast.error("Please login to continue with the purchase");
      return router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    try {
      setLoading(true);
      // Construct the user's full name (adjust based on your NextAuth session structure)
      const fullName =
        session.user.name ||
        `${session.user.first_name} ${session.user.last_name}`;

      const url = await handlePurchase(courseId, session.user.id, price, title, session.user.email, fullName);
      if (url) window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <button
        disabled
        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full cursor-not-allowed"
      >
        <Check size={16} className="inline-block mr-1" />
       Already Purchased
      </button>
    );
  }

  return (
    <button
      onClick={onPurchase}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:bg-gray-400"
    >
      {loading ? "Redirecting..." : "Purchase"}
    </button>
  );
}
