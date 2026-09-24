"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Phone, Mail, ChevronRight, LayoutDashboard, User, ArrowUpRight } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import logo from "@/assets/logos/logo_2.png";

const Footer = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const handleHomeClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      const mainContainer = document.getElementById("main-scroll");
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-[#061833] w-full text-white pt-16 pb-10 border-t border-white/10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 lg:px-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link
              href={"/"}
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2"
            >
              <Image
                src={logo}
                alt="NexLearn.lk Logo"
                className="h-auto w-44"
              />
            </Link>

            <p className="text-slate-300 text-sm font-normal leading-relaxed max-w-xs">
              The premier online learning platform empowering Sri Lankan O/L Commerce students to achieve academic excellence.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <Link
                href="https://www.facebook.com/share/1ECvTQxR5o/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 transition-all duration-300"
              >
                <FaFacebookF size={15} />
              </Link>
              <Link
                href="https://api.whatsapp.com/message/YFJHB7SESANDB1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] hover:-translate-y-1 transition-all duration-300"
              >
                <FaWhatsapp size={16} />
              </Link>
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-black hover:border-black hover:-translate-y-1 transition-all duration-300"
              >
                <FaTiktok size={15} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#FFD700] text-base font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#9fe03c] rounded-full inline-block" />
              Quick Links
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: "Home", href: "/", click: handleHomeClick },
                { name: "Courses", href: "/courses" },
                { name: "Contact", href: "/contact" },
                { name: "Terms and Conditions", href: "/terms" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={link.click}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-[#9fe03c] transition-colors duration-200 group text-sm"
                  >
                    <ChevronRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform text-[#FFD700]"
                    />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-[#FFD700] text-base font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#9fe03c] rounded-full inline-block" />
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-slate-300 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#9fe03c] group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Phone size={16} />
                </div>
                <a
                  href="tel:0711562002"
                  className="text-sm font-medium hover:text-[#9fe03c] transition-colors duration-200"
                >
                  071 156 2002
                </a>
              </div>
              <div className="flex items-center gap-3.5 text-slate-300 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#9fe03c] group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Mail size={16} />
                </div>
                <a
                  href="mailto:info@nexlearn.lk?subject=Inquiry from NexLearn Website"
                  className="text-sm font-medium hover:text-[#9fe03c] transition-colors duration-200"
                >
                  info@nexlearn.lk
                </a>
              </div>
            </div>
          </div>

          {/* Student Portal Card */}
          <div>
            <h3 className="text-[#FFD700] text-base font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#9fe03c] rounded-full inline-block" />
              Student Portal
            </h3>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-5 space-y-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-[#9fe03c]">
                    <User size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Welcome Back
                    </span>
                  </div>
                  <p className="text-sm text-white font-semibold truncate">
                    {session.user.first_name || "Student"}{" "}
                    {session.user.last_name || ""}
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 text-sm shadow-md"
                  >
                    <LayoutDashboard size={16} />
                    <span>My Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Access your personalized LMS dashboard to view lessons and resources.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 text-sm shadow-md"
                  >
                    <span>Login to LMS</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p className="uppercase tracking-wider font-medium text-center sm:text-left">
            © {currentYear} <span className="text-white font-semibold">NexLearn.lk</span> — ALL RIGHTS RESERVED
          </p>

          <div className="flex items-center gap-1.5 tracking-wider uppercase font-medium">
            <span>Developed by</span>
            <a
              href="mailto:prabhath.kulasooriya@gmail.com?subject=NexLearn Developer Inquiry"
              className="text-white font-bold hover:text-[#9fe03c] transition-colors duration-200"
            >
              Isuru Prabhath Kulasooriya
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
