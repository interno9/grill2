"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

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
  );
}
