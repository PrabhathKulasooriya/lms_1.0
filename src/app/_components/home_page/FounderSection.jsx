"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Briefcase, GraduationCap, CheckCircle2, UserCheck } from "lucide-react";
import founder from "@/assets/founder.png";

const FounderSection = () => {
  return (
    <section className="py-24 px-6 lg:px-12 bg-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0b408e]/10 text-[#0b408e] text-xs font-bold tracking-wider uppercase mb-3">
            <UserCheck size={14} className="text-[#0b408e]" />
            <span>දේශක සහ නිර්මාතෘ</span>
          </div> */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b408e] tracking-tight">
            Founder & CEO
          </h2>
        </motion.div>

        {/* Profile Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-5xl mx-auto"
        >
          {/* Image & Title Column (Left / Top) */}
          <div className="lg:col-span-5 relative bg-[#071933] flex flex-col justify-end min-h-[380px] lg:min-h-[480px] p-8 text-white overflow-hidden group">
            {/* Image */}
            <Image
              src={founder}
              alt="Hasindu Kanishka"
              fill
              className="object-cover object-top opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Dark Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071933] via-[#071933]/50 to-transparent z-10" />

            {/* Profile Header on Image */}
            <div className="relative z-20 mt-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-xs font-bold uppercase tracking-wider mb-2">
                Founder & CEO
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                Hasindu Kanishka
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed uppercase tracking-wider">
                BMS Hons. in (HRM) - OUSL (UG), AAT (PF), PCM (SLIM), DPHRM (CIPM), CIHRM (CIPM)
              </p>
              <div className="w-12 h-1 bg-[#FFD700] mt-4 rounded-full" />
            </div>
          </div>

          {/* Details & Experience Column (Right) */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between bg-white">
            <div className="space-y-8">
              {/* Lecturing Experience */}
              <div>
                <div className="flex items-center gap-2.5 text-[#0b408e] font-bold text-sm uppercase tracking-wider mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#0b408e]/10 flex items-center justify-center text-[#0b408e]">
                    <GraduationCap size={18} />
                  </div>
                  <span>දේශන පළපුරුද්ද (Lecturing Experience)</span>
                </div>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-slate-700 text-sm md:text-base leading-relaxed">
                    <CheckCircle2 size={18} className="text-[#9fe03c] shrink-0 mt-0.5" />
                    <span>ව්‍යාපාර හා ගිණුම්කරණ අධ්‍යයනය (Business & Accounting Studies) ක්ෂේත්‍රයේ වසර 3 කට වැඩි ප්‍රායෝගික දේශන පළපුරුද්ද.</span>
                  </li>
                </ul>
              </div>

              {/* Industry Experience */}
              <div>
                <div className="flex items-center gap-2.5 text-[#0b408e] font-bold text-sm uppercase tracking-wider mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#0b408e]/10 flex items-center justify-center text-[#0b408e]">
                    <Briefcase size={18} />
                  </div>
                  <span>වෘත්තීය පළපුරුද්ද (Industry Experience)</span>
                </div>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-start gap-3 text-slate-700 text-sm md:text-base leading-relaxed">
                    <CheckCircle2 size={18} className="text-[#9fe03c] shrink-0 mt-0.5" />
                    <span>මානව සම්පත් කළමනාකරණය (Human Resource Management) ක්ෂේත්‍රයේ වසර 2 ක පළපුරුද්ද.</span>
                  </li>
                  <li className="flex items-start gap-3 text-slate-700 text-sm md:text-base leading-relaxed">
                    <CheckCircle2 size={18} className="text-[#9fe03c] shrink-0 mt-0.5" />
                    <span>මූල්‍ය විගණනය (Financial Audit) ක්ෂේත්‍රයේ වසරක පළපුරුද්ද.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quote Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 italic">
                "Our goal is to make Ordinary Level Commerce easy, clear, and high-scoring for every student."
              </p>
              <div className="w-2.5 h-2.5 rounded-full bg-[#9fe03c]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderSection;
