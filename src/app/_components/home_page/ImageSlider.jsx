"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Local Images
import image1 from "@/assets/slider/1.webp";
import image2 from "@/assets/slider/2.webp";
import image3 from "@/assets/slider/3.webp";
import image4 from "@/assets/slider/4.webp";

const sliderData = [
  {
    image: image1,
    badge: "NexLearn LMS • Sri Lanka",
    heading: "Empower Your Future in Commerce",
    description:
      "The premier online learning destination designed for Sri Lankan Ordinary Level students to master Commerce and achieve top grades.",
    primaryCta: { text: "පාඨමාලා නරඹන්න", href: "#courses" },
    secondaryCta: { text: "ලියාපදිංචි වන්න", href: "/register" },
  },
  {
    image: image2,
    badge: "Comprehensive Theory & Revision",
    heading: "Master Your O/L Commerce Syllabus",
    description:
      "Simplified theory lessons, structured study notes, and targeted revision guidance specifically tailored for Grade 10 & 11.",
    primaryCta: { text: "Grade 10 Theory", href: "/courses?type=theory&grade=10" },
    secondaryCta: { text: "Grade 11 Theory", href: "/courses?type=theory&grade=11" },
  },
  {
    image: image3,
    badge: "Proven Exam Strategy",
    heading: "Ace Your O/L Commerce Exams",
    description:
      "Deep-dive past paper discussions, marking scheme breakdowns, and model answers to maximize your exam performance.",
    primaryCta: { text: "ප්‍රශ්න පත්‍ර සාකච්ඡා", href: "/courses?type=pastpaper" },
    secondaryCta: { text: "වැඩිදුර විස්තර", href: "/contact" },
  },
  {
    image: image4,
    badge: "9A Results Guaranteed Focus",
    heading: "Your Proven Path to an 'A' Grade",
    description:
      "Turn your academic ambitions into reality with structured learning paths, expert instruction, and continuous guidance.",
    primaryCta: { text: "පාඨමාලා තෝරන්න", href: "#courses" },
    secondaryCta: { text: "ලොගින් වන්න", href: "/login" },
  },
];

const ImageSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-[520px] md:h-[640px] bg-[#071933] overflow-hidden">
      {/* Custom Swiper Styles */}
      <style>{`
        .hero-slider .swiper-pagination {
          bottom: 28px !important;
          display: flex;
          justify-content: flex-start;
          padding-left: 1.5rem;
          max-width: 80rem;
          margin: 0 auto;
          left: 0;
          right: 0;
        }
        @media (min-width: 768px) {
          .hero-slider .swiper-pagination {
            padding-left: 3rem;
          }
        }
        .hero-slider .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          border-radius: 9999px;
          transition: all 0.4s ease;
          margin: 0 4px !important;
        }
        .hero-slider .swiper-pagination-bullet-active {
          background: #9fe03c !important;
          width: 32px !important;
          border-radius: 9999px !important;
          box-shadow: 0 0 12px rgba(159, 224, 60, 0.5);
        }
      `}</style>

      <Swiper
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={1000}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Pagination, EffectFade, Autoplay]}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="hero-slider h-full w-full"
      >
        {sliderData.map((slide, index) => (
          <SwiperSlide key={index} className="relative h-full w-full overflow-hidden">
            {/* Background Image Layer with subtle zoom transition */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.image}
                alt={slide.heading}
                fill
                priority={index === 0}
                className={`object-cover object-center transition-transform duration-[7000ms] ease-out ${
                  activeIndex === index ? "scale-105" : "scale-100"
                }`}
              />
              {/* Dual Dark Gradient Overlays for High Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#06162d]/90 via-[#06162d]/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071933] via-transparent to-black/30 z-10" />
            </div>

            {/* Slide Content Layer */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {activeIndex === index && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="max-w-2xl flex flex-col items-start gap-4 md:gap-5 pt-8"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#9fe03c] text-xs font-semibold tracking-wide uppercase"
                    >
                      <Sparkles size={13} className="text-[#FFD700]" />
                      <span>{slide.badge}</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-sm"
                    >
                      {slide.heading}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-base md:text-lg text-slate-200/90 font-normal leading-relaxed max-w-xl"
                    >
                      {slide.description}
                    </motion.p>

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="flex flex-wrap items-center gap-3.5 pt-2"
                    >
                      <Link
                        href={slide.primaryCta.href}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#9fe03c] text-[#0b408e] text-sm font-bold shadow-lg shadow-[#9fe03c]/20 hover:bg-[#FFD700] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        <span>{slide.primaryCta.text}</span>
                        <ArrowRight size={16} />
                      </Link>

                      <Link
                        href={slide.secondaryCta.href}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md border border-white/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        <span>{slide.secondaryCta.text}</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Decorative Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none text-slate-50">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="min-w-screen h-6 md:h-10 object-fill fill-current"
        >
          <path d="M0 48H1440V24C1200 44 960 48 720 36C480 24 240 4 0 24V48Z" />
        </svg>
      </div>
    </section>
  );
};

export default ImageSlider;
