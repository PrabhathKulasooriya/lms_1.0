"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import founder from "@/assets/founder.png";

const FounderSection = () => {
  return (
    <section className="py-12 px-4 selection:bg-[#9fe03c] selection:text-[#0b408e] ">
      
      <div className="max-w-7xl mx-auto flex justify-center  "> 
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-3xl shadow-[#0b408e]/5 border border-gray-100 overflow-hidden flex flex-col group"
        >
          {/* 1. Photo Section with Integrated Name Overlay */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-200">
            <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-xs p-6 text-center">
              Founder Photo
              <Image
                src={founder}
                alt="Hasindu Kanishka"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Darker Gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b408e] via-[#0b408e]/20 to-transparent opacity-60" />

            {/* Integrated Name & Qualifications Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 text-center backdrop-blur-[2px]">
              <span className="text-[#9fe03c] text-[20px] font-bold uppercase tracking-[0.3em] block mb-1">
                Founder & CEO
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
                Hasindu Kanishka
              </h2>
              <p className="text-white/80 font-medium text-[12px] leading-relaxed uppercase tracking-wider line-clamp-2 px-2">
                BMS Hons. in (HRM) - OUSL (UG), AAT (PF), PCM (SLIM), DPHRM
                (CIPM), CIHRM (CIPM)
              </p>
              <div className="w-12 h-1 bg-[#FFD700] mx-auto mt-4 rounded-full" />
            </div>
          </div>

          {/* 2. Content Section (Wider & Compact) */}
          <div className="p-8 flex flex-col flex-grow bg-white">
            <div className="grid grid-cols-1 gap-6 mb-8 flex-grow">
              {/* Industry Experience */}
              <div className="space-y-2">
                <h4 className="text-[#0b408e] font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#9fe03c] rounded-full" />
                  Industry Experience
                </h4>
                <div className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed pl-3">
                  <ChevronRight
                    size={16}
                    className="text-[#0b408e] mt-0.5 shrink-0"
                  />
                  <p>2 years of expertise in Human Resource Management.</p>
                </div>
                <div className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed pl-3">
                  <ChevronRight
                    size={16}
                    className="text-[#0b408e] mt-0.5 shrink-0"
                  />
                  <p>1 year of expertise in Financial Audit.</p>
                </div>
              </div>

              {/* Lecturing Experience */}
              <div className="space-y-2">
                <h4 className="text-[#0b408e] font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#9fe03c] rounded-full" />
                  Lecturing Experience
                </h4>
                <div className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed pl-3">
                  <ChevronRight
                    size={16}
                    className="text-[#0b408e] mt-0.5 shrink-0"
                  />
                  <p>
                    3 years experience in Business And Accounting Studies
                    lecturing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderSection;
