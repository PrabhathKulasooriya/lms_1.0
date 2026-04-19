"use client"
import Sidebar from '../_components/Sidebar'
import React,{useState} from 'react'

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("orders");
  return (
    <div className='flex flex-row w-screen h-screen '>
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent}/>
      <div className='flex h-screen items-center justify-center flex-1 bg-green-500 pt-16'>
       {activeComponent === "orders" && <h1>Orders Component</h1>}
       {activeComponent === "list" && <h1>List Component</h1>}
       {activeComponent === "add" && <h1>Add Component</h1>}
       {activeComponent === "completed" && <h1>Completed Component</h1>}
      </div>
    </div>
  )
}

export default Dashboard
