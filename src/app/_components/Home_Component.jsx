"use client";
import React from "react";
import Link from "next/link";
import ImageSlider from "./ImageSlider";
import { useInView } from "@/hooks/useInView";

const Home = () => {
  const { ref, inView } = useInView();

  return (
    <div className="h-auto pt-16 flex flex-col relative" id="section_1">
      <div className="flex ">
        <ImageSlider />
      </div>

      {/* Buttons on the Slider */}
      <div
        ref={ref}
        className="w-[200px] hidden md:flex md:flex-col absolute gap-6 top-30 right-10 z-20"
      >
        <Link
          href="/courses"
          className={`group flex flex-col items-center justify-center h-18 mb-6  border-2 border-white rounded-xl 
                      transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 
                      ${inView ? "animate-slide-in-right" : "opacity-0 translate-x-full"}`}
        >
          <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-white group-hover:scale-110 transition-all duration-500">
            10 ශ්‍රේණිය
          </span>

          <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
        </Link>
        <Link
          href="/courses"
          className={`group flex flex-col items-center justify-center h-18 mb-6  border-2 border-white rounded-xl 
                      transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 
                      ${inView ? "animate-slide-in-right-2" : "opacity-0 translate-x-full"}`}
        >
          <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-white group-hover:scale-110 transition-all duration-500">
            11 ශ්‍රේණිය
          </span>

          <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
        </Link>
      </div>


      
      <div className="flex flex-col justify-center items-center gap-6 md:gap-10 w-full flex-grow bg-background p-6">
        {/* Container for all cards to ensure consistent width across rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-2xl">
          {/* Grade 10 Card */}
          <Link
            href="/courses?grade=10"
            className="group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              10 ශ්‍රේණිය
            </span>

            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Grade 11 Card */}
          <Link
            href="/courses?grade=11"
            className="group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              11 ශ්‍රේණිය
            </span>
            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Past Paper Discussion Card - Span 2 columns on desktop */}
          <Link
            href="/courses"
            className="md:col-span-2 group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              Past Paper Discussion
            </span>
            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
