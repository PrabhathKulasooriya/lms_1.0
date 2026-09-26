"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import ImageSlider from "@/app/_components/home_page/ImageSlider";

import bg_1 from "@/assets/bg/bg_1.webp";
import bg_2 from "@/assets/bg/bg_2.webp";

const features = [
  {
    icon: BookOpen,
    title: "පැහැදිලි සිද්ධාන්ත (Simplified Theory)",
    desc: "10 සහ 11 ශ්‍රේණි ව්‍යාපාර හා ගිණුම්කරණ අධ්‍යයනය විෂය නිර්දේශය සරලව හා මුල සිට ආවරණය කිරීම.",
  },
  {
    icon: Layers,
    title: "ක්‍රමවත් පාඩම් මාලාව (Structured Modules)",
    desc: "පාඩමෙන් පාඩමට සංවිධානාත්මකව පිළියෙළ කරන ලද වීඩියෝ පාඩම් සහ නිබන්ධන මාලාව.",
  },
  {
    icon: Sparkles,
    title: "විශිෂ්ට සාමාර්ථ ඉලක්කය (Targeted 'A' Grade)",
    desc: "සාමාන්‍ය පෙළ විභාගයෙන් විශිෂ්ට 'A' සාමාර්ථයක් ලබා ගැනීමට මඟ පෙන්වන විශේෂ ක්‍රමවේදය.",
  },
  {
    icon: FileCheck2,
    title: "මුද්‍රිත නිබන්ධන කට්ටලය (Printed Tutes Set)",
    desc: "ආකර්ෂණීය මෙන්ම විධිමත් මුද්‍රිත නිබන්ධන කට්ටලයක් නිවසටම ගෙන්වාගැනීමේ ක්‍රමවේදය.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

const Home = () => {
  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans" id="section_1">
      {/* Hero Image Slider */}
      <ImageSlider />

      {/* Course Selection Section */}
      <section id="courses" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b408e] tracking-tight mb-3">
            Select Your Course
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Grade 10 & 11 Theory and Past Paper Discussions
          </p>
        </motion.div>

        {/* Course Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {/* Grade 10 Card */}
          <motion.div variants={itemVariants}>
            <Link
              href="/courses?type=theory&grade=10"
              className="group relative flex flex-col justify-between h-64 md:h-72 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md hover:shadow-2xl hover:shadow-[#0b408e]/15 transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={bg_1}
                  alt="10 ශ්‍රේණිය"
                  fill
                  placeholder="blur"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061933] via-[#061933]/70 to-[#061933]/40 transition-opacity duration-500 group-hover:opacity-95" />
              </div>

              {/* Card Header Content */}
              <div className="relative z-10 p-6 md:p-8 flex justify-between items-start">
                <span className="inline-block px-3 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-xs font-bold uppercase tracking-wider shadow-sm">
                  Grade 10 • Commerce
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </div>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 p-6 md:p-8 pt-0">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight group-hover:text-[#FFD700] transition-colors duration-300">
                  10 ශ්‍රේණිය
                </h3>
                <p className="text-slate-300 text-xs md:text-sm font-normal line-clamp-2">
                  සම්පූර්ණ විෂය නිර්දේශය මුල සිට සරලව සාකච්ඡා කෙරෙන සිද්ධාන්ත
                  පාඨමාලාව.
                </p>
                <div className="w-12 h-1 bg-[#9fe03c] mt-4 rounded-full transition-all duration-500 group-hover:w-28" />
              </div>
            </Link>
          </motion.div>

          {/* Grade 11 Card */}
          <motion.div variants={itemVariants}>
            <Link
              href="/courses?type=theory&grade=11"
              className="group relative flex flex-col justify-between h-64 md:h-72 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md hover:shadow-2xl hover:shadow-[#0b408e]/15 transition-all duration-500 hover:-translate-y-1.5"
            >
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={bg_1}
                  alt="11 ශ්‍රේණිය"
                  fill
                  placeholder="blur"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061933] via-[#061933]/70 to-[#061933]/40 transition-opacity duration-500 group-hover:opacity-95" />
              </div>

              {/* Card Header Content */}
              <div className="relative z-10 p-6 md:p-8 flex justify-between items-start">
                <span className="inline-block px-3 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-xs font-bold uppercase tracking-wider shadow-sm">
                  Grade 11 • Commerce
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300">
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </div>
              </div>

              {/* Card Bottom Content */}
              <div className="relative z-10 p-6 md:p-8 pt-0">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight group-hover:text-[#FFD700] transition-colors duration-300">
                  11 ශ්‍රේණිය
                </h3>
                <p className="text-slate-300 text-xs md:text-sm font-normal line-clamp-2">
                  සාමාන්‍ය පෙළ විභාගය ඉලක්ක කරගත් පූර්ණ සිද්ධාන්ත හා පුනරීක්ෂණ
                  පාඨමාලාව.
                </p>
                <div className="w-12 h-1 bg-[#9fe03c] mt-4 rounded-full transition-all duration-500 group-hover:w-28" />
              </div>
            </Link>
          </motion.div>

          {/* Past Paper Discussion Card */}

          {/* <motion.div variants={itemVariants} className="md:col-span-2">
            <Link
              href="/courses?type=pastpaper"
              className="group relative flex flex-col justify-between h-56 md:h-64 rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md hover:shadow-2xl hover:shadow-[#0b408e]/15 transition-all duration-500 hover:-translate-y-1.5"
            >
             
              <div className="absolute inset-0 z-0">
                <Image
                  src={bg_2}
                  alt="විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව"
                  fill
                  placeholder="blur"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b408e]/95 via-[#0b408e]/80 to-[#061933]/90 transition-opacity duration-500" />
              </div>

              
              <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FFD700] text-[#0b408e] text-xs font-bold uppercase tracking-wider shadow-sm">
                    O/L Exam Focus • Past Papers
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FFD700] group-hover:text-[#0b408e] transition-all duration-300">
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight group-hover:text-[#9fe03c] transition-colors duration-300">
                    විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව
                  </h3>
                  <p className="text-slate-200 text-xs md:text-sm font-normal max-w-2xl leading-relaxed">
                    පසුගිය විභාග ප්‍රශ්න පත්‍ර, ආදර්ශ ප්‍රශ්න පත්‍ර සහ ලකුණු දීමේ පටිපාටි (Marking Schemes) පිළිබඳ පූර්ණ විශ්ලේෂණය.
                  </p>
                  <div className="w-16 h-1 bg-[#FFD700] mt-4 rounded-full transition-all duration-500 group-hover:w-36" />
                </div>
              </div>
            </Link>
          </motion.div> */}
        </motion.div>
      </section>

      {/* Modern Features Highlight Grid */}
      <section className="py-20 px-6 lg:px-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#9fe03c]/20 text-[#0b408e] text-xs font-bold tracking-wider uppercase mb-3">
              <Sparkles size={14} className="text-[#0b408e]" />
              <span>Why NexLearn.lk?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b408e] tracking-tight">
              NexLearn.lk තෝරාගත යුත්තේ ඇයි?
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="p-7 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#0b408e]/20 hover:bg-white hover:shadow-xl hover:shadow-[#0b408e]/5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#0b408e]/10 text-[#0b408e] flex items-center justify-center mb-5 group-hover:bg-[#0b408e] group-hover:text-white transition-colors duration-300">
                      <IconComp size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
                      {feat.title}
                    </h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="w-8 h-0.5 bg-[#9fe03c] mt-6 rounded-full group-hover:w-full transition-all duration-500" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
