"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useInView } from "@/hooks/useInView";
import { Phone, Mail, ChevronRight, LayoutDashboard, User } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";

const Footer = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { ref, inView } = useInView();

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
    <footer
      ref={ref}
      className="bg-[#0b408e] w-full text-white pt-8 pb-8 border-t border-white/10 overflow-hidden"
    >
      <div
        className={`max-w-6xl mx-auto px-6 lg:px-8 transition-all duration-1000 transform ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="inline-block group"
            >
              <span className="text-2xl font-extrabold text-[#9fe03c] tracking-tight transition-transform duration-300 group-hover:scale-105 block">
                Commerce with{" "}
                <span className="text-white font-light">Hasindu</span>
              </span>
            </Link>
            <p className="text-gray-200 text-sm leading-relaxed max-w-xs">
              Providing world-class commerce education to help you excel in your
              academic journey.
            </p>
            <div className="flex gap-4">
              <Link
                href="#"
                className="bg-white/10 p-3 rounded-full hover:bg-[#1877F2] hover:-translate-y-1 transition-all duration-300"
              >
                <FaFacebookF size={18} />
              </Link>
              <Link
                href="#"
                className="bg-white/10 p-3 rounded-full hover:bg-[#25D366] hover:-translate-y-1 transition-all duration-300"
              >
                <FaWhatsapp size={18} />
              </Link>
              <Link
                href="#"
                className="bg-white/10 p-3 rounded-full hover:bg-black hover:-translate-y-1 transition-all duration-300"
              >
                <FaTiktok size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div
            className={`transition-all duration-700 delay-100 ${inView ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            <h3 className="text-[#FFD700] text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#9fe03c] rounded-full inline-block" />
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/", click: handleHomeClick },
                { name: "Courses", href: "/courses" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={link.click}
                    className="flex items-center gap-2 text-gray-200 hover:text-[#9fe03c] transition-all duration-300 group text-sm"
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

          {/* Contact Details */}
          <div
            className={`transition-all duration-700 delay-200 ${inView ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            <h3 className="text-[#FFD700] text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#9fe03c] rounded-full inline-block" />
              Contact Us
            </h3>
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-gray-200 group cursor-pointer">
                <div className="bg-white/5 p-2.5 rounded-lg group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Phone size={20} />
                </div>
                <a
                  href="tel:0742443229"
                  className="text-sm hover:text-[#9fe03c] transition-colors duration-300"
                >
                  074 244 3229
                </a>
              </div>
              <div className="flex items-center gap-4 text-gray-200 group cursor-pointer">
                <div className="bg-white/5 p-2.5 rounded-lg group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Mail size={20} />
                </div>
                <a
                  href="mailto:info@ltcacademy.online?subject=Inquiry from Commerce with Hasindu"
                  className="text-sm hover:text-[#9fe03c] transition-colors duration-300"
                >
                  info@ltcacademy.online
                </a>
              </div>
            </div>
          </div>

          {/* Student Portal CTA*/}
          <div
            className={`transition-all duration-700 delay-300 ${inView ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            <h3 className="text-[#FFD700] text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#9fe03c] rounded-full inline-block" />
              Portal
            </h3>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-[#9fe03c]">
                    <User size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Welcome back!
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">
                    {session.user.first_name || "Student"}{" "}
                    {session.user.last_name || ""}
                  </p>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95"
                  >
                    <LayoutDashboard size={18} />
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    Ready to start learning? Access your personalized dashboard
                    now.
                  </p>
                  <Link
                    href="/login"
                    className="block w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95"
                  >
                    Login to LMS
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
            © {currentYear}{" "}
            <span className="text-white">Commerce With Hasidu</span> — ALL
            RIGHTS RESERVED
          </p>
          {/* <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
              Developed by
            </span>
            <span className="text-[10px] text-[#9fe03c] font-black tracking-widest">
              Isuru Prabhath Kulasooriya
            </span>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
