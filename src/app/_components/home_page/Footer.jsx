"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useInView } from "@/hooks/useInView";
import { Phone, Mail, ChevronRight, LayoutDashboard, User } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import logo from "@/assets/logos/logo_2.png";

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
      className="bg-[#0b408e] w-full text-white pt-12 pb-8 border-t border-white/10 overflow-hidden"
    >
      <div
        className={`max-w-6xl mx-auto px-6 lg:px-8 transition-all duration-1000 transform ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-5">
            <Link
              href={"/"}
              onClick={handleHomeClick}
              className="flex-shrink-0 items-center gap-2 inline-flex md:justify-start justify-center w-full"
            >
              <Image
                src={logo}
                alt="NexLearn.lk Logo"
                className="h-auto w-40"
              />
            </Link>

            <p className="text-gray-200/90 text-sm font-medium leading-relaxed max-w-xs text-center md:text-left italic">
              The best online getaway to achieve your educational dreams.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3 justify-center md:justify-start pt-1">
              <Link
                href="https://www.facebook.com/share/1ECvTQxR5o/"
                target="blank"
                className="bg-white/10 p-2.5 rounded-full hover:bg-[#1877F2] hover:-translate-y-1 transition-all duration-300"
              >
                <FaFacebookF size={16} />
              </Link>
              <Link
                href="https://api.whatsapp.com/message/YFJHB7SESANDB1"
                target="blank"
                className="bg-white/10 p-2.5 rounded-full hover:bg-[#25D366] hover:-translate-y-1 transition-all duration-300"
              >
                <FaWhatsapp size={16} />
              </Link>
              <Link
                href="#"
                target="blank"
                className="bg-white/10 p-2.5 rounded-full hover:bg-black hover:-translate-y-1 transition-all duration-300"
              >
                <FaTiktok size={16} />
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
                { name: "Terms and Conditions", href: "/terms" },
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
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-200 group">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Phone size={18} />
                </div>
                <a
                  href="tel:0711562002"
                  className="text-sm font-medium hover:text-[#9fe03c] transition-colors duration-300"
                >
                  071 156 2002
                </a>
              </div>
              <div className="flex items-center gap-4 text-gray-200 group">
                <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <Mail size={18} />
                </div>
                <a
                  href="mailto:info@nexlearn.lk?subject=Inquiry from NexLearn Website"
                  className="text-sm font-medium hover:text-[#9fe03c] transition-colors duration-300"
                >
                  info@nexlearn.lk
                </a>
              </div>
            </div>
          </div>

          {/* Student Portal CTA */}
          <div
            className={`transition-all duration-700 delay-300 ${inView ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
          >
            <h3 className="text-[#FFD700] text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#9fe03c] rounded-full inline-block" />
              Portal
            </h3>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-[#9fe03c]">
                    <User size={15} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Welcome back!
                    </span>
                  </div>
                  <p className="text-sm text-white font-semibold">
                    {session.user.first_name || "Student"}{" "}
                    {session.user.last_name || ""}
                  </p>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95 text-sm"
                  >
                    <LayoutDashboard size={16} />
                    My Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-300/90 leading-relaxed italic">
                    Ready to start learning? Access your personalized dashboard
                    now.
                  </p>
                  <Link
                    href="/login"
                    className="block w-full py-3 bg-[#9fe03c] text-[#0b408e] text-center font-bold rounded-xl hover:bg-[#FFD700] transition-all duration-300 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-95 text-sm"
                  >
                    Login to LMS
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium text-center sm:text-left">
            © {currentYear} <span className="text-white">NexLearn.lk</span> —
            ALL RIGHTS RESERVED
          </p>

          {/* 👇 Cleaned up: Removed flashy background capsule pill, added flat text design with direct email mailto action */}
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-medium text-gray-400">
            <span>Developed by - </span>
            <a
              href="mailto:prabhath.kulasooriya@gmail.com?subject=NexLearn Developer Inquiry"
              className="text-white font-bold hover:text-[#9fe03c] transition-colors duration-200"
            >
              Isuru Prabhath Kulasooriya
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
