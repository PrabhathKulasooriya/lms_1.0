"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Check, ShoppingCart } from "lucide-react";

export default function PurchaseButton({ courseId, isEnrolled }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const onPurchase = () => {
    if (status === "unauthenticated" || !session) {
      toast.error("Please login to continue with the purchase");
      return router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    router.push(`/courses/${courseId}/checkout`);
  };

  if (isEnrolled) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium text-green-700 bg-green-50 border border-green-200 cursor-not-allowed"
      >
        <Check size={15} />
        Already Purchased
      </button>
    );
  }

  return (
    <button
      onClick={onPurchase}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-sm font-semibold transition-all"
    >
      <ShoppingCart size={15} />
      Purchase Now
    </button>
  );
}
