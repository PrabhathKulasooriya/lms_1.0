"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Calendar,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

const Gallery = ({ images = [], categories: categoriesProp = null }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Dynamically compute unique category tabs
  const categoryTabs = React.useMemo(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      const rawNames = categoriesProp.map((c) =>
        typeof c === "string" ? c : c.name
      );
      const unique = Array.from(new Set(rawNames)).filter((c) => c !== "All");
      return ["All", ...unique];
    }
    const fromImages = (images || []).map((img) => img.category).filter(Boolean);
    const unique = Array.from(new Set(fromImages)).filter((c) => c !== "All");
    return ["All", ...unique];
  }, [categoriesProp, images]);

  // Filter images based on active tab
  const filteredImages =
    selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  // Handle image load status
  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Open Lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  // Close Lightbox
  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  // Lightbox Navigation
  const showPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  }, [lightboxIndex, filteredImages.length]);

  const showNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  }, [lightboxIndex, filteredImages.length]);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showPrev, showNext]);

  // Lock body scroll when Lightbox is active
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  // Mobile swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      showNext();
    } else if (isRightSwipe) {
      showPrev();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const activeImage =
    lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <section className="w-full bg-slate-50 text-slate-800 font-sans py-12 md:py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-14"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9fe03c]/20 border border-[#9fe03c]/40 text-[#0b408e] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#0b408e]" />
            <span>Memories & Moments</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0b408e] tracking-tight mb-4">
            Photo Gallery
          </h2>
          <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed">
            අපගේ අධ්‍යාපනික වැඩසටහන්, සම්මන්ත්‍රණ සහ විශේෂ අවස්ථා වල ඡායාරූප
            එකතුව.
          </p>
          <div className="w-16 h-1 bg-[#9fe03c] mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Dynamic Category Filter Tabs (only shown if there are images and multiple categories) */}
        {images.length > 0 && categoryTabs.length > 1 && (
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 sm:mb-12 gap-2 scrollbar-none px-2">
            {categoryTabs.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#0b408e] text-white shadow-md shadow-[#0b408e]/25 scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-[#0b408e] border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Image Grid or Empty State */}
        {images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto my-12 p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-[#9fe03c]/20 border border-[#9fe03c]/40 flex items-center justify-center text-[#0b408e]">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#0b408e]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0b408e] mb-2">
              No Images Available
            </h3>
            <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed mb-2">
              ඡායාරූප තවමත් ඇතුළත් කර නොමැත.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              No photos have been uploaded to the gallery yet. Please check back later!
            </p>
          </motion.div>
        ) : filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto my-12 p-8 sm:p-10 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              No Images in &quot;{selectedCategory}&quot;
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-5">
              There are currently no photos in this category.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="px-5 py-2.5 rounded-full bg-[#0b408e] text-white text-xs sm:text-sm font-semibold hover:bg-[#0b408e]/90 transition-all shadow-md shadow-[#0b408e]/20 cursor-pointer"
            >
              Show All Images
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredImages.map((image, index) => {
                const isLoaded = loadedImages[image.id];
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    key={image.id}
                    onClick={() => openLightbox(index)}
                    className="group relative flex flex-col justify-between aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md hover:shadow-2xl hover:shadow-[#0b408e]/15 transition-all duration-500 hover:-translate-y-1.5 cursor-pointer"
                  >
                    {/* Dummy Container / Loading Skeleton */}
                    {!isLoaded && (
                      <div className="absolute inset-0 z-10 bg-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-medium">Loading image...</span>
                      </div>
                    )}

                    {/* Image */}
                    <Image
                      src={image.src}
                      alt={image.title || "Gallery image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => handleImageLoad(image.id)}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061933] via-[#061933]/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                    {/* Top Badges */}
                    <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        {image.category || "General"}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#9fe03c] group-hover:text-[#0b408e] transition-all duration-300 shadow-sm">
                        <Maximize2
                          size={16}
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>

                    {/* Bottom Text Content */}
                    <div className="relative z-20 p-4 sm:p-5 pt-0">
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-[#FFD700] transition-colors duration-300">
                        {image.title || image.category || "Gallery Photo"}
                      </h3>
                      {image.sinhalaTitle && (
                        <p className="text-slate-300 text-xs font-normal line-clamp-1 mb-2">
                          {image.sinhalaTitle}
                        </p>
                      )}
                      {image.date && (
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                          <Calendar className="w-3 h-3 text-[#9fe03c]" />
                          <span>{image.date}</span>
                        </div>
                      )}
                      <div className="w-8 h-1 bg-[#9fe03c] mt-3 rounded-full transition-all duration-500 group-hover:w-20" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Bar */}
            <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-full bg-[#9fe03c] text-[#0b408e] text-xs font-bold uppercase tracking-wider">
                  {activeImage.category}
                </span>
                <span className="text-white/70 text-xs sm:text-sm font-medium">
                  {lightboxIndex + 1} / {filteredImages.length}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                aria-label="Close fullscreen modal"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Middle Main Content & Navigation Buttons */}
            <div className="relative flex-1 flex items-center justify-between px-2 sm:px-6 w-full max-w-7xl mx-auto overflow-hidden">
              {/* Previous Button (Left) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Previous image"
                className="relative z-30 p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-[#9fe03c] text-white hover:text-[#0b408e] border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>

              {/* Main Image Container */}
              <div
                className="relative w-full h-[55vh] sm:h-[65vh] md:h-[72vh] mx-2 sm:mx-4 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeImage.src}
                      alt={activeImage.title}
                      fill
                      priority
                      sizes="95vw"
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button (Right) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="relative z-30 p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-[#9fe03c] text-white hover:text-[#0b408e] border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            {/* Bottom Caption & Thumbnail Strip */}
            <div className="relative z-20 px-4 sm:px-8 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div className="max-w-4xl mx-auto text-center mb-3">
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                  {activeImage.title || activeImage.category || "Gallery Photo"}{" "}
                  {activeImage.sinhalaTitle && (
                    <span className="text-slate-400 font-normal text-sm sm:text-base">
                      ({activeImage.sinhalaTitle})
                    </span>
                  )}
                </h4>
                {activeImage.description && (
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl mx-auto line-clamp-2">
                    {activeImage.description}
                  </p>
                )}
              </div>

              {/* Mini Thumbnail Strip for Quick Navigation */}
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-full scrollbar-none">
                {filteredImages.map((thumb, idx) => (
                  <button
                    key={thumb.id}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-200 cursor-pointer ${
                      idx === lightboxIndex
                        ? "border-[#9fe03c] scale-110 shadow-lg shadow-[#9fe03c]/20"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={thumb.src}
                      alt={thumb.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
