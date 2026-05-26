"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Navigation, Autoplay } from "swiper/modules";
import { useInView } from "@/hooks/useInView";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Local Images
import image1 from "@/assets/slider/1.webp";
import image2 from "@/assets/slider/2.webp";
import image3 from "@/assets/slider/3.webp";
import image4 from "@/assets/slider/4.webp";

// ─── SLIDER TEXT CONFIGURATION ──────────────────────────────────────────────
const sliderData = [
  {
    image: image1,
    heading: "Empower Your Future",
    description: "The best online getaway to achieve your educational dreams.",
  },
  {
    image: image2,
    heading: "Master Your Syllabus",
    description:
      "Simplified theory lessons, comprehensive study notes, and expert guidance for Grade 10 & 11 Commerce.",
  },
  {
    image: image3,
    heading: "Ace Your O/L Exams",
    description:
      "Deep-dive past paper discussions and real exam-marking schemes to maximize your scores.",
  },
  {
    image: image4,
    heading: "Road to Achieve Your '9A's",
    description:
      "Turn your academic goals into reality with structured revision programs built for top results.",
  },
];

// ─── SLIDE TEXT RENDER COMPONENT ────────────────────────────────────────────
const SlideText = ({ heading, description }) => {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`absolute top-1/2 left-1/2 md:left-1/4 transform -translate-x-1/2 md:-translate-x-1/4
        w-[85%] md:w-[500px] text-left text-white z-20 transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1) flex flex-col gap-2 md:gap-3
        ${
          inView
            ? "opacity-100 -translate-y-1/2" // Smooth landing right at the center focus point
            : "opacity-0 -translate-y-[40%]" // Commences slightly lower to build the cinematic vertical lift
        }`}
    >
      {/* Accent Bar */}
      <div className="w-12 h-1 bg-[#9fe03c] rounded-full" />

      {/* Separated Heading */}
      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-md">
        {heading}
      </h2>

      {/* Separated Description */}
      <p className="text-sm md:text-base font-normal text-gray-200/90 leading-relaxed max-w-md drop-shadow-sm">
        {description}
      </p>
    </div>
  );
};

// ─── MAIN SLIDER COMPONENT ──────────────────────────────────────────────────
const ImageSlider = () => {
  return (
    <div className="h-[300px] md:h-[500px] overflow-hidden w-full bg-black">
      {/* Override Swiper's inline transition-timing-function */}
      <style>{`
        .image-slider .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.8, 0.0, 1.1, 1.0) !important;
        }
        /* Custom styling for Swiper dots to match NexLearn colors */
        .image-slider .swiper-pagination-bullet-active {
          background: #9fe03c !important;
          width: 24px !important;
          border-radius: 4px !important;
          transition: all 0.3s ease;
        }
      `}</style>

      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        pagination={{ clickable: true }}
        navigation={false}
        speed={1200}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        modules={[Pagination, Navigation, Autoplay, EffectFade]}
        className="image-slider h-full w-screen"
      >
        {sliderData.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="relative flex items-center justify-center overflow-hidden h-auto"
          >
            {/* Layer 1: Clean High-Contrast Background setup */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0} // Heavy optimization step to boost LCP speeds on first paint load
                className="object-cover scale-105 brightness-[0.5] contrast-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/10" />
            </div>

            {/* Layer 2: Elevating Fade-Up Text Layout wrapper */}
            <SlideText
              heading={slide.heading}
              description={slide.description}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
