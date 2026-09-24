"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  User,
  Menu,
  ChevronLeft,
  LibraryBig,
  Users,
  NotebookPen,
  FileText,
  Bolt,
  GalleryVertical,
} from "lucide-react";

const Sidebar = ({ activeComponent, setActiveComponent, role }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { key: "account", label: "My Account", icon: User, show: true },
    { key: "courses", label: "My Courses", icon: GraduationCap, show: true },
    { key: "all-courses", label: "Manage Courses", icon: GraduationCap, show: role === "admin" },
    { key: "lessons", label: "Manage Lessons", icon: LibraryBig, show: role === "admin" },
    { key: "users", label: "Manage Users", icon: Users, show: role === "admin" },
    { key: "enrollments", label: "Enrollments", icon: NotebookPen, show: role === "admin" },
    { key: "tute", label: "Send Tutes", icon: FileText, show: role === "admin" },
    { key: "settings", label: "Settings", icon: Bolt, show: role === "admin" },
    { key: "slider", label: "Slider Images", icon: GalleryVertical, show: role === "admin" },
  ];

  const handleClick = (key) => {
    setActiveComponent(key);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Click-outside overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
        className={`md:hidden fixed top-20 z-50 p-2.5 rounded-xl bg-white border border-slate-200 shadow-lg text-slate-700 hover:text-[#0b408e] transition-all duration-300 ${
          isOpen ? "left-[210px]" : "left-4"
        }`}
      >
        {isOpen ? <ChevronLeft size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed md:static h-full pt-28 md:pt-20 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-[240px] px-4" : "w-[72px] px-2"
        } md:w-[260px] md:px-4`}
      >
        <div className="flex flex-col gap-1.5 py-4">
          

          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const IconComponent = item.icon;
              const isActive = activeComponent === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleClick(item.key)}
                  className={`group relative flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-[#0b408e] text-white shadow-md shadow-[#0b408e]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0b408e]"
                  }`}
                >
                  <IconComponent
                    size={20}
                    className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? "text-[#9fe03c]" : "text-slate-500 group-hover:text-[#0b408e]"
                    }`}
                  />
                  <span
                    className={`whitespace-nowrap ${
                      isOpen ? "block" : "hidden md:block"
                    }`}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-5 bg-[#9fe03c] rounded-full hidden md:block" />
                  )}
                </button>
              );
            })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 mb-6 bg-slate-50 rounded-2xl border border-slate-100 hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0b408e]/10 text-[#0b408e] flex items-center justify-center font-bold text-xs">
            NL
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">NexLearn LMS</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">v1.0 • Portal</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
