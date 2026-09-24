"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";

import grade10 from "@/assets/course-images/grade10.png";
import grade11 from "@/assets/course-images/grade11.png";
import pp from "@/assets/course-images/pp.png";

const STATIC_IMAGES = {
  "theory-10": grade10,
  "theory-11": grade11,
  pastpaper: pp,
};

function getCourseImage(course) {
  if (course.image_url) return course.image_url;
  if (course.type === "pastpaper") return STATIC_IMAGES["pastpaper"];
  return (
    STATIC_IMAGES[`theory-${course.grade}`] ?? "/course-images/default.jpg"
  );
}

export default function CourseCardClient({ course }) {
  const isPastPaper = course.type === "pastpaper";
  const imageUrl = getCourseImage(course);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Link href={`/courses/${course.id}`} className="group block">
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#0b408e]/10 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between h-full">
          {/* Image Container */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
            <Image
              src={imageUrl}
              alt={course.title}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071933] via-[#071933]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Top Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071933]/80 backdrop-blur-md border border-white/20 text-[#9fe03c] text-xs font-medium tracking-wide shadow-sm">
                <Tag size={12} />
                {isPastPaper ? "Past Paper" : `Grade ${course.grade} • Theory`}
              </span>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 pt-10">
              <h3 className="text-white text-lg font-medium leading-snug tracking-normal group-hover:text-[#FFD700] transition-colors duration-300">
                {course.title}
              </h3>
            </div>
          </div>

          {/* Card Footer Details */}
          <div className="p-6 bg-white flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                Course Fee
              </p>
              <p className="text-[#0b408e] font-semibold text-base">
                LKR {Number(course.price).toLocaleString()}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b408e] group-hover:bg-[#9fe03c] text-white group-hover:text-[#0b408e] text-xs font-medium transition-all duration-300 shadow-sm">
              <span>View Details</span>
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
