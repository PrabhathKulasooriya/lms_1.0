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
  
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (isMaintenanceMode) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen font-sans bg-gray-50 text-center px-4">
        {/* Rotating Gears Animation */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Large Gear (Clockwise) */}
          <svg
            className="animate-spin text-blue-600 w-20 h-20 absolute top-2 left-2"
            style={{ animationDuration: "8s" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>

          {/* Small Gear (Counter-Clockwise) */}
          <svg
            className="animate-spin text-gray-400 w-14 h-14 absolute bottom-2 right-2"
            style={{ animationDuration: "6s", animationDirection: "reverse" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Under Maintenance
        </h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          We’ll be right back! Our site is currently undergoing scheduled
          updates to bring you a better experience.
        </p>

        <div className="text-sm text-gray-400">
          © 2026 Nexlearn.lk. All rights reserved.
        </div>
      </div>
    );
  }

  // Regular Page Layout
  return (
    <div className="flex flex-col flex-1 items-center justify-top font-sans overflow-x-hidden">
      <Home_Component />
      <StatsSection />
      <FounderSection />
      <Footer />
    </div>
  );
}
