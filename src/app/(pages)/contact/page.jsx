"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";

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
    <div className="min-h-screen bg-[#F8F9FA] pt-28 pb-20 px-6 selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#0b408e] uppercase tracking-tight mb-4">
            Get in <span className="text-[#9fe03c]">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Have questions about our courses or need technical support? Our team
            is here to help you every step of the way.
          </p>
          <div className="w-24 h-1.5 bg-[#FFD700] mx-auto mt-6 rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 bg-[#0b408e] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#9fe03c]/20 rounded-full -ml-16 -mb-16" />

            <h2 className="text-2xl font-bold mb-8 relative z-10">
              Contact Information
            </h2>

            <div className="space-y-8 relative z-10">
              <div className="flex items-start gap-5 group">
                <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-1">
                    Call Us
                  </p>
                  <p className="text-lg font-medium">074 244 3229</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-1">
                    Email Us
                  </p>
                  <p className="text-lg font-medium">info@nexlearn.lk</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-1">
                    Location
                  </p>
                  <p className="text-lg font-medium leading-snug">
                    Colombo, Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 relative z-10">
              <p className="text-sm text-gray-300 uppercase tracking-widest font-bold mb-6 text-center lg:text-left">
                Follow Our Journey
              </p>
              <div className="flex gap-4 justify-center lg:justify-start">
                {[
                  { Icon: FaFacebookF, color: "hover:bg-[#1877F2]", href: "#" },
                  { Icon: FaWhatsapp, color: "hover:bg-[#25D366]", href: "#" },
                  { Icon: FaTiktok, color: "hover:bg-black", href: "#" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className={`bg-white/10 p-4 rounded-full transition-all duration-300 ${social.color} hover:-translate-y-2`}
                  >
                    <social.Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0b408e] uppercase tracking-wider ml-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={formData.name}
                    required
                    placeholder="John Doe"
                    className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#9fe03c] focus:outline-none transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#0b408e] uppercase tracking-wider ml-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
                    required
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#9fe03c] focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0b408e] uppercase tracking-wider ml-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  onChange={handleChange}
                  value={formData.subject}
                  required
                  placeholder="Inquiry about Course Enrollment"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#9fe03c] focus:outline-none transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#0b408e] uppercase tracking-wider ml-2">
                  Your Message
                </label>
                <textarea
                  rows="5"
                  name="message"
                  onChange={handleChange}
                  value={formData.message}
                  required
                  placeholder="Write your message here..."
                  className="w-full px-6 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-100 focus:border-[#9fe03c] focus:outline-none transition-all duration-300 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-fit px-12 py-4 bg-[#9fe03c] text-[#0b408e] font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-[#0b408e] hover:text-white transition-all duration-500 shadow-lg shadow-[#9fe03c]/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    SEND MESSAGE
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
