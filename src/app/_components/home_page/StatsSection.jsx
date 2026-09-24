"use client";

import React from "react";
import CountUp from "react-countup";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";

import users from "@/assets/counter/users.webp";
import lecturer from "@/assets/counter/lecturer.webp";
import daily from "@/assets/counter/daily.webp";

const statItems = [
  {
    number: 203,
    suffix: "+",
    title: "ලියාපදිංචි සිසුන් (Registered Students)",
    icon: Users,
    imageSrc: users,
  },
  {
    number: 3,
    suffix: "",
    title: "ප්‍රධාන පාඨමාලා (Core Programs)",
    icon: BookOpen,
    imageSrc: lecturer,
  },
  {
    number: 47,
    suffix: "+",
    title: "දෛනික පරිශීලකයින් (Active Daily Learners)",
    icon: TrendingUp,
    imageSrc: daily,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function StatsSection() {
  return (
    <section className="relative w-full py-20 bg-[#071933] text-white overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0b408e]/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#9fe03c] text-xs font-bold tracking-wider uppercase mb-3">
            <Award size={14} className="text-[#FFD700]" />
            <span>අපගේ ප්‍රගතිය</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            සිසුන් සහ දෙමාපියන්ගේ විශ්වාසය
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {statItems.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative group p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 flex flex-col items-center text-center shadow-lg"
            >
              {/* Icon Container */}
              <div className="w-20 h-20 mb-6 relative flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-3 group-hover:scale-105 transition-transform duration-500">
                <Image
                  src={stat.imageSrc}
                  alt={stat.title}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Number Counter */}
              <div className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 flex items-center justify-center">
                <CountUp end={stat.number} duration={3} enableScrollSpy scrollSpyOnce />
                <span className="text-[#9fe03c] ml-1">{stat.suffix}</span>
              </div>

              {/* Title / Label */}
              <p className="text-slate-300 text-sm font-medium leading-snug">
                {stat.title}
              </p>

              {/* Bottom Accent Bar */}
              <div className="w-10 h-1 bg-[#FFD700]/60 rounded-full mt-5 group-hover:w-20 group-hover:bg-[#9fe03c] transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
