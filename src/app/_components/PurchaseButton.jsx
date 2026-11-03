"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";
import toast from "react-hot-toast";

export default function PurchaseButton({ courseId, isEnrolled, title }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const alreadyInCart = isInCart(courseId);

  const handleAddToCart = async () => {
    if (status === "unauthenticated" || !session) {
      toast.error("Please login to add courses to your cart");
      return router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    if (alreadyInCart) {
      return router.push("/cart");
    }

    setIsAdding(true);
    await addToCart(courseId, title);
    setIsAdding(false);
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

  if (alreadyInCart) {
    return (
      <button
        onClick={() => router.push("/cart")}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-[#0b408e] bg-[#0b408e]/8 border border-[#0b408e]/25 hover:bg-[#0b408e]/15 transition-all cursor-pointer shadow-xs"
      >
        <ShoppingCart size={15} />
        View in Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-xs"
    >
      {isAdding ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Adding to Cart...
        </>
      ) : (
        <>
          <ShoppingCart size={15} />
          Add to Cart
        </>
      )}
    </button>
  );
}
