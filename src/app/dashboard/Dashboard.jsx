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

const Dashboard = ({ courses, user, enrollment }) => {
  const [activeComponent, setActiveComponent] = useState("account");

  // SAFETY CHECK: If the server-side redirect failed or data is hydrating
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="flex flex-row w-full max-w-screen h-full min-h-screen">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        role={user.role}
      />
      <div className="flex items-start mt-16 justify-center flex-1 ml-[70px] md:ml-0 text-text">
        {activeComponent === "account" && <Acc user={user} />}

        {/* Admin Only Routes */}
        {isAdmin && (
          <>
            {activeComponent === "all-courses" && (
              <CourseList initialCourses={courses} />
            )}
            {activeComponent === "courses" && (
              <UserCourseList enrollments={enrollment} />
            )}
            {activeComponent === "lessons" && <LessonList courses={courses} />}
            {activeComponent === "users" && <UserList />}
            {activeComponent === "enrollments" && (
              <EnrollmentList courses={courses} />
            )}
            {activeComponent === "tute" && <TuteDispatch courses={courses} />}
            {activeComponent === "settings" && <GlobalExpirySettings />}
          </>
        )}

        {/* Optional: Handle User specific views if role is 'user' */}
        {!isAdmin && activeComponent === "courses" && (
          <UserCourseList enrollments={enrollment} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
