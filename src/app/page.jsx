/**
 * Copyright (c) 2026 Isuru Prabhath Kulasooriya. All rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
import Home_Component from "./_components/home_page/Home_Component";
import StatsSection from "./_components/home_page/StatsSection";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-top font-sans overflow-x-hidden ">
      
      <Home_Component />
      
      <StatsSection />
      
      <div className="min-h-screen w-screen bg-green-500 pt-16 px-6" id="section_3">
        <h1 className="w-full border border-white text-center">Hello World</h1>
      </div>
      <div className="min-h-screen w-screen bg-blue-500 pt-16 px-6 " id="section_4">
        <h1 className="w-full border border-white text-center">Hello World</h1>
      </div>
    </div>
  );
}
