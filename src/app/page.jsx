/**
 * Copyright (c) 2026 Isuru Prabhath Kulasooriya. All rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
import Footer from "./_components/home_page/Footer";
import FounderSection from "./_components/home_page/FounderSection";
import Home_Component from "./_components/home_page/Home_Component";
import StatsSection from "./_components/home_page/StatsSection";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-top font-sans overflow-x-hidden ">
      
      <Home_Component />
      
      <StatsSection />
      
      <FounderSection/>

      <Footer />
    </div>
  );
}
