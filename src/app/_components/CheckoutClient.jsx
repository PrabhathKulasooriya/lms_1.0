"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  ChevronDown,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import { getPayHereFormData } from "@/app/api/actions/checkout";
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

// ─── Bank account details — fill in your real details ─────────────────────────
const BANK_DETAILS = [
  { label: "Account Name", value: "YOUR ACCOUNT NAME HERE" },
  { label: "Account Number", value: "XXXX XXXX XXXX" },
  { label: "Bank", value: "YOUR BANK NAME HERE" },
  { label: "Branch", value: "YOUR BRANCH NAME HERE" },
  { label: "Branch Code", value: "XXXX" },
];

export default function CheckoutClient({ course, courseId }) {
  const [openSection, setOpenSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const toggle = (key) => setOpenSection((prev) => (prev === key ? null : key));

  // ── Initiate PayHere card payment ────────────────────────────────────────
  const handleCardPayment = async () => {
    try {
      setLoading(true);
      const fullName =
        session?.user?.name ||
        [session?.user?.first_name, session?.user?.last_name]
          .filter(Boolean)
          .join(" ") ||
        "Customer";

      const formData = await getPayHereFormData(
        courseId,
        Number(course.price),
        course.title,
        session.user.email,
        fullName,
      );

      // Build a hidden form and submit to PayHere sandbox
      const form = document.createElement("form");
      form.method = "POST";
      // ⚠️  Change to https://www.payhere.lk/pay/checkout for production
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      // Note: setLoading(false) is intentionally omitted — page navigates away
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
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
              {course.title}{" "}{course.type === "pastpaper" && (
                <span className="text-xs font-medium text-gray-500 ml-1">
                  (Past Paper Discussion)
                </span>
              )}{" "}{course.type === "theory" && (
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
                    . Once a purchase is completed — whether via card payment or
                    bank transfer — no refunds, partial refunds, or credits will
                    be issued. Please review the course description carefully
                    before making a payment.
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
                    <CreditCard size={14} className="text-[#0b408e] shrink-0" />
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                      Payment
                    </p>
                  </div>
                  <p className="pl-5">
                    All prices are in Sri Lankan Rupees (LKR). Card payments are
                    processed securely via PayHere; NexLearn does not store your
                    card details at any point. For bank transfers, enrollment is
                    activated manually by our team within 24 hours of receipt
                    verification.
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
                      Payment Disputes
                    </p>
                  </div>
                  <p className="pl-5">
                    If a payment is deducted from your account but enrollment is
                    not reflected, please contact us immediately with your
                    payment receipt. We will investigate and resolve the issue
                    promptly. Initiating a chargeback without first contacting
                    us may result in permanent account suspension.
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

          {/* ── RIGHT: Payment Options ────────────────────────────────────── */}
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="w-1 h-4 rounded-full bg-[#0b408e]" />
              <h2 className="text-sm font-semibold text-gray-900">
                Choose Payment Method
              </h2>
            </div>

            {/* ── Option 1: Card Payment ──────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle("card")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#0b408e]/8 flex items-center justify-center shrink-0">
                    <CreditCard size={16} className="text-[#0b408e]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Pay with Card
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Visa &amp; Mastercard — Secured by PayHere
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    openSection === "card" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSection === "card" && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Do not close warning */}
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle
                      size={14}
                      className="text-amber-500 shrink-0 mt-0.5"
                    />
                    <div className="text-xs text-amber-800 space-y-2">
                      <p className="font-semibold">
                        Important — Please Read Before Proceeding
                      </p>
                      <ul className="space-y-1 text-amber-700">
                        <li>
                          • Do <strong>not</strong> close, refresh, or press the
                          browser back button while payment is being processed.
                        </li>
                        <li>
                          • Do <strong>not</strong> cancel the payment once you
                          have been redirected to the PayHere payment page.
                        </li>
                        <li>
                          • After payment, you will be automatically redirected
                          back to your course. Please wait and do not close the
                          tab.
                        </li>
                        <li>
                          • If you are redirected back unexpectedly, wait a few
                          minutes — enrollment may still be processing.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Deducted but not enrolled */}
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
                    <ShieldAlert
                      size={14}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <div className="text-xs text-red-800 space-y-2">
                      <p className="font-semibold">
                        Payment Deducted but Not Enrolled?
                      </p>
                      <p className="text-red-700">
                        If money was deducted from your account but you were not
                        enrolled, please contact us immediately with your
                        payment receipt and we will resolve it as soon as
                        possible.
                      </p>
                      <div className="space-y-1.5 pt-1">
                        <a
                          href={`tel:${PHONE_RAW}`}
                          className="flex items-center gap-1.5 text-red-700 hover:text-red-900 transition-colors font-medium"
                        >
                          <Phone size={11} /> {PHONE}
                        </a>
                        <a
                          href={`https://wa.me/${WHATSAPP}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-red-700 hover:text-red-900 transition-colors font-medium"
                        >
                          <MessageCircle size={11} /> WhatsApp: {PHONE}
                        </a>
                        <a
                          href={`mailto:${EMAIL}?subject=Payment Issue - Course Enrollment`}
                          className="flex items-center gap-1.5 text-red-700 hover:text-red-900 transition-colors font-medium"
                        >
                          <Mail size={11} /> {EMAIL}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleCardPayment}
                    disabled={loading}
                    className="mt-5 w-full py-3.5 rounded-2xl bg-[#0b408e] hover:bg-[#0b408e]/90 text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CreditCard size={15} />
                    {loading
                      ? "Redirecting to PayHere..."
                      : `Pay LKR ${price} Securely`}
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-2 leading-relaxed">
                    You will be redirected to PayHere&apos;s secure payment
                    page. NexLearn does not store your card information.
                  </p>
                </div>
              )}
            </div>

            {/* ── Option 2: Bank Transfer ─────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggle("bank")}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/60 transition-colors text-left"
              >
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
                <ChevronDown
                  size={16}
                  className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                    openSection === "bank" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSection === "bank" && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  {/* Account details */}
                  <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Banknote size={13} className="text-[#0b408e]" />
                      <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
                        Bank Account Details
                      </p>
                    </div>
                    <div className="space-y-0">
                      {BANK_DETAILS.map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-[11px] text-gray-400">
                            {label}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 text-right max-w-[55%]">
                            {value}
                          </span>
                        </div>
                      ))}
                      {/* Amount highlighted */}
                      <div className="flex items-center justify-between pt-3">
                        <span className="text-[11px] font-semibold text-gray-600">
                          Transfer Amount
                        </span>
                        <span className="text-sm font-bold text-[#0b408e]">
                          LKR {price}
                        </span>
                      </div>
                    </div>
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
                          <strong>1.</strong> Take a clear screenshot or photo
                          of your bank payment slip / receipt.
                        </li>
                        <li>
                          <strong>2.</strong> Send the receipt to us via
                          WhatsApp or email, along with your{" "}
                          <strong>registered email address</strong> and the{" "}
                          <strong>course name</strong> you purchased.
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

                  {/* Send receipt to */}
                  <div className="mt-3 bg-[#9fe03c]/8 border border-[#9fe03c]/25 rounded-2xl p-4">
                    <p className="text-[11px] font-semibold text-[#4a7a1e] mb-3">
                      Send Your Receipt To
                    </p>
                    <div className="space-y-2">
                      <a
                        href={`https://wa.me/${WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#25D366] transition-colors font-medium"
                      >
                        <MessageCircle size={13} className="text-[#25D366]" />
                        WhatsApp: {PHONE}
                      </a>
                      <a
                        href={`mailto:${EMAIL}?subject=Bank Transfer Receipt - ${course.title}`}
                        className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#0b408e] transition-colors font-medium"
                      >
                        <Mail size={13} className="text-[#0b408e]" />
                        {EMAIL}
                      </a>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
                      Please allow up to 24 hours on business days. For urgent
                      matters, WhatsApp is the fastest channel.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Reassurance note */}
            <p className="text-[10px] text-center text-gray-400 leading-relaxed px-2">
              By completing your purchase you agree to NexLearn&apos;s Terms
              &amp; Conditions, including the no-refund policy outlined on this
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
