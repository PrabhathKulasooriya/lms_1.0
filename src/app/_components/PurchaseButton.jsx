"use client";

import { handlePurchase } from "@/app/api/actions/checkout";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react"; // Import useSession to check authentication status in use client component
import toast from "react-hot-toast";

export default function PurchaseButton({ courseId, price, title, isEnrolled }) {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession(); // Get session and authentication status
  const router = useRouter();
  const pathname = usePathname();

  const onPurchase = async () => {

    if (status === "unauthenticated" || !session) {
      toast.error("Please login to continue with the purchase");

      return router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    try {
      setLoading(true);
      const url = await handlePurchase(courseId, session.user.id, price, title);
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
        className="px-4 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-xl cursor-not-allowed"
      >
        Purchased
      </button>
    );
  }

  return (
    <button
      onClick={onPurchase}
      disabled={loading}
      className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:bg-gray-400"
    >
      {loading ? "Redirecting..." : "Purchase"}
    </button>
  );
}
