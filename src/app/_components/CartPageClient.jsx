"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Trash2,
  BookOpen,
  PackageOpen,
  Loader2,
  ShieldCheck,
  CreditCard,
  PlusCircle,
} from "lucide-react";
import { useCart } from "./CartContext";

export default function CartPageClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    isLoading,
    fetchCart,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const checkoutItems = cartItems.filter((i) => !i.isAlreadyEnrolled);
  const totalPrice = checkoutItems.reduce(
    (sum, i) => sum + Number(i.course.price),
    0
  );

  // Loading view
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#0b408e]">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#0b408e]/5 border border-[#0b408e]/10 flex items-center justify-center mx-auto mb-6 text-[#0b408e]">
              <PackageOpen size={38} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Shopping Cart is Empty
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
              Explore our Grade 10 &amp; 11 Theory lessons, Past Paper discussions, and MCQ Practice batches to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-sm font-semibold transition-all shadow-sm"
              >
                <BookOpen size={16} />
                Explore Courses
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all"
              >
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0b408e] transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-[#0b408e]">1. Cart Review</span>
            <span className="text-gray-300">&rarr;</span>
            <span className="text-gray-400">2. Checkout &amp; Payment</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart size={22} className="text-[#0b408e]" />
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Shopping Cart
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Review the courses you have added to your cart before proceeding to checkout.
            </p>
          </div>

          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3.5 py-2 rounded-xl border border-red-200 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            Clear Cart
          </button>
        </div>

        {/* Cart Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Courses List (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-1 bg-[#9fe03c]" />
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    Course Items ({cartItems.length})
                  </span>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1 text-xs text-[#0b408e] hover:underline font-semibold"
                  >
                    <PlusCircle size={13} /> Add More Courses
                  </Link>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const { course, isAlreadyEnrolled } = item;
                    const price = Number(course.price).toLocaleString();

                    const typeLabel =
                      course.type === "pastpaper"
                        ? "Past Paper Discussion"
                        : course.type === "mcq"
                        ? "MCQ Practice Batch"
                        : course.grade
                        ? `Grade ${course.grade} Theory`
                        : "Theory";

                    return (
                      <div
                        key={item.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-[#0b408e]/8 flex items-center justify-center shrink-0 mt-0.5 text-[#0b408e]">
                            <BookOpen size={20} />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/courses/${course.id}`}
                              className="text-sm font-bold text-gray-900 hover:text-[#0b408e] transition-colors leading-snug line-clamp-2"
                            >
                              {course.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {typeLabel}
                              </span>
                              {course.grade && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0b408e]/6 text-[#0b408e]">
                                  Grade {course.grade}
                                </span>
                              )}
                              {isAlreadyEnrolled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Already Enrolled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 gap-2 shrink-0">
                          <span className="text-sm font-extrabold text-[#0b408e]">
                            {isAlreadyEnrolled ? (
                              <span className="text-xs text-emerald-600 font-semibold">Enrolled</span>
                            ) : (
                              `LKR ${price}`
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(course.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove from cart"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-xs text-blue-900">
              <ShieldCheck size={18} className="text-[#0b408e] shrink-0" />
              <p>
                Purchasing multiple courses? You can complete payment for all courses in a single bank transfer on the next page.
              </p>
            </div>
          </div>

          {/* Cart Summary & Proceed to Checkout (lg:col-span-4) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide pb-4 border-b border-gray-100">
                Cart Summary
              </h2>

              <div className="py-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Selected Courses</span>
                  <span className="font-semibold text-gray-900">{checkoutItems.length}</span>
                </div>

                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-gray-500 text-[11px]">
                    <span className="truncate max-w-[180px]">{item.course.title}</span>
                    <span className="font-medium text-gray-700 shrink-0 ml-2">
                      LKR {Number(item.course.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Total Price
                </span>
                <span className="text-2xl font-black text-[#0b408e]">
                  LKR {totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                disabled={checkoutItems.length === 0}
                className="w-full py-3.5 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                Next: Upload bank payment transfer slip
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
