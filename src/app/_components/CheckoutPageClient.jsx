"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MessageCircle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Banknote,
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Clock,
  Copy,
  Check,
  CreditCard,
  PackageOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "./CartContext";

// ─── Contact details ──────────────────────────────────────────────────────────
const PHONE = "071 156 2002";
const PHONE_RAW = "0711562002";
const WHATSAPP = "94711562002";
const EMAIL = "info@nexlearn.lk";

// ─── Supported Banks Config ─────────────────────────────────────────────────
const BANKS = [
  {
    id: "boc",
    name: "Bank of Ceylon (BOC)",
    shortName: "BOC",
    branch: "Bingiriya",
    accountNumber: "9856593",
    accountName: "R.M.H.K.Rathnayaka",
    logo: "/banks/boc.png",
    accentText: "text-amber-700",
    accentBg: "bg-amber-500/10",
  },
  {
    id: "commercial",
    name: "Commercial Bank",
    shortName: "COMBANK",
    branch: "Hettipola",
    accountNumber: "8019382728",
    accountName: "R.M.H.K.Rathnayaka",
    logo: "/banks/commercial.png",
    accentText: "text-blue-700",
    accentBg: "bg-blue-600/10",
  },
  {
    id: "hnb",
    name: "Hatton National Bank (HNB)",
    shortName: "HNB",
    branch: "Hettipola",
    accountNumber: "152020099202",
    accountName: "R.M.H.K.Rathnayaka",
    logo: "/banks/hnb.png",
    accentText: "text-orange-700",
    accentBg: "bg-orange-500/10",
  },
];

function ContactRow({ icon: Icon, href, label, color = "text-[#0b408e]" }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={`flex items-center gap-2 text-xs text-gray-600 hover:${color} transition-colors font-medium`}
    >
      <Icon size={12} className={color} />
      {label}
    </a>
  );
}

function BankLogo({ bank, size = "md" }) {
  const [hasError, setHasError] = useState(false);
  const sizeClasses =
    size === "lg" ? "w-14 h-14 text-sm" : "w-11 h-11 text-xs";

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative`}
    >
      {!hasError && bank.logo ? (
        <img
          src={bank.logo}
          alt={bank.name}
          className="w-full h-full object-contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <span
          className={`font-bold tracking-tight text-center ${
            bank.accentText || "text-gray-700"
          }`}
        >
          {bank.shortName}
        </span>
      )}
    </div>
  );
}

export default function CheckoutPageClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const { cartItems, isLoading, fetchCart, clearCart } = useCart();

  const [selectedBankModal, setSelectedBankModal] = useState(null);
  const [copiedField, setCopiedField] = useState(false);

  // Bank slip upload form states
  const [slipFile, setSlipFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrderInfo, setSubmittedOrderInfo] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Modal Escape key & overflow lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedBankModal(null);
    };
    if (selectedBankModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBankModal]);

  const handleCopyAccount = (accountNumber) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(accountNumber);
      setCopiedField(true);
      toast.success("Account number copied to clipboard!");
      setTimeout(() => setCopiedField(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSlipFile(file);
    setIsSubmitted(false);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSlipFile(null);
    setPreviewUrl(null);
    setIsSubmitted(false);
  };

  // Only count items not already enrolled
  const checkoutItems = cartItems.filter((i) => !i.isAlreadyEnrolled);
  const totalPrice = checkoutItems.reduce(
    (sum, i) => sum + Number(i.course.price),
    0
  );

  const handleSubmitSlip = async (e) => {
    e.preventDefault();

    if (!slipFile) {
      toast.error("Please select your bank transfer slip before submitting.");
      return;
    }

    if (checkoutItems.length === 0) {
      toast.error("No valid courses in cart to purchase.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("file", slipFile);
      formData.append("amount", totalPrice.toString());
      formData.append("isCartCheckout", "true");

      const cartPayload = checkoutItems.map((item) => ({
        courseId: item.course_id,
        price: Number(item.course.price),
      }));
      formData.append("cartItems", JSON.stringify(cartPayload));

      const res = await fetch("/api/bank-slips", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit payment slip");
      }

      setSubmittedOrderInfo({
        count: checkoutItems.length,
        total: totalPrice,
        fileName: slipFile.name,
      });
      setIsSubmitted(true);
      toast.success("Payment slip submitted successfully!");

      // Clear cart items in DB and context
      await clearCart();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload payment slip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading view
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#0b408e]">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Empty cart view (when not submitted)
  if (!isLoading && cartItems.length === 0 && !isSubmitted) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <PackageOpen size={30} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              No Courses in Cart
            </h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              Please add courses to your cart before proceeding to checkout.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/cart"
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"
              >
                Go to Cart
              </Link>
              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-[#0b408e] text-white text-xs font-semibold hover:bg-[#0b408e]/90 transition-all shadow-xs"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0b408e] transition-colors font-medium"
          >
            <ArrowLeft size={14} />
            Back to Cart
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link href="/cart" className="text-gray-400 hover:underline">1. Cart Review</Link>
            <span className="text-gray-300">&rarr;</span>
            <span className="text-[#0b408e]">2. Checkout &amp; Payment</span>
          </div>
        </div>

        {/* ── SUCCESS BANNER (when payment slip is submitted) ── */}
        {isSubmitted && submittedOrderInfo ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 md:p-10 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={36} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-emerald-950">
                Payment Slip Submitted Successfully!
              </h2>
              <p className="text-xs md:text-sm text-emerald-700 mt-2 max-w-lg mx-auto leading-relaxed">
                We have received your bank transfer receipt for{" "}
                <strong>{submittedOrderInfo.count} course{submittedOrderInfo.count > 1 ? "s" : ""}</strong> (Total: LKR {submittedOrderInfo.total.toLocaleString()}).
                Our administrative team will review and activate your courses within 24 hours.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 py-2 px-4 rounded-xl w-fit mx-auto border border-emerald-200">
              <Clock size={14} />
              Status: Pending Verification
            </div>

            {submittedOrderInfo.fileName && (
              <p className="text-[11px] text-emerald-600 italic">
                Attached Receipt: {submittedOrderInfo.fileName}
              </p>
            )}

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 rounded-xl bg-[#0b408e] text-white text-xs font-bold hover:bg-[#0b408e]/90 transition-all shadow-xs"
              >
                Go to Student Dashboard &rarr;
              </Link>
              <Link
                href="/courses"
                className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Total Summary Banner ── */}
            <div className="mb-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Checkout Summary
                </span>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Total Payable:{" "}
                  <span className="text-[#0b408e]">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Combined payment for {checkoutItems.length} selected course{checkoutItems.length !== 1 ? "s" : ""}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/cart"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0b408e] bg-[#0b408e]/8 hover:bg-[#0b408e]/12 transition-colors"
                >
                  Edit Cart Items
                </Link>
              </div>
            </div>

            {/* Main Grid: Left = Bank Transfer & Terms, Right = Upload Slip */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── LEFT: Bank Accounts & Terms (lg:col-span-7) ── */}
              <div className="lg:col-span-7 space-y-6">
                {/* Bank Accounts */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#9fe03c]/15 flex items-center justify-center shrink-0 text-[#4a7a1e]">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">1. Transfer to Our Bank Account</h2>
                      <p className="text-[11px] text-gray-400">Click any bank below to view account number and branch</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-2.5">
                      {BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankModal(bank)}
                          className="w-full flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-blue-50/40 rounded-2xl border border-gray-200/80 hover:border-[#0b408e]/40 shadow-2xs transition-all group text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <BankLogo bank={bank} size="md" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 group-hover:text-[#0b408e] transition-colors truncate">
                                {bank.name}
                              </p>
                              <p className="text-[10px] text-gray-400">{bank.branch} Branch</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-[#0b408e] group-hover:underline shrink-0">
                            View Details &rarr;
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex gap-2.5 text-xs text-blue-900">
                      <Info size={15} className="text-[#0b408e] shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px]">
                        Deposit remarks: Please write your <strong>registered email address</strong> or mobile number on your deposit slip so our team can immediately identify your payment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-4 rounded-full bg-[#0b408e]" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Purchase Terms &amp; Policies
                    </h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-gray-500 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-gray-800">No-Refund Policy:</strong> All course payments are strictly non-refundable under any circumstance once processed.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock size={14} className="text-[#0b408e] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-gray-800">Verification Timeline:</strong> Enrollments are activated manually by our team within 24 hours of receipt submission.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-[#0b408e] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-gray-800">Usage Rights:</strong> Access is for the registered student account only. Sharing or redistribution of lesson videos/resources is strictly prohibited.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-4 text-[11px]">
                      <ContactRow icon={Phone} href={`tel:${PHONE_RAW}`} label={PHONE} />
                      <ContactRow
                        icon={MessageCircle}
                        href={`https://wa.me/${WHATSAPP}`}
                        label={`WhatsApp: ${PHONE}`}
                        color="text-[#25D366]"
                      />
                      <ContactRow
                        icon={Mail}
                        href={`mailto:${EMAIL}?subject=Checkout Inquiry`}
                        label={EMAIL}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Slip Upload Form (lg:col-span-5) ── */}
              <div className="lg:col-span-5 sticky top-24">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#0b408e]/10 flex items-center justify-center shrink-0 text-[#0b408e]">
                      <UploadCloud size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">2. Upload Payment Slip</h2>
                      <p className="text-[11px] text-gray-400">Attach screenshot or photo of bank receipt</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitSlip} className="p-6 space-y-4">
                    {/* Amount reminder */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600">Total Payable Amount</span>
                      <span className="text-base font-extrabold text-[#0b408e]">
                        LKR {totalPrice.toLocaleString()}
                      </span>
                    </div>

                    {/* File Dropzone */}
                    {!slipFile ? (
                      <label className="border-2 border-dashed border-gray-300 hover:border-[#0b408e] bg-gray-50/60 hover:bg-blue-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group text-center">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-xs text-gray-400 group-hover:text-[#0b408e] transition-colors mb-2">
                          <UploadCloud size={24} />
                        </div>
                        <p className="text-xs font-bold text-gray-700 group-hover:text-[#0b408e]">
                          Click to select receipt file
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Supports JPG, PNG, WEBP or PDF (Max 5MB)
                        </p>
                      </label>
                    ) : (
                      <div className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt="Slip preview"
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0b408e] flex items-center justify-center shrink-0">
                              <FileText size={22} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {slipFile.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {(slipFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!slipFile || isSubmitting || checkoutItems.length === 0}
                      className="w-full py-3.5 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting Payment Slip...
                        </>
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          Submit Payment Slip (LKR {totalPrice.toLocaleString()})
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── BANK DETAILS MODAL ── */}
        {selectedBankModal && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedBankModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-all duration-200 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-auto max-h-[92vh] flex flex-col"
            >
              <div className="h-1.5 bg-gradient-to-r from-[#0b408e] via-[#9fe03c] to-[#0b408e] shrink-0" />

              <div className="p-4 sm:p-6 overflow-y-auto">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <BankLogo bank={selectedBankModal} size="lg" />
                    <div>
                      <span className="text-[10px] font-bold text-[#0b408e] uppercase tracking-wider bg-[#0b408e]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        Deposit Account
                      </span>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {selectedBankModal.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedBankModal.branch} Branch
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBankModal(null)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="my-4 bg-[#0b408e]/5 border border-[#0b408e]/15 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Transfer Amount
                    </p>
                    <p className="text-lg font-black text-[#0b408e]">
                      LKR {totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#0b408e] bg-white border border-gray-200 px-2.5 py-1 rounded-xl shadow-2xs">
                    {checkoutItems.length} course{checkoutItems.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-3 bg-gray-50/80 border border-gray-100 rounded-2xl p-4">
                  <div className="pb-3 border-b border-gray-200/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Account Number
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(selectedBankModal.accountNumber)}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          copiedField
                            ? "bg-emerald-600 text-white"
                            : "bg-[#0b408e] text-white hover:bg-[#0b408e]/90"
                        }`}
                      >
                        {copiedField ? (
                          <>
                            <Check size={12} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Number
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xl font-bold font-mono tracking-wider text-gray-900 select-all">
                      {selectedBankModal.accountNumber}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                    <span className="text-xs text-gray-500">Account Name</span>
                    <span className="text-xs font-bold text-gray-900 text-right">
                      {selectedBankModal.accountName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                    <span className="text-xs text-gray-500">Bank</span>
                    <span className="text-xs font-semibold text-gray-800 text-right">
                      {selectedBankModal.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500">Branch</span>
                    <span className="text-xs font-semibold text-gray-800 text-right">
                      {selectedBankModal.branch}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl">
                  <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    Use your <strong>registered email address</strong> as the transfer reference remarks.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBankModal(null)}
                  className="mt-5 w-full py-3 rounded-xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Done — Proceed to Upload Slip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
