"use client";
import Sidebar from "../_components/Sidebar";
import React, { useState } from "react";


import CourseList from "../_admin_components/CourseList";
import Acc from "../_admin_components/Acc";

const Dashboard = ({ courses, user }) => {

  const [activeComponent, setActiveComponent] = useState("account");
  
  return (
    <div className="flex flex-row w-screen h-screen ">
      <Sidebar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <div className="flex  items-start mt-16 justify-center flex-1 ml-[70px] md:ml-0 text-text">
        {activeComponent === "account" && <Acc user={user}/>}
        {activeComponent === "courses" && <CourseList initialCourses={courses} />}
        {activeComponent === "past-papers" && (
          <h1 className="">Past Papers Component</h1>
        )}
        {activeComponent === "add" && <h1>Add Component</h1>}
        {activeComponent === "completed" && <h1>Completed Component</h1>}
      </div>
    </div>
  );
};

export default Dashboard;
