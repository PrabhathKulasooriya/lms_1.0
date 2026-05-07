"use client";
import Sidebar from "../_components/Sidebar";
import React, { useState } from "react";

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

  // BULLETPROOFING: If Next.js tries to build this without a user, render an empty state
  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Safe variable assignment
  const role = user?.role;
  const isAdmin = role === "admin";

  return (
    <div className="flex flex-row w-full max-w-screen h-full min-h-screen ">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        role={role} // Safely passing the role
      />
      <div className="flex items-start mt-16 justify-center flex-1 ml-[70px] md:ml-0 text-text">
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

        {isAdmin && activeComponent === "settings" && <GlobalExpirySettings />}

        {/* Normal User Views */}
        {!isAdmin && activeComponent === "courses" && (
          <UserCourseList enrollments={enrollment} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
