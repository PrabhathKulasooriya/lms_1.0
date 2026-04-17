/**
 * Copyright (c) 2026 Isuru Prabhath Kulasooriya. All rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
import Home_Component from "./_components/Home_Component";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-top font-sans w-screen h-auto overflow-x-hidden ">
      
      <Home_Component />

      <div className="min-h-screen w-screen bg-red-500 pt-16" id="section_2">
        <h1 className="">Hello World</h1>
      </div>
      <div className="min-h-screen w-screen bg-green-500 pt-16" id="section_3">
        <h1 className="">Hello World</h1>
      </div>
      <div className="min-h-screen w-screen bg-blue-500 pt-16" id="section_4">
        <h1 className="">Hello World</h1>
      </div>
    </div>
  );
}
