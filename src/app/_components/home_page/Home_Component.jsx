"use client";
import React from "react";
import Link from "next/link";
import ImageSlider from "@/app/_components/home_page/ImageSlider";
import { useInView } from "@/hooks/useInView";
import Image from "next/image";

import bg_1 from "@/assets/bg/bg_1.webp";
import bg_2 from "@/assets/bg/bg_2.webp";

const Home = () => {
  const { ref, inView } = useInView();

  return (
    <div className="h-auto flex flex-col relative" id="section_1">
      <div className="flex">
        <ImageSlider />
      </div>

      {/* Course Selectors Section */}
      <div className="relative flex py-16 flex-col justify-center items-center gap-6 md:gap-10 w-full flex-grow p-6 overflow-hidden">
        

        {/* Card grid — sits above all background layers */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-2xl">
          {/* Grade 10 Card */}
          <Link
            href="/courses?type=theory&grade=10"
            className="relative z-0 group flex flex-col items-center justify-center h-32 border-2 border-[#1a4d44] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
          >
            <Image
              src={bg_1}
              alt="Grade 10 background"
              fill
              placeholder="blur"
              className="object-cover -z-20 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#061a17]/20 group-hover:bg-[#061a17]/40 transition-colors duration-500 -z-10" />
            <span className="relative z-10 text-2xl md:text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-all duration-500">
              10 ශ්‍රේණිය
            </span>
            <div className="relative z-10 w-0 h-1 bg-yellow-400 mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Grade 11 Card */}
          <Link
            href="/courses?type=theory&grade=11"
            className="relative z-0 group flex flex-col items-center justify-center h-32 border-2 border-[#1a4d44] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
          >
            <Image
              src={bg_1}
              alt="Grade 11 background"
              fill
              placeholder="blur"
              className="object-cover -z-20 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[#061a17]/20 group-hover:bg-[#061a17]/40 transition-colors duration-500 -z-10" />
            <span className="relative z-10 text-2xl md:text-3xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-all duration-500">
              11 ශ්‍රේණිය
            </span>
            <div className="relative z-10 w-0 h-1 bg-yellow-400 mt-2 transition-all duration-500 group-hover:w-32 rounded-full" />
          </Link>

          {/* Past Paper Discussion Card */}
          <Link
            href="/courses?type=pastpaper"
            className="relative z-0 md:col-span-2 group flex flex-col items-center justify-center h-32 border-2 border-primary/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/40"
          >
            <Image
              src={bg_2}
              alt="Past Paper background"
              fill
              placeholder="blur"
              className="object-cover object-bottom -z-20 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-white/50 group-hover:bg-white/40 transition-colors duration-500 -z-10" />
            <span className="relative z-10 text-2xl md:text-3xl font-bold text-primary group-hover:scale-110 transition-all duration-500">
              විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව
            </span>
            <div className="relative z-10 w-0 h-1 bg-accent mt-2 transition-all duration-500 group-hover:w-48 rounded-full" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
