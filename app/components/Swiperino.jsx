"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Swiperino({ imgs, videos, slidesPerView }) {
  return (
    <Swiper
      key={imgs.length}
      grabCursor={true}
      className="mySwiper"
      modules={[Navigation, Pagination]}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      // onSlideChange={() => console.log("slide change")}
      autoHeight={true}
      spaceBetween={0}
      slidesPerView={slidesPerView || 1}
    >
      {videos &&
        videos.map((video, i) => {
          return (
            <SwiperSlide key={i}>
              <video
                className="w-full object-cover aspect-square"
                autoPlay
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
            <img
              className="w-full object-cover aspect-square"
              alt={img}
              src={img}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
