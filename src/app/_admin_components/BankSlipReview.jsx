"use client";

import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  Printer,
  Search,
  RefreshCw,
  Eye,
  X,
  User,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function BankSlipReview() {
  const [bankSlips, setBankSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [search, setSearch] = useState("");

  // Modal states
  const [previewSlip, setPreviewSlip] = useState(null);
  const [rejectingSlip, setRejectingSlip] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBankSlips = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bank-slips");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch bank slips");
      }
      setBankSlips(data.bankSlips || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load bank slips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankSlips();
  }, []);

  // Filter bank slips
  const filteredSlips = bankSlips.filter((slip) => {
    const matchesTab = activeTab === "ALL" || slip.status === activeTab;
    const searchLower = search.toLowerCase();
    const userName = `${slip.user?.first_name || ""} ${slip.user?.last_name || ""}`.toLowerCase();
    const userEmail = (slip.user?.email || "").toLowerCase();
    const courseTitle = (slip.course?.title || "").toLowerCase();
    const refNo = (slip.reference_no || "").toLowerCase();

    const matchesSearch =
      !search ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      courseTitle.includes(searchLower) ||
      refNo.includes(searchLower);

    return matchesTab && matchesSearch;
  });

  const pendingCount = bankSlips.filter((s) => s.status === "PENDING").length;

  // ── Approve Action ────────────────────────────────────────────────────────
  const handleApprove = async (slipId) => {
    if (!confirm("Are you sure you want to approve this slip and enroll the student?")) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/bank-slips/${slipId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Approval failed");
      }
      toast.success("Bank slip approved & student enrolled successfully!");
      fetchBankSlips();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to approve bank slip");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject Action ─────────────────────────────────────────────────────────
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectingSlip) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/bank-slips/${rejectingSlip.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionNote }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Rejection failed");
      }
      toast.success("Bank slip rejected");
      setRejectingSlip(null);
      setRejectionNote("");
      fetchBankSlips();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to reject bank slip");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Download Helper ───────────────────────────────────────────────────────
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "bank_slip.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      // Fallback: open in new window
      window.open(url, "_blank");
    }
  };

  // ── Print Helper ──────────────────────────────────────────────────────────
  const handlePrint = (slip) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const userName = `${slip.user?.first_name || ""} ${slip.user?.last_name || ""}`;
    printWindow.document.write(`
      <html>
        <head>
          <title>Bank Slip - ${userName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { color: #0b408e; margin-bottom: 5px; }
            .meta { font-size: 13px; line-height: 1.6; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 15px; }
            img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>NexLearn.lk - Payment Verification Slip</h2>
          <div class="meta">
            <p><strong>Student Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${slip.user?.email || "N/A"}</p>
            <p><strong>Mobile:</strong> ${slip.user?.mobile || "N/A"}</p>
            <p><strong>Course:</strong> ${slip.course?.title || "N/A"}</p>
            <p><strong>Amount:</strong> LKR ${Number(slip.amount).toLocaleString()}</p>
            <p><strong>Depositor Name:</strong> ${slip.depositor_name || "N/A"}</p>
            <p><strong>Ref No:</strong> ${slip.reference_no || "N/A"}</p>
            <p><strong>Submitted Date:</strong> ${new Date(slip.created_at).toLocaleString()}</p>
          </div>
          <h3>Uploaded Bank Slip Image:</h3>
          <img src="${slip.slip_url}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b408e]/10 text-[#0b408e] text-xs font-bold uppercase mb-2">
            <FileCheck2 size={14} />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Bank Slip Payment Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review student bank transfer receipts and approve course enrollments with one click.
          </p>
        </div>

        <button
          onClick={fetchBankSlips}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#0b408e]" : ""} />
          Refresh List
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "PENDING", label: `Pending (${pendingCount})`, color: "amber" },
            { key: "APPROVED", label: "Approved", color: "emerald" },
            { key: "REJECTED", label: "Rejected", color: "red" },
            { key: "ALL", label: "All Submissions", color: "slate" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#0b408e] text-white shadow-md shadow-[#0b408e]/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, course, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b408e] bg-slate-50/50"
          />
        </div>
      </div>

      {/* Bank Slip List Container */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-sm">
          <Loader2 size={24} className="animate-spin mx-auto mb-3 text-[#0b408e]" />
          Loading bank slip submissions...
        </div>
      ) : filteredSlips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <FileCheck2 size={36} className="mx-auto mb-3 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">No Bank Slips Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search
              ? "No records matching your search query."
              : `There are currently no ${activeTab.toLowerCase()} bank slips to display.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSlips.map((slip) => {
            const userName = `${slip.user?.first_name || ""} ${slip.user?.last_name || ""}`.trim() || "Student";
            const isPending = slip.status === "PENDING";
            const isApproved = slip.status === "APPROVED";
            const isRejected = slip.status === "REJECTED";

            return (
              <div
                key={slip.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Top Bar Status */}
                  <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Slip ID: #{slip.id}
                    </span>

                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                        <Clock size={13} />
                        Pending Review
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 size={13} />
                        Approved & Enrolled
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                        <XCircle size={13} />
                        Rejected
                      </span>
                    )}
                  </div>

                  {/* Main Info Body */}
                  <div className="p-6 space-y-4">
                    {/* Student Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0b408e]/10 text-[#0b408e] flex items-center justify-center font-bold text-sm shrink-0">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                          {userName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400" />
                            {slip.user?.email || "No email"}
                          </span>
                          {slip.user?.mobile && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {slip.user.mobile}
                            </span>
                          )}
                        </div>
                        {slip.user?.address && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin size={11} className="shrink-0" />
                            {slip.user.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Course & Payment details box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-[#0b408e]" />
                          {slip.course?.title}
                        </span>
                        <span className="font-extrabold text-sm text-[#0b408e]">
                          LKR {Number(slip.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div>
                          <span className="text-slate-400 block">Depositor Name:</span>
                          <span className="font-medium text-slate-700">{slip.depositor_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Ref / Reg Email:</span>
                          <span className="font-medium text-slate-700">{slip.reference_no || "N/A"}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1">
                        Submitted on: {new Date(slip.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Rejection Note if present */}
                    {isRejected && slip.rejection_note && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                        <strong>Rejection Reason:</strong> {slip.rejection_note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  {/* View / Download / Print options */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewSlip(slip)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={14} className="text-[#0b408e]" />
                      View Slip
                    </button>
                    <button
                      onClick={() => handleDownload(slip.slip_url, `bank_slip_${userName.replace(/\s+/g, "_")}.png`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download size={14} className="text-slate-600" />
                      Download
                    </button>
                    <button
                      onClick={() => handlePrint(slip)}
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors"
                      title="Print Slip"
                    >
                      <Printer size={15} />
                    </button>
                  </div>

                  {/* Primary Approval / Rejection Controls */}
                  {isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(slip.id)}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} />
                        Approve & Enroll Student
                      </button>

                      <button
                        onClick={() => setRejectingSlip(slip)}
                        disabled={actionLoading}
                        className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slip Image Fullscreen Modal */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">
                Payment Slip Preview - #{previewSlip.id}
              </h3>
              <button
                onClick={() => setPreviewSlip(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
              <img
                src={previewSlip.slip_url}
                alt="Bank slip preview"
                className="max-h-[65vh] object-contain rounded-xl border border-slate-200 shadow-md"
              />
            </div>
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <a
                href={previewSlip.slip_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#0b408e] hover:underline flex items-center gap-1"
              >
                Open Original File <ExternalLink size={13} />
              </a>
              <button
                onClick={() => setPreviewSlip(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Slip Reason Modal */}
      {rejectingSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600 font-extrabold text-base">
                <AlertTriangle size={20} />
                <span>Reject Bank Slip</span>
              </div>
              <button
                onClick={() => setRejectingSlip(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <p className="text-xs text-slate-600">
                Specify a reason for rejecting the payment slip from{" "}
                <strong>{rejectingSlip.user?.first_name} {rejectingSlip.user?.last_name}</strong>:
              </p>

              <textarea
                rows={3}
                placeholder="e.g. Image blur / Payment amount mismatch..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSlip(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
