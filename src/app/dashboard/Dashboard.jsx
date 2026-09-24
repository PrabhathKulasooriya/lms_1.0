"use client";

import React, { useState } from "react";
import Sidebar from "../_components/Sidebar";

import CourseList from "../_admin_components/CourseList";
import UserCourseList from "../_user_components/UserCourseList";
import Acc from "../_admin_components/Acc";
import UserList from "../_admin_components/UserList";
import EnrollmentList from "../_admin_components/EnrollmentsList";
import LessonList from "../_admin_components/LessonsList";
import TuteDispatch from "../_admin_components/TuteDispatch";
import GlobalExpirySettings from "../_admin_components/GlobalExpirySettings";

const Dashboard = ({ courses = [], user = null, enrollment = [] }) => {
  const [activeComponent, setActiveComponent] = useState("account");

  if (!user) {
    return (
      <div className="w-full h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-2 border-[#0b408e] border-t-transparent rounded-full animate-spin mb-3" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const role = user?.role;
  const isAdmin = role === "admin";

  return (
    <div className="flex flex-row w-full min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#9fe03c] selection:text-[#0b408e]">
      {/* Sidebar Panel */}
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        role={role}
      />

      {/* Main Workspace View */}
      <main className="flex-1 mt-16 ml-16 md:ml-0 p-4 md:p-8 overflow-y-auto max-w-full">
        <div className="max-w-7xl mx-auto">
          {activeComponent === "account" && <Acc user={user} />}

          {isAdmin && activeComponent === "all-courses" && (
            <CourseList initialCourses={courses} />
          )}

          {isAdmin && activeComponent === "courses" && (
            <UserCourseList enrollments={enrollment} />
          )}

          {isAdmin && activeComponent === "lessons" && (
            <LessonList courses={courses} />
          )}

          {isAdmin && activeComponent === "users" && <UserList />}

          {isAdmin && activeComponent === "enrollments" && (
            <EnrollmentList courses={courses} />
          )}

          {isAdmin && activeComponent === "tute" && (
            <TuteDispatch courses={courses} />
          )}

          {isAdmin && activeComponent === "settings" && (
            <GlobalExpirySettings />
          )}

          {/* User Specific Views */}
          {!isAdmin && activeComponent === "courses" && (
            <UserCourseList enrollments={enrollment} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
