"use client";

import React, { useRef, useState } from "react";
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
import image1 from "@/assets/1.jpg";
import image2 from "@/assets/2.jpg";
import image3 from "@/assets/network-connection-graphic-overlay-laptop.jpg";
import image4 from "@/assets/office-table-with-smartphone-it-view-from.jpg";

const images = [
  {
    image: image1,
    text: "test text1",
  },
  {
    image: image2,
    text: "test text2",
  },
  {
    image: image3,
    text: "test text3",
  },
  {
    image: image4,
    text: "test text4",
  },
];

//Seperate component for slide text to handle inView animation
const SlideText = ({ text }) => {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`block absolute top-1/2 left-1/2 md:left-1/4 transform -translate-x-1/2 -translate-y-1/2 
        text-3xl font-bold text-center text-white z-20 transition-all duration-500
        ${inView ? "animate-slide-in-left" : "opacity-0 -translate-x-full"}`}
    >
      {text}
    </div>
  );
};


// Main Component
const ImageSlider = () => {
  return (
    <div className=" h-[300px] md:h-[500px] overflow-hidden">
      <Swiper
        slidesPerView={1}
        // effect={"fade"}
        // fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={false}
        autoplay={{ delay: 2500 }}
        modules={[Pagination, Navigation, Autoplay, EffectFade]}
        className="h-full w-screen"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="relative flex items-center justify-center overflow-hidden h-auto"
          >
            {/* Layer 1: The Blurred Background */}
            <div className="absolute inset-0 z-0">
              <Image
                src={image.image}
                alt=""
                fill
                className="object-cover scale-110 brightness-50"
              />
            </div>

            {/* Layer 2: The Main Image (Preserves Aspect Ratio) */}
            {/* <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Image
                src={image.image}
                alt="Slide content"
                className="max-h-full w-auto object-cover"
                priority
              />
            </div> */}

            {/* Layer 3: Text */}
            <SlideText text={image.text} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
