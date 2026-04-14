"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, BookOpen, LogIn, Mail, Home, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const rightNavLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Contact Us", href: "/contact", icon: Mail },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const { data: session, status } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle clicking outside the side drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Lock scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  const baseClasses =
    "flex items-center gap-1.5 px-3 py-2 text-white hover:text-[#FFD700] transition-all duration-300 hover:scale-105 rounded-md font-medium text-md";
  const authButtonBase =
    "flex items-center gap-1.5 px-2 py-2 rounded-full font-semibold text-md transition-all duration-300";

  return (
    <nav className="bg-primary fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="max-w-screen ">
        <div className="flex flex-row items-center justify-between h-16 w-screen ">
          {/* LOGO */}
          <div className="flex items-center justify-start md:w-1/4 pl-4 md:pl-8">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-extrabold text-[#9fe03c] tracking-tight">
                Commerce with{" "}
                <span className="text-white font-light">Hasindu</span>
              </span>
            </Link>
          </div>

          {/* DESKTOP VIEW */}
          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center space-x-2 md:w-1/2">
            {rightNavLinks.map((link) => (
              <Link key={link.name} href={link.href} className={baseClasses}>
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </div>

          {/*Name Logout & Login register Links Desktop */}

          <div className="hidden md:flex flex flex-row items-center justify-end md:w-1/4 pr-8">
            {session ? (
              <div className="flex items-center gap-4">
                {/* User Display Name */}
                <span className="text-white font-medium text-sm flex items-center gap-2">
                  Hi, {session.user?.first_name}
                </span>
                <div className="w-px h-6 bg-gray-500 mx-3"></div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={`${authButtonBase} text-greenaccent hover:scale-105 hover:text-accent cursor-pointer `}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className={`${authButtonBase} text-[#9fe03c] hover:scale-105 hover:text-accent`}
                >
                  Register
                </Link>
                <div className="w-px h-6 bg-gray-500 mx-3"></div>
                <Link
                  href="/login"
                  className={`${authButtonBase} text-zinc-50 hover:scale-105 hover:text-accent`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}{" "}
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <div className="flex md:hidden mx-2">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white z-[60] transition-all duration-300 relative"
            >
              {isOpen ? (
                <X size={28} className="text-white" />
              ) : (
                <Menu size={28} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDE DRAWER (Right Side) */}

      {/* Dark Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 md:hidden z-40 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* The Drawer Content */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-screen w-[75%] sm:w-[60%] bg-primary shadow-2xl transition-transform duration-300 ease-in-out transform md:hidden z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center pt-24 space-y-8 h-full">
          {/* Centered Mobile Links */}
          {rightNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMenu}
              className="flex items-center gap-4 text-xl font-medium text-white hover:text-greenaccent transition-colors"
            >
              <link.icon className="w-6 h-6" />
              {link.name}
            </Link>
          ))}

          <div className="w-2/3 h-px bg-white/10 my-4"></div>

          {/* Centered Auth Buttons */}
          <div className="flex flex-col w-full px-8 gap-5">
            {session ? (
              <>
                {/* User Welcome Message - Subtle, no border */}
                <div className="w-full text-center py-2 text-white/70 font-medium flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-greenaccent animate-pulse" />
                  Hi,{" "}
                  <span className="text-white font-bold">
                    {session.user?.first_name}
                  </span>
                </div>

                {/* Logout Button - Distinctive and clear */}
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    closeMenu();
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full border border-greenaccent text-greenaccent  font-semibold bg-red-500/5 active:bg-red-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full text-center py-3.5 rounded-full border border-white/30 text-white font-semibold active:bg-white/10 transition-all"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="w-full text-center py-3.5 rounded-full bg-greenaccent text-[#010048] font-bold shadow-lg active:scale-95 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
