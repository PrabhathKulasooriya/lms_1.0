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

const Dashboard = ({ courses, user, enrollment}) => {

  const [activeComponent, setActiveComponent] = useState("account");
  
  
  return (
    <div className="flex flex-row w-screen h-screen ">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        role={user.role}
      />
      <div className="flex  items-start mt-16 justify-center flex-1 ml-[70px] md:ml-0 text-text">
        {activeComponent === "account" && <Acc user={user} />}
        {user.role === "admin" && activeComponent === "all-courses" && (
          <CourseList initialCourses={courses} />
        )}
        {user.role === "admin" && activeComponent === "courses" && (
          <UserCourseList enrollments={enrollment} />
        )}
        {user.role === "admin" && activeComponent === "lessons" && (
          <LessonList courses={courses} />
        )}
        {user.role === "admin" && activeComponent === "users" && <UserList />}
        {user.role === "admin" && activeComponent === "enrollments" && (
          <EnrollmentList courses={courses} />
        )}
        {user.role === "admin" && activeComponent === "tute" && (
          <TuteDispatch courses={courses} />
        )}
        {user.role === "admin" && activeComponent === "settings" && (
          <GlobalExpirySettings />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
