"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";

const faqs = [
  {
    id: 1,
    question: "NexLearn.lk හරහා පාඨමාලා සදහා ලියාපදිංචි වන්නේ කෙසේද?",
    answer: "අපගේ වෙබ් අඩවිය හරහා ඉතා පහසුවෙන් පාඨමාලා සඳහා ලියාපදිංචි විය හැක. පහත පියවර අනුගමනය කරන්න:",
    steps: [
      "වෙබ් අඩවියේ 'Register' හෝ 'Sign Up' ගොනුව වෙත ගොස් ඔබගේ ගිණුම සාදාගන්න.",
      "ඔබට අවශ්‍ය ශ්‍රේණිය (10 ශ්‍රේණිය හෝ 11 ශ්‍රේණිය) තෝරාගන්න.",
      "පාඨමාලා පිටුවේ ඇති 'Enroll Now' හෝ 'Buy Now' ක්ලික් කරන්න.",
      "ගෙවීම් ක්‍රමවේදය ( Bank Transfer) තෝරා ගෙවීම සම්පූර්ණ කරන්න."
    ]
  },
  {
    id: 2,
    question: "මුද්‍රිත නිබන්ධන (Printed Tutes) නිවසටම ගෙන්වා ගන්නේ කෙසේද?",
    answer: "පාඨමාලාවට ලියාපදිංචි වූ පසු, ඔබ ලබාදුන් ලිපිනයට මුද්‍රිත නිබන්ධන කට්ටලය කුරියර් (Courier) සේවාව මගින් දින 2-4 ක් ඇතුළත නිවසටම ගෙන්වා ගත හැක.",
    steps: [
      "ගිණුම් තොරතුරු හි ඔබගේ නිවැරදි නිවාස ලිපිනය සහ දුරකථන අංකය ඇතුළත් කරන්න.",
      "ඇණවුම තහවුරු කළ පසු Tracking අංකයක් ඔබ වෙත ලැබෙනු ඇත."
    ]
  },
  {
    id: 3,
    question: "වීඩියෝ පාඩම් නැරඹීමට කාල සීමාවක් තිබේද?",
    answer: "නැත. ඔබට අදාළ පාඨමාලා කාල සීමාව ඇතුළත ඕනෑම වේලාවක, ඕනෑම වාර ගණනක් වීඩියෝ පාඩම් නැරඹීමේ හැකියාව පවතී."
  },
  {
    id: 4,
    question: "බැංකු තැන්පතු (Bank Transfer) මගින් මුදල් ගෙවන්නේ කෙසේද?",
    answer: "බැංකු තැන්පතු මගින් මුදල් ගෙවීමට පහත පියවර අනුගමනය කරන්න:",
    steps: [
      "පාඨමාලාව තෝරා ගෙවීම් පියවරේදී Bank Transfer ක්‍රමය තෝරන්න.",
      "ලබා දී ඇති බැංකු ගිණුම් අංකයට අදාළ මුදල තැන්පත් කරන්න.",
      "ලැබෙන රිසිට්පතේ (Receipt) ඡායාරූපයක් පද්ධතියට උඩුගත (Upload) කරන්න.",
      "පරිපාලක කණ්ඩායම මගින් පරීක්ෂා කර ඔබගේ ගිණුම සක්‍රිය කරනු ලැබේ."
    ]
  },
  {
    id: 5,
    question: "තාක්ෂණික ගැටලුවක් ආවොත් සහාය ලබා ගන්නේ කෙසේද?",
    answer: "ඔබට ඇතිවන ඕනෑම තාක්ෂණික හෝ අධ්‍යයන ගැටලුවක් සඳහා අපගේ WhatsApp උපකාරක සේවාව (Support Line) හරහා ක්ෂණික සහාය ලබා ගත හැක."
  }
];

const FaqSection = () => {
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0b408e]/10 text-[#0b408e] text-xs font-bold tracking-wider uppercase mb-3">
            <HelpCircle size={14} className="text-[#0b408e]" />
            <span>නිතර අසන ප්‍රශ්න (FAQ)</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b408e] tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            ඔබට ඇතිවිය හැකි සාමාන්‍ය ගැටලු සඳහා පිළිතුරු පහතින් ලබාගෙන ඇත.
          </p>
        </motion.div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#0b408e]/30 shadow-lg shadow-[#0b408e]/5"
                    : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* Question Header Button */}
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base md:text-lg font-bold transition-colors ${
                    isOpen ? "text-[#0b408e]" : "text-slate-800"
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${
                    isOpen ? "bg-[#0b408e]/10 text-[#0b408e]" : "bg-slate-100 text-slate-500"
                  }`}>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-5 pb-6 md:px-6 text-slate-600 text-sm md:text-base border-t border-slate-100 pt-4 leading-relaxed">
                        <p className="mb-3">{faq.answer}</p>

                        {/* Optional Steps */}
                        {faq.steps && faq.steps.length > 0 && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                            <span className="block text-xs font-bold uppercase tracking-wider text-[#0b408e] mb-2">
                              අනුගමනය කළ යුතු පියවර:
                            </span>
                            {faq.steps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#9fe03c] text-[#0b408e] text-xs font-bold shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="text-slate-700 text-sm">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
