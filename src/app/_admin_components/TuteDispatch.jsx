"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Send,
  Search,
  Printer,
  CheckCircle,
  XCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Truck,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 20;

// ─── Minimal Print Template ──────────────────────────────────────────────────
const buildPrintHTML = (slips) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Dispatch Slips</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 20px; color: #000; }
      .slip {
        border: 2px solid #000;
        padding: 25px;
        margin-bottom: 20px;
        page-break-inside: avoid;
        max-width: 500px;
      }
      .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
      .address { font-size: 18px; margin-bottom: 15px; line-height: 1.4; border-top: 1px solid #ccc; padding-top: 10px; }
      .phone { font-size: 20px; font-weight: bold; }
      @media print { .slip { margin-bottom: 30px; } }
    </style>
  </head>
  <body>
    ${slips
      .map(
        (e) => `
      <div class="slip">
        <div class="name">${e.user?.first_name ?? ""} ${e.user?.last_name ?? ""}</div>
        <div class="address">${e.user?.address ?? "No Address Provided"}</div>
        <div class="phone">TEL: ${e.user?.mobile ?? "—"}</div>
      </div>
    `,
      )
      .join("")}
  </body>
  </html>
`;

const printSlips = (slips) => {
  const win = window.open("", "_blank");
  win.document.write(buildPrintHTML(slips));
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 500);
};

const TuteDispatch = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [total, setTotal] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tuteFilter, setTuteFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);

  // Grouping Logic
  const groupedData = enrollments.reduce((acc, curr) => {
    const date = new Date(curr.enrolled_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadEnrollments = useCallback(async () => {
    setFetchLoading(true);
    try {
      const params = new URLSearchParams({
        status: "active",
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const data = await fetch(`/api/enrollment?${params}`).then((res) =>
        res.json(),
      );
      const list = (data.enrollments ?? data).filter(
        (e) => e.course?.type === "theory",
      );

      const filtered =
        tuteFilter === "pending"
          ? list.filter((e) => !e.tute_sent)
          : tuteFilter === "sent"
            ? list.filter((e) => e.tute_sent)
            : list;

      setEnrollments(filtered);
      setTotal(filtered.length);
    } catch (err) {
      toast.error("Error loading data");
    } finally {
      setFetchLoading(false);
    }
  }, [debouncedSearch, tuteFilter]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleUpdateStatus = async (enrollment) => {
    const isSending = !enrollment.tute_sent;
    setTogglingId(enrollment.id);
    try {
      const res = await fetch(`/api/enrollment/${enrollment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tute_sent: isSending,
          tute_sent_at: isSending ? new Date() : null,
        }),
      });
      if (res.ok) {
        toast.success(isSending ? "Dispatched!" : "Reverted to Pending");
        loadEnrollments();
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 flex-1 overflow-x-hidden mx-auto bg-white min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Send size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Tute Dispatch</h1>
          <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            {total}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => printSlips(enrollments.filter((e) => !e.tute_sent))}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            <Printer size={18} /> Print Pending Slips
          </button>
          <div className="relative flex-1 lg:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user or course..."
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {["all", "pending", "sent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTuteFilter(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-medium border capitalize transition-all ${
              tuteFilter === tab
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Groups */}
      <div className="space-y-10">
        {fetchLoading ? (
          <div className="text-center py-20 text-gray-400 font-medium">
            Loading Dispatch List...
          </div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
            <PackageCheck size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              No theory enrollments found.
            </p>
          </div>
        ) : (
          Object.entries(groupedData).map(([date, items]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-2 px-2 text-gray-500">
                <Calendar size={16} />
                <h2 className="text-sm font-bold">Enrolled on {date}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-tight">
                          Student
                        </th>
                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-tight">
                          Address
                        </th>
                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-tight">
                          Course
                        </th>
                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-tight">
                          Status
                        </th>
                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-tight text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {items.map((e) => (
                        <tr
                          key={e.id}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-800 text-sm">
                              {e.user?.first_name} {e.user?.last_name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {e.user?.mobile || "No Mobile"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500 leading-snug">
                              {e.user?.address || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <BookOpen size={14} className="text-blue-400" />
                              <p className="font-medium text-gray-700 text-sm">
                                {e.course?.title}
                              </p>
                              <span className="text-[10px] text-gray-400 font-bold uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                                G{e.course?.grade}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {e.tute_sent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100">
                                <CheckCircle size={12} /> Sent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                                <XCircle size={12} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => handleUpdateStatus(e)}
                                disabled={togglingId === e.id}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                  e.tute_sent
                                    ? "bg-gray-50 text-gray-400 border-gray-200"
                                    : "bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700"
                                }`}
                              >
                                {e.tute_sent ? (
                                  <RotateCcw size={14} />
                                ) : (
                                  <Truck size={14} />
                                )}
                                {e.tute_sent ? "Mark Pending" : "Mark as Sent"}
                              </button>
                              <button
                                onClick={() => printSlips([e])}
                                className="text-gray-300 hover:text-gray-600 transition-colors"
                              >
                                <Printer size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TuteDispatch;
