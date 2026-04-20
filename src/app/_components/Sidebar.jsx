"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, LayoutList, PlusSquare, GraduationCap ,User} from "lucide-react";

const navItems = [

  { key: "account", label: "Account", icon: User },
  { key: "courses", label: "Courses", icon: GraduationCap },
  { key: "list", label: "List Products", icon: GraduationCap },
  { key: "add", label: "Add Product", icon: GraduationCap },
  { key: "completed", label: "Completed Orders", icon: GraduationCap },
];

const Sidebar = ({ activeComponent, setActiveComponent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen h-full">
      {/* Click-outside overlay — Mobile Only */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hamburger Button — Mobile Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className={[
          "md:hidden fixed top-[70px] z-50 p-2 rounded-md",
          "bg-[#eaeaea] hover:bg-[#d5d5d5] transition-all duration-300",
          isOpen ? "left-[200px]" : "left-3",
        ].join(" ")}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center relative">
          <span
            className={[
              "block h-0.5 w-full bg-gray-800 transition-transform absolute",
              isOpen ? "rotate-45" : "-translate-y-2",
            ].join(" ")}
          />
          <span
            className={[
              "block h-0.5 w-full bg-gray-800 transition-opacity",
              isOpen ? "opacity-0" : "",
            ].join(" ")}
          />
          <span
            className={[
              "block h-0.5 w-full bg-gray-800 transition-transform absolute",
              isOpen ? "-rotate-45" : "translate-y-2",
            ].join(" ")}
          />
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={[
          "fixed md:static h-full pt-[120px] md:pt-20",
          "bg-[#eaeaea] flex flex-col gap-8 transition-all duration-300 ease-in-out z-40",
          isOpen ? "w-[250px]" : "w-[70px]",
          "md:w-[30vw] lg:w-[18vw]",
        ].join(" ")}
      >
        <div
          className={[
            "w-full flex flex-col gap-4 md:px-4",
            isOpen ? "px-4" : "px-2",
          ].join(" ")}
        >
          {navItems.map(({ key, label, icon: Icon, href }) => {
            const isActive = activeComponent === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveComponent(key);
                  setIsOpen(false);
                }}
                className={[
                  "flex items-center md:gap-5 p-3 rounded-md hover:bg-[#c8c8c8] transition-colors",
                  isOpen ? "gap-5" : "justify-start",
                  isActive ? "bg-[#bebebe] shadow-inner" : "",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "w-6 h-6 flex-shrink-0 transition-colors",
                    isActive ? "text-gray-900" : "text-gray-700",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-base font-medium whitespace-nowrap md:block",
                    isActive ? "text-gray-900" : "text-gray-700",
                    isOpen ? "block" : "hidden",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
