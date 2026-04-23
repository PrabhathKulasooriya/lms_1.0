"use client";

import React, { useState } from "react";
import { GraduationCap, User, Menu, ChevronLeft, LibraryBig, Users, NotebookPen } from "lucide-react";

const Sidebar = ({ activeComponent, setActiveComponent, role }) => {
  const [isOpen, setIsOpen] = useState(false);

  const btnClass = (key) =>
    [
      "flex items-center md:gap-5 p-3 rounded-md hover:bg-[#c8c8c8] transition-colors",
      isOpen ? "gap-5" : "justify-start",
      activeComponent === key ? "bg-[#bebebe] shadow-inner" : "",
    ].join(" ");

  const iconClass = (key) =>
    [
      "w-6 h-6 flex-shrink-0 transition-colors",
      activeComponent === key ? "text-gray-900" : "text-gray-700",
    ].join(" ");

  const labelClass = (key) =>
    [
      "text-base font-medium whitespace-nowrap md:block",
      activeComponent === key ? "text-gray-900" : "text-gray-700",
      isOpen ? "block" : "hidden",
    ].join(" ");

  const handleClick = (key) => {
    setActiveComponent(key);
    setIsOpen(false);
  };

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
        <div className="w-8 h-8 flex flex-row justify-center items-center relative">
          {isOpen ? (
            <>
              <ChevronLeft size={28} className="text-gray-900" />
            </>
          ) : (
            <>
              <Menu size={28} className="text-gray-900" />
            </>
          )}
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
          {/* Account */}
          <button
            onClick={() => handleClick("account")}
            className={btnClass("account")}
          >
            <User className={iconClass("account")} />
            <span className={labelClass("account")}>Account</span>
          </button>

          {/* Courses */}
          {role === "admin" && (
            <button
              onClick={() => handleClick("courses")}
              className={btnClass("courses")}
            >
              <GraduationCap className={iconClass("courses")} />
              <span className={labelClass("courses")}>Manage Courses</span>
            </button>
          )}
          <button
            onClick={() => handleClick("mycourses")}
            className={btnClass("mycourses")}
          >
            <GraduationCap className={iconClass("mycourses")} />
            <span className={labelClass("mycourses")}>My Courses</span>
          </button>

          {role === "admin" && (
            <>
              {/* Lessons */}
              <button
                onClick={() => handleClick("lessons")}
                className={btnClass("lessons")}
              >
                <LibraryBig className={iconClass("lessons")} />
                <span className={labelClass("lessons")}>Lessons</span>
              </button>

              {/* Users */}
              <button
                onClick={() => handleClick("users")}
                className={btnClass("users")}
              >
                <Users className={iconClass("users")} />
                <span className={labelClass("users")}>Users</span>
              </button>

              {/* Enrollments */}
              <button
                onClick={() => handleClick("enrollments")}
                className={btnClass("enrollments")}
              >
                <NotebookPen className={iconClass("enrollments")} />
                <span className={labelClass("enrollments")}>Enrollments</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
