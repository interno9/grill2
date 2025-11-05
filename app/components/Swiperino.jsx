"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Navigation } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { useState } from "react";

export default function Swiperino({ imgs, videos, slidesPerView }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = (imgs?.length || 0) + (videos?.length || 0);

  return (
    <div className="relative">
      <Swiper
        key={imgs.length}
        grabCursor={true}
        className="mySwiper"
        modules={[Navigation]}
        scrollbar={{ draggable: true }}
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
        autoHeight={true}
        spaceBetween={8}
        slidesPerView={slidesPerView || 1}
      >
        {videos &&
          videos.map((video, i) => {
            return (
              <SwiperSlide key={i}>
                <video
                  className="w-full object-cover aspect-square"
                  autoPlay
                  controls={false}
                  playsInline
                  disablePictureInPicture
                  muted
                  loop
                  src={video}
                />
              </SwiperSlide>
            );
          })}

        {imgs.map((img, i) => {
          return (
            <SwiperSlide key={i}>
              <Image
                width={300}
                height={300}
                quality={80}
                blurDataURL={`${img}?w=1&h=1&auto=format&fit=crop&q=1`}
                className="w-full blur-0 object-cover aspect-[3/2.3]"
                alt={img}
                src={img}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      {totalSlides > 1 && (
        <div className="font-sans absolute bottom-2 right-2 z-50 px-2 rounded-full bg-[#c1282d00] text-white font-bold text-[10px]">
          {currentSlide}/{totalSlides}
        </div>
      )}
    </div>
  );
}
