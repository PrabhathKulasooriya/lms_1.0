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

  // Filter and sort bank slips by created_at descending
  const filteredSlips = bankSlips
    .filter((slip) => {
      const matchesTab = activeTab === "ALL" || slip.status === activeTab;
      const searchLower = search.toLowerCase();
      const userName = `${slip.user?.first_name || ""} ${slip.user?.last_name || ""}`.toLowerCase();
      const userEmail = (slip.user?.email || "").toLowerCase();
      const courseTitle = (slip.course?.title || "").toLowerCase();

      const matchesSearch =
        !search ||
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        courseTitle.includes(searchLower);

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
            <p><strong>Address:</strong> ${slip.user?.address || "N/A"}</p>
            <p><strong>Course:</strong> ${slip.course?.title || "N/A"}</p>
            <p><strong>Amount:</strong> LKR ${Number(slip.amount).toLocaleString()}</p>
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
            { key: "PENDING", label: `Pending (${pendingCount})` },
            { key: "APPROVED", label: "Approved" },
            { key: "REJECTED", label: "Rejected" },
            { key: "ALL", label: "All Submissions" },
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

      {/* Bank Slips Table List */}
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
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-6">Course & Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Slip File</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSlips.map((slip) => {
                  const userName = `${slip.user?.first_name || ""} ${slip.user?.last_name || ""}`.trim() || "Student";
                  const isPending = slip.status === "PENDING";
                  const isApproved = slip.status === "APPROVED";
                  const isRejected = slip.status === "REJECTED";

                  return (
                    <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Submitted Date */}
                      <td className="py-4 px-6 whitespace-nowrap text-slate-500">
                        <div className="font-semibold text-slate-700">
                          {new Date(slip.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(slip.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Student Details */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 text-sm">{userName}</div>
                        <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail size={11} className="text-slate-400" />
                          <span>{slip.user?.email}</span>
                        </div>
                        {slip.user?.mobile && (
                          <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} className="text-slate-400" />
                            <span>{slip.user.mobile}</span>
                          </div>
                        )}
                      </td>

                      {/* Course & Amount */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 line-clamp-1">{slip.course?.title}</div>
                        <div className="text-xs font-extrabold text-[#0b408e] mt-0.5">
                          LKR {Number(slip.amount).toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <Clock size={12} />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <CheckCircle2 size={12} />
                            Approved & Enrolled
                          </span>
                        )}
                        {isRejected && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                              <XCircle size={12} />
                              Rejected
                            </span>
                            {slip.rejection_note && (
                              <p className="text-[10px] text-red-600 italic max-w-xs">{slip.rejection_note}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Slip File buttons */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => setPreviewSlip(slip)}
                            className="p-1.5 rounded-lg bg-white shadow-xs hover:text-[#0b408e] text-slate-600 transition-colors"
                            title="View Slip"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDownload(slip.slip_url, `slip_${userName.replace(/\s+/g, "_")}.png`)}
                            className="p-1.5 rounded-lg bg-white shadow-xs hover:text-[#0b408e] text-slate-600 transition-colors"
                            title="Download Slip"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handlePrint(slip)}
                            className="p-1.5 rounded-lg bg-white shadow-xs hover:text-[#0b408e] text-slate-600 transition-colors"
                            title="Print Slip"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(slip.id)}
                              disabled={actionLoading}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingSlip(slip)}
                              disabled={actionLoading}
                              className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium italic">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
