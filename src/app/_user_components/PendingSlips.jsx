"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, ExternalLink, RefreshCw, FileText, AlertCircle } from "lucide-react";

export default function PendingSlips() {
  const [bankSlips, setBankSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bank-slips");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load bank slip history");
      }
      setBankSlips(data.bankSlips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-center min-h-[120px] text-slate-400 text-xs mb-8">
        <RefreshCw size={18} className="animate-spin mr-2 text-[#0b408e]" />
        Loading payment status history...
      </div>
    );
  }

  if (bankSlips.length === 0) {
    return null;
  }

  // Sort descending by created_at
  const sortedSlips = [...bankSlips].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

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
              Verification status of your uploaded bank transfer payment slips.
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

      {/* List Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Submitted Date</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Slip Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedSlips.map((slip) => {
              const isPending = slip.status === "PENDING";
              const isApproved = slip.status === "APPROVED";
              const isRejected = slip.status === "REJECTED";

              return (
                <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                    {new Date(slip.created_at).toLocaleDateString()} at{" "}
                    {new Date(slip.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>

                  {/* Course */}
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {slip.course
                      ? `${slip.course.title}${slip.course.grade ? ` (Grade ${slip.course.grade})` : ""}${slip.course.type === "pastpaper" ? " (Past Paper)" : ""}`
                      : "Course Payment"}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-extrabold text-[#0b408e] whitespace-nowrap">
                    LKR {Number(slip.amount).toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <Clock size={12} />
                        Pending Verification
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <CheckCircle2 size={12} />
                        Verified & Enrolled
                      </span>
                    )}
                    {isRejected && (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                          <XCircle size={12} />
                          Rejected
                        </span>
                        {slip.rejection_note && (
                          <div className="text-[10px] text-red-600 flex items-center gap-1">
                            <AlertCircle size={11} />
                            <span>Reason: {slip.rejection_note}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Link */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <a
                      href={slip.slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b408e] hover:underline"
                    >
                      View Slip <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
