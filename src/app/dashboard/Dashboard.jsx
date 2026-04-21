"use client";
import Sidebar from "../_components/Sidebar";
import React, { useState } from "react";

import CourseList from "../_admin_components/CourseList";

const Dashboard = ({ courses }) => {
  const [activeComponent, setActiveComponent] = useState("courses");
  return (
    <div className="flex flex-row w-screen h-screen ">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <div className="flex h-screen items-start justify-center flex-1 ml-[70px] md:ml-0 text-text">

        {activeComponent === "account" && <h1>Account Component</h1>}
        {activeComponent === "courses" && <CourseList initialCourses={courses} />}
        {activeComponent === "past-papers" && <h1>Past Papers Component</h1>}
        {activeComponent === "add" && <h1>Add Component</h1>}
        {activeComponent === "completed" && <h1>Completed Component</h1>}
      </div>
    </div>
  );
};

export default Dashboard;
