"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  AlertTriangle,
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// ─── Contact details ──────────────────────────────────────────────────────────
const PHONE = "071 156 2002";
const PHONE_RAW = "0711562002";
const WHATSAPP = "94711562002";
const EMAIL = "info@nexlearn.lk";

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

function BankLogo({ bank, size = "md" }) {
  const [hasError, setHasError] = useState(false);
  const sizeClasses =
    size === "lg"
      ? "w-14 h-14 text-sm"
      : "w-11 h-11 text-xs";

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

export default function CheckoutClient({ course, courseId }) {
  const { data: session } = useSession();

  // ── Selected Bank Modal State ──────────────────────────────────────────
  const [selectedBankModal, setSelectedBankModal] = useState(null);
  const [copiedField, setCopiedField] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedBankModal(null);
      }
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

  // ── Bank slip upload UI states ──────────────────────────────────────────
  const [slipFile, setSlipFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
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

  const handleSubmitSlip = async (e) => {
    e.preventDefault();
    if (!slipFile) {
      toast.error("Please select your bank transfer slip before submitting.");
      return;
    }
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("file", slipFile);
      formData.append("courseId", courseId);
      formData.append("amount", course.price);

      const res = await fetch("/api/bank-slips", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit payment slip");
      }

      setIsSubmitted(true);
      toast.success("Payment slip submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload payment slip.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const price = Number(course.price).toLocaleString();

  return (
    <div className="pt-20 min-h-screen bg-gray-50 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Back */}
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 mb-6 text-xs text-gray-400 hover:text-[#0b408e] transition-colors font-medium"
        >
          <ArrowLeft size={13} />
          Back to Course
        </Link>

        {/* Course summary banner */}
        <div className="mb-7 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Completing purchase for
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {course.title}{" "}
              {course.type === "pastpaper" && (
                <span className="text-xs font-medium text-gray-500 ml-1">
                  (Past Paper Discussion)
                </span>
              )}{" "}
              {course.type === "theory" && (
                <span className="text-xs font-medium text-gray-500 ml-1">
                  (Grade {course.grade} Theory)
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Total
            </p>
            <p className="text-2xl font-bold text-[#0b408e]">LKR {price}</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── LEFT: Terms & Conditions ──────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Top accent */}
            <div className="h-1 bg-[#9fe03c]" />
            <div className="p-7">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-4 rounded-full bg-[#9fe03c]" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Terms &amp; Conditions
                </h2>
              </div>

              <div className="space-y-5 text-sm text-gray-500 leading-relaxed">
                {/* No Refund */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Strict No-Refund Policy
                    </p>
                  </div>
                  <p className="pl-5">
                    All payments made to NexLearn are{" "}
                    <span className="font-medium text-gray-800">
                      strictly non-refundable under any circumstance whatsoever
                    </span>
                    . Once a purchase is completed via bank transfer, no refunds,
                    partial refunds, or credits will be issued. Please review the
                    course description carefully before making a payment.
                  </p>
                </section>

                <div className="border-t border-gray-100" />

                {/* Course Access */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-[#0b408e] shrink-0" />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Course Access
                    </p>
                  </div>
                  <p className="pl-5">
                    Access is granted to the registered account holder only and
                    is non-transferable. Enrollment is valid until the end of
                    the current academic batch for your grade. NexLearn reserves
                    the right to revoke access without notice in the event of
                    misuse or violation of these terms.
                  </p>
                </section>

                <div className="border-t border-gray-100" />

                {/* Payment Terms */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} className="text-[#0b408e] shrink-0" />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Payment
                    </p>
                  </div>
                  <p className="pl-5">
                    All prices are in Sri Lankan Rupees (LKR). For bank transfers,
                    enrollment is activated manually by our team within 24 hours of
                    receipt verification.
                  </p>
                </section>

                <div className="border-t border-gray-100" />

                {/* Usage Policy */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2
                      size={14}
                      className="text-[#0b408e] shrink-0"
                    />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Usage Policy
                    </p>
                  </div>
                  <p className="pl-5">
                    All course materials — including videos, notes, and
                    resources — are for personal educational use only.
                    Redistribution, resale, screen recording, or sharing of
                    login credentials or content in any form is strictly
                    prohibited and may result in permanent account suspension
                    without refund.
                  </p>
                </section>

                <div className="border-t border-gray-100" />

                {/* Disputes */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle
                      size={14}
                      className="text-amber-500 shrink-0"
                    />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Payment Inquiries
                    </p>
                  </div>
                  <p className="pl-5">
                    If a payment is transferred from your account and your receipt
                    is uploaded but enrollment is not reflected within 24 hours,
                    please contact us immediately with your transaction reference. We
                    will investigate and resolve the issue promptly.
                  </p>
                </section>

                <div className="border-t border-gray-100" />

                {/* Contact box */}
                <div className="bg-[#0b408e]/5 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-[#0b408e] mb-3">
                    Feel free to contact us for any questions or concerns
                  </p>
                  <div className="flex flex-col gap-2">
                    <ContactRow
                      icon={Phone}
                      href={`tel:${PHONE_RAW}`}
                      label={PHONE}
                    />
                    <ContactRow
                      icon={MessageCircle}
                      href={`https://wa.me/${WHATSAPP}`}
                      label={`WhatsApp: ${PHONE}`}
                      color="text-[#25D366]"
                    />
                    <ContactRow
                      icon={Mail}
                      href={`mailto:${EMAIL}?subject=Inquiry from NexLearn Website`}
                      label={EMAIL}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Payment Method ────────────────────────────────────── */}
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="w-1 h-4 rounded-full bg-[#0b408e]" />
              <h2 className="text-sm font-semibold text-gray-900">
                Payment Method
              </h2>
            </div>

            {/* ── Direct Bank Transfer ─────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#9fe03c]/12 flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-[#4a7a1e]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Direct Bank Transfer
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Manual enrollment within 24 hours of receipt
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                  {/* Bank selection cards */}
                  <div className="mt-4 bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Banknote size={15} className="text-[#0b408e]" />
                        <p className="text-[11px] font-semibold text-gray-800 uppercase tracking-wider">
                          Select a Bank for Account Details
                        </p>
                      </div>
                      
                    </div>

                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                      Click any bank below to view its account number, branch, and transfer instructions:
                    </p>

                    {/* Bank Selection Buttons */}
                    <div className="space-y-2.5">
                      {BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankModal(bank)}
                          className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-50/40 rounded-2xl border border-gray-200/80 hover:border-[#0b408e]/40 shadow-xs transition-all duration-150 group text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <BankLogo bank={bank} size="md" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-900 group-hover:text-[#0b408e] transition-colors truncate">
                                {bank.name}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {bank.branch} Branch
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 pl-2 shrink-0">
                            <span className="text-[11px] font-medium text-gray-500 group-hover:text-[#0b408e] transition-colors hidden sm:inline">
                              View Details
                            </span>
                            <div className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-[#0b408e] flex items-center justify-center text-gray-500 group-hover:text-white transition-all">
                              <Building2 size={13} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Transfer amount reminder */}
                    <div className="mt-3.5 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-gray-600">
                        Transfer Amount
                      </span>
                      <span className="text-sm font-bold text-[#0b408e]">
                        LKR {price}
                      </span>
                    </div>
                  </div>

                  {/* ── Bank Payment Slip Upload UI ────────────────────── */}
                  <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <UploadCloud size={16} className="text-[#0b408e]" />
                        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Upload Payment Slip
                        </p>
                      </div>
                      <span className="text-[10px] bg-[#0b408e]/10 text-[#0b408e] px-2 py-0.5 rounded-full font-medium">
                        Instant Upload
                      </span>
                    </div>

                    {isSubmitted ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                          <CheckCircle size={22} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">
                            Slip Submitted Successfully!
                          </h4>
                          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                            Your bank transfer receipt has been received. Our team will verify the transaction and activate your course within 24 hours.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 bg-emerald-100/70 py-1.5 px-3 rounded-lg w-fit mx-auto font-medium">
                          <Clock size={13} />
                          Status: Pending Verification
                        </div>
                        {slipFile && (
                          <p className="text-[11px] text-emerald-600 italic">
                            Uploaded File: {slipFile.name}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsSubmitted(false)}
                          className="text-xs text-[#0b408e] hover:underline font-medium pt-1 block mx-auto"
                        >
                          Upload a different slip
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitSlip} className="space-y-4">
                        {/* File Upload Drop Zone */}
                        {!slipFile ? (
                          <label className="border-2 border-dashed border-gray-300 hover:border-[#0b408e] bg-gray-50/60 hover:bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-xs text-gray-400 group-hover:text-[#0b408e] group-hover:border-[#0b408e]/30 transition-all mb-2">
                              <UploadCloud size={24} />
                            </div>
                            <p className="text-xs font-semibold text-gray-700 group-hover:text-[#0b408e]">
                              Click to select or drag &amp; drop slip here
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Supports JPG, PNG, WEBP or PDF (Max 5MB)
                            </p>
                          </label>
                        ) : (
                          <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt="Slip preview"
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-blue-100 text-[#0b408e] flex items-center justify-center shrink-0">
                                  <FileText size={20} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
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
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                              title="Remove slip"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}



                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={!slipFile || isSubmitting}
                          className="w-full py-3 rounded-xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Submitting Slip...
                            </>
                          ) : (
                            <>
                              <UploadCloud size={14} />
                              Submit Payment Slip
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Step-by-step instructions */}
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                    <Info
                      size={14}
                      className="text-[#0b408e] shrink-0 mt-0.5"
                    />
                    <div className="text-xs text-blue-900 space-y-2">
                      <p className="font-semibold">
                        Steps after making the transfer:
                      </p>
                      <ol className="space-y-1.5 text-blue-800">
                        <li>
                          <strong>1.</strong> Take a clear screenshot or photo of your bank payment slip / receipt.
                        </li>
                        <li>
                          <strong>2.</strong> Upload the slip in the designated upload field and click <strong>Submit Payment Slip</strong> button.
                        </li>
                        <li>
                          <strong>3.</strong> Our team will verify the payment
                          and activate your enrollment within{" "}
                          <strong>24 hours</strong>.
                        </li>
                        <li>
                          <strong>4.</strong> You will receive a confirmation
                          once access has been granted.
                        </li>
                      </ol>
                    </div>
                  </div>

                 
                 
                    
                    <p className="text-[10px]  text-gray-400 mt-2  leading-relaxed px-2 mb-2">
                      Please allow up to 24 hours on business days. For urgent
                      matters, WhatsApp is the fastest channel.
                    </p>

                    <p className="text-[10px] text-gray-400 leading-relaxed px-2">
                      By completing your purchase you agree to NexLearn&apos;s Terms
                      &amp; Conditions, including the no-refund policy outlined on this
                      page.
                    </p>
                 
                </div>
              </div>
              
            </div>
          </div>
        </div>

      {/* ── Bank Details Modal (Dark semi-transparent blurred background) ── */}
      {selectedBankModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedBankModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all"
          >
            {/* Top accent line */}
            <div className="h-1.5 bg-gradient-to-r from-[#0b408e] via-[#9fe03c] to-[#0b408e]" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <BankLogo bank={selectedBankModal} size="lg" />
                  <div>
                    <span className="text-[10px] font-bold text-[#0b408e] uppercase tracking-wider bg-[#0b408e]/10 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Direct Deposit
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
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Transfer Amount Banner */}
              <div className="my-4 bg-[#0b408e]/5 border border-[#0b408e]/15 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Required Transfer Amount
                  </p>
                  <p className="text-lg font-extrabold text-[#0b408e]">
                    LKR {price}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-gray-600 bg-white border border-gray-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  {course.title}
                </span>
              </div>

              {/* Bank Details Breakdown */}
              <div className="space-y-3 bg-gray-50/80 border border-gray-100 rounded-2xl p-4">
                {/* Account Number with 1-click Copy */}
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

                {/* Account Name */}
                <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                  <span className="text-xs text-gray-500">Account Name</span>
                  <span className="text-xs font-bold text-gray-900 text-right">
                    {selectedBankModal.accountName}
                  </span>
                </div>

                {/* Bank */}
                <div className="flex items-center justify-between py-1 border-b border-gray-200/60">
                  <span className="text-xs text-gray-500">Bank</span>
                  <span className="text-xs font-semibold text-gray-800 text-right">
                    {selectedBankModal.name}
                  </span>
                </div>

                {/* Branch */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-500">Branch</span>
                  <span className="text-xs font-semibold text-gray-800 text-right">
                    {selectedBankModal.branch}
                  </span>
                </div>
              </div>

              {/* Instructions notice */}
              <div className="mt-4 flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl">
                <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Use your <strong>registered email address</strong> as the deposit remarks/reference. Keep your payment slip/receipt ready to upload below.
                </p>
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => setSelectedBankModal(null)}
                className="mt-5 w-full py-3 rounded-xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Done — Proceed to Upload Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
