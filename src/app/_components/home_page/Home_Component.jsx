"use client";
import React from "react";
import Link from "next/link";
import ImageSlider from "@/app/_components/ImageSlider";
import { useInView } from "@/hooks/useInView";
import Image from "next/image";

import bg_1 from "@/assets/bg/bg_1.webp";
import bg_2 from "@/assets/bg/bg_2.webp";

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
          href="/courses?type=theory&grade=10"
          className={`group flex flex-col items-center justify-center h-24 mb-6  border-2 border-white rounded-xl 
                      transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 
                      ${inView ? "animate-slide-in-right" : "opacity-0 translate-x-full"}`}
        >
          <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-white group-hover:scale-110 transition-all duration-500">
            10 ශ්‍රේණිය
          </span>

          <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
        </Link>
        <Link
          href="/courses?type=theory&grade=11"
          className={`group flex flex-col items-center justify-center h-24 mb-6  border-2 border-white rounded-xl 
                      transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 
                      ${inView ? "animate-slide-in-right-2" : "opacity-0 translate-x-full"}`}
        >
          <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-white group-hover:scale-110 transition-all duration-500">
            11 ශ්‍රේණිය
          </span>

          <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
        </Link>
      </div>

      <div className="flex pt-16 flex-col justify-center items-center gap-6 md:gap-10 w-full flex-grow  p-6">
        {/* Container for all cards to ensure consistent width across rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-2xl">
          {/* Grade 10 Card -------------------------------------------------------------------------------------------------------------*/}
          {/* <Link
            href="/courses?type=theory&grade=10"
            className="group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              10 ශ්‍රේණිය
            </span>

            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link> */}

          <Link
            href="/courses?type=theory&grade=10"
            /* Added z-0 to establish a new stacking context */
            className="relative z-0 group flex flex-col items-center justify-center h-32 border-2 border-[#1a4d44] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#1a4d44]/40"
          >
            {/* 1. Background Image - Using the 'bg_1' variable you imported */}
            <Image
              src={bg_1}
              alt="Grade 10 background"
              fill
              placeholder="blur"
              /* object-cover ensures it fills the button, -z-20 pushes it to the bottom */
              className="object-cover -z-20 transition-transform duration-700 group-hover:scale-110"
            />

            {/* 2. Dark Overlay - -z-10 sits above image but below text */}
            <div className="absolute inset-0 bg-[#061a17]/50 group-hover:bg-[#061a17]/40 transition-colors duration-500 -z-10" />

            <span className="relative z-10 text-2xl md:text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-all duration-500">
              10 ශ්‍රේණිය
            </span>

            <div className="relative z-10 w-0 h-1 bg-yellow-400 mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Grade 11 Card------------------------------------------------------------------------ */}
          {/* <Link
            href="/courses?type=theory&grade=11"
            className="group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              11 ශ්‍රේණිය
            </span>
            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link> */}

          <Link
            href="/courses?type=theory&grade=11"
            /* Added z-0 to establish a new stacking context */
            className="relative z-0 group flex flex-col items-center justify-center h-32 border-2 border-[#1a4d44] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#1a4d44]/40"
          >
            {/* 1. Background Image - Using the 'bg_1' variable you imported */}
            <Image
              src={bg_1}
              alt="Grade 10 background"
              fill
              placeholder="blur"
              /* object-cover ensures it fills the button, -z-20 pushes it to the bottom */
              className="object-cover -z-20 transition-transform duration-700 group-hover:scale-110"
            />

            {/* 2. Dark Overlay - -z-10 sits above image but below text */}
            <div className="absolute inset-0 bg-[#061a17]/50 group-hover:bg-[#061a17]/40 transition-colors duration-500 -z-10" />

            {/* 3. Text content */}
            <span className="relative z-10 text-2xl md:text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-all duration-500">
              11 ශ්‍රේණිය
            </span>

            {/* 4. Animated Underline */}
            <div className="relative z-10 w-0 h-1 bg-yellow-400 mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Past Paper Discussion Card - Span 2 columns on desktop ----------------------------------*/}
          {/* <Link
            href="/courses?type=pastpaper"
            className="md:col-span-2 group flex flex-col items-center justify-center h-32 bg-white border-2 border-primary rounded-xl transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="text-2xl md:text-3xl font-bold text-primary group-hover:text-white group-hover:scale-110 transition-all duration-500">
              Past Paper Discussion
            </span>
            <div className="w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link> */}
          <Link
            href="/courses?type=pastpaper"
            className="relative z-0 md:col-span-2 group flex flex-col items-center justify-center h-32 border-2 border-primary/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            {/* 1. Optimized Background Image (bg_2) */}
            <Image
              src={bg_2}
              alt="Past Paper background"
              fill
              placeholder="blur"
              className="object-cover object-bottom -z-20 transition-transform duration-700 group-hover:scale-105"
            />

            {/* 2. Light White Overlay (To keep the pastel aesthetic but soften the image) */}
            <div className="absolute inset-0 bg-white/50 group-hover:bg-white/40 transition-colors duration-500 -z-10" />

            {/* 3. Text Content (Using Primary color or Dark Teal for contrast on white) */}
            <span className="relative z-10 text-2xl md:text-3xl font-bold text-primary group-hover:scale-110 transition-all duration-500">
              Past Paper Discussion
            </span>

            {/* 4. Animated Underline */}
            <div className="relative z-10 w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-48 rounded-full" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
