"use client";
import Sidebar from "../_components/Sidebar";
import React, { useState } from "react";


import CourseList from "../_admin_components/CourseList";
import UserCourseList from "../_user_components/UserCourseList";
import Acc from "../_admin_components/Acc";

const Dashboard = ({ courses, user, enrollment, params}) => {

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
        {user.role === "admin" && activeComponent === "courses" && (
          <CourseList initialCourses={courses} />
        )}
        {activeComponent === "mycourses" && (
          <UserCourseList enrollments={enrollment} />
        )}
        {activeComponent === "lessons" && (
          <h1 className="">Lessons Component</h1>
        )}
        {activeComponent === "users" && <h1>Users Component</h1>}
        {activeComponent === "completed" && <h1>Completed Component</h1>}
      </div>
    </div>
  );
};

export default Dashboard;
