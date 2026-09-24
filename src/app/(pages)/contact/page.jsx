"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Sparkles } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Sending your message...");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Message sent successfully!", { id: toastId });
      e.target.reset();
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message || "Failed to send message.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6 lg:px-12 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0b408e] tracking-tight mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Have questions about course enrollment, class schedules, or LMS
            access? Send us a message and our team will get back to you
            promptly.
          </p>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            පාඨමාලා ලියාපදිංචිය, පන්ති කාලසටහන් හෝ LMS පද්ධතියට පිවිසීම
            සම්බන්ධයෙන් ඔබට යම් ගැටළුවක් තිබේද? අප වෙත පණිවිඩයක් යොමු කරන්න,
            අපගේ කණ්ඩායම කඩිනමින් ඔබට සහය වීමට සූදානම්.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
          {/* Contact Details Card (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-5 bg-[#071933] rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 flex flex-col justify-between"
          >
            {/* Ambient Background Orbs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0b408e]/50 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#9fe03c]/20 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#9fe03c] text-xs font-bold uppercase tracking-wider mb-4">
                Quick Contact Info
              </span>

              <div className="space-y-6">
                {/* Phone */}
                <Link
                  href="tel:0711562002"
                  className="flex items-center gap-4 group p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#9fe03c] group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-colors duration-300 shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Call Us or Drop a Whatsapp Message
                    </p>
                    <p className="text-base font-bold text-white group-hover:text-[#9fe03c] transition-colors">
                      071 156 2002
                    </p>
                  </div>
                </Link>

                {/* Email */}
                <a
                  href="mailto:info@nexlearn.lk?subject=Inquiry from NexLearn Website"
                  className="flex items-center gap-4 group p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#9fe03c] group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-colors duration-300 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Email Us
                    </p>
                    <p className="text-base font-bold text-white group-hover:text-[#9fe03c] transition-colors">
                      info@nexlearn.lk
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#9fe03c] shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-base font-bold text-white">
                      Kuliyapitiya, Sri Lanka
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                Follow Us
              </p>
              <div className="flex gap-3">
                <Link
                  href="https://www.facebook.com/share/1ECvTQxR5o/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 transition-all duration-300"
                >
                  <FaFacebookF size={15} />
                </Link>
                <Link
                  href="https://api.whatsapp.com/message/YFJHB7SESANDB1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] hover:-translate-y-1 transition-all duration-300"
                >
                  <FaWhatsapp size={16} />
                </Link>
                <Link
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center hover:bg-black hover:border-black hover:-translate-y-1 transition-all duration-300"
                >
                  <FaTiktok size={15} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Card (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200/80"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={formData.name}
                    required
                    placeholder="Isuru Prabhath"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 text-slate-800 text-sm placeholder-slate-400 outline-none transition duration-200"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
                    required
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 text-slate-800 text-sm placeholder-slate-400 outline-none transition duration-200"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  onChange={handleChange}
                  value={formData.subject}
                  required
                  placeholder="Inquiry about Grade 10 Commerce Class"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 text-slate-800 text-sm placeholder-slate-400 outline-none transition duration-200"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Your Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  onChange={handleChange}
                  value={formData.message}
                  required
                  placeholder="Write your message or question here..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0b408e] focus:ring-2 focus:ring-[#0b408e]/20 text-slate-800 text-sm placeholder-slate-400 outline-none transition duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3.5 bg-[#0b408e] hover:bg-[#093372] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0b408e]/25 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Sending Message...
                  </span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
