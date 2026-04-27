"use client";

import React from "react";
import CountUp from "react-countup";
import { useInView } from "@/hooks/useInView";
import Image from "next/image";

import users from "@/assets/counter/users.webp";
import lecturer from "@/assets/counter/lecturer.webp";
import daily from "@/assets/counter/daily.webp";

const Counter = ({ number, title, inView, delay, imageSrc }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 transition-all duration-700 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
      `}
      style={{ transitionDelay: delay }}
    >
      {/* UPDATE: Removed the dashed border and gray background. */}
      <div className="mb-4 flex h-auto w-48  items-center justify-center transition-transform duration-500 hover:scale-105">
        {/* UPDATE: Changed h-16 w-16 to h-28 w-28 so the image fills the container nicely */}
        <Image
          src={imageSrc}
          alt={`${title} icon`}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Animated Number */}
      <div className="h-[60px] md:h-[72px] flex items-center">
        {inView ? (
          <CountUp
            duration={5}
            start={0}
            end={number}
            className="text-5xl font-bold text-[#0056b3] md:text-6xl"
          />
        ) : (
          <span className="text-5xl font-bold text-[#0056b3] md:text-6xl">
            0
          </span>
        )}
      </div>

      {/* Title/Label */}
      <span className="mt-3 text-center text-lg font-medium text-gray-800">
        {title}
      </span>
    </div>
  );
};

export default function StatsSection() {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className="w-full  py-16 font-sans overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2
          className={`mb-12 text-3xl font-bold uppercase text-[#0056b3] md:text-4xl transition-all duration-700 ease-out
            ${inView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"}
          `}
        >
          Our Students and Parents Love Us
        </h2>

        <div className="flex flex-col items-center justify-center gap-10 md:flex-row md:justify-around md:gap-4">
          <Counter
            number={203}
            title="Registered Students"
            inView={inView}
            delay="100ms"
            imageSrc={users}
          />
          <Counter
            number={3}
            title="Courses"
            inView={inView}
            delay="300ms"
            imageSrc={lecturer}
          />
          <Counter
            number={47}
            title="Daily Users"
            inView={inView}
            delay="500ms"
            imageSrc={daily}
          />
        </div>
      </div>
    </div>
  );
}
