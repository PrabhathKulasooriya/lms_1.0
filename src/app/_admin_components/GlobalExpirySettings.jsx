"use client";
import React, { useState, useEffect } from "react";
import { CalendarClock, Save, Info } from "lucide-react";
import toast from "react-hot-toast";

const GlobalExpirySettings = () => {
  // State for Grade 10
  const [g10Current, setG10Current] = useState("");
  const [g10Selected, setG10Selected] = useState("");

  // State for Grade 11
  const [g11Current, setG11Current] = useState("");
  const [g11Selected, setG11Selected] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings/expiry")
      .then((res) => res.json())
      .then((data) => {
        if (data.dates) {
          const formatDate = (isoString) => {
            if (!isoString) return "";
            const d = new Date(isoString);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          };

          const d10 = formatDate(data.dates.EXPIRY_DATE_G10);
          setG10Current(d10);
          setG10Selected(d10);

          const d11 = formatDate(data.dates.EXPIRY_DATE_G11);
          setG11Current(d11);
          setG11Selected(d11);
        }
      });
  }, []);

  const handleUpdate = async (grade, dateValue) => {
    if (!dateValue) return toast.error("Please select a date");

    setLoading(true);
    try {
      const res = await fetch("/api/settings/expiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetGrade: grade, newDate: dateValue }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        if (grade === "10") setG10Current(dateValue);
        if (grade === "11") setG11Current(dateValue);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(`Failed to update Grade ${grade} settings`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2 w-full px-4 md:px-8 pb-8 font-sans">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <CalendarClock size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Course Expiry Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* ── Grade 10 Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Grade 10 Default Expiry
            </h2>
            <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium leading-snug">
                This date will be automatically applied to <strong>new</strong>{" "}
                Grade 10 enrollments. Existing students are not affected.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Expiry Date
              </label>
              <input
                type="date"
                value={g10Selected}
                onChange={(e) => setG10Selected(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-700 shadow-sm"
              />
            </div>

            <button
              onClick={() => handleUpdate("10", g10Selected)}
              disabled={loading || !g10Selected || g10Selected === g10Current}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border disabled:border-gray-200 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:shadow-none"
            >
              <Save size={16} />
              {loading ? "Updating..." : "Save Grade 10 Setting"}
            </button>
          </div>
        </div>

        {/* ── Grade 11 Card ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Grade 11 Default Expiry
            </h2>
            <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium leading-snug">
                This date will be automatically applied to <strong>new</strong>{" "}
                Grade 11 enrollments. Existing students are not affected.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Select Expiry Date
              </label>
              <input
                type="date"
                value={g11Selected}
                onChange={(e) => setG11Selected(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-700 shadow-sm"
              />
            </div>

            <button
              onClick={() => handleUpdate("11", g11Selected)}
              disabled={loading || !g11Selected || g11Selected === g11Current}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border disabled:border-gray-200 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:shadow-none"
            >
              <Save size={16} />
              {loading ? "Updating..." : "Save Grade 11 Setting"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalExpirySettings;
