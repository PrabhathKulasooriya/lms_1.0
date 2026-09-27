"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, ExternalLink, RefreshCw, FileText, AlertCircle } from "lucide-react";

export default function PendingSlips() {
  const [bankSlips, setBankSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlips = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/bank-slips");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load bank slip history");
      }
      setBankSlips(data.bankSlips || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-center min-h-[160px] text-slate-400 text-xs">
        <RefreshCw size={18} className="animate-spin mr-2 text-[#0b408e]" />
        Loading payment verification history...
      </div>
    );
  }

  if (bankSlips.length === 0) {
    return null; // Don't show anything if user has no bank slips submitted
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0b408e]/10 flex items-center justify-center text-[#0b408e]">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-slate-800 tracking-tight">
              Bank Transfer Payments
            </h3>
            <p className="text-xs text-slate-500">
              Track the verification status of your uploaded payment slips.
            </p>
          </div>
        </div>
        <button
          onClick={fetchSlips}
          className="p-2 rounded-xl text-slate-400 hover:text-[#0b408e] hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankSlips.map((slip) => {
          const isPending = slip.status === "PENDING";
          const isApproved = slip.status === "APPROVED";
          const isRejected = slip.status === "REJECTED";

          return (
            <div
              key={slip.id}
              className={`rounded-2xl border p-4 transition-all ${
                isPending
                  ? "bg-amber-50/50 border-amber-200"
                  : isApproved
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-red-50/50 border-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                  {slip.course?.title || "Course Payment"}
                </h4>
                {/* Status Badge */}
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold shrink-0">
                    <Clock size={12} />
                    Pending
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    <CheckCircle2 size={12} />
                    Verified
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold shrink-0">
                    <XCircle size={12} />
                    Rejected
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1 mb-3">
                <p>
                  <span className="text-slate-400">Amount:</span>{" "}
                  <strong className="text-slate-800">LKR {Number(slip.amount).toLocaleString()}</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Submitted: {new Date(slip.created_at).toLocaleDateString()} at{" "}
                  {new Date(slip.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                {isRejected && slip.rejection_note && (
                  <div className="mt-2 p-2 rounded-lg bg-red-100/80 text-red-800 text-[11px] flex items-start gap-1.5">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>Reason: {slip.rejection_note}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <a
                  href={slip.slip_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b408e] hover:underline"
                >
                  View Payment Slip
                  <ExternalLink size={12} />
                </a>

                {isApproved && (
                  <span className="text-[11px] font-bold text-emerald-700">
                    ✓ Course Access Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
