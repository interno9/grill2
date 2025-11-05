"use client";

import Marquee from "react-fast-marquee";
import Link from "next/link";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // redirect to /map
    document.location.href = "/map";
  }, []);
  return (
    <div>
      <div
        style={{
          display: "none",
        }}
        className="flex flex-col overflow-scroll h-[100dvh] scroll-smooth"
      >
        <div className="relative">
          <video
            autoPlay
            loop
            muted
            src="/assets/imgs/intro.mov"
            poster="/assets/imgs/intro.png"
            className="w-full object-cover max-h-[90dvh]"
          />

          <a
            className="absolute z-50 -bottom-14 left-1/2 -translate-x-1/2 text-white cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("map")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            <img
              src="/assets/imgs/hand1.png"
              className="w-12 sm:w-28 hand saturate-150 rounded-3xl rotate-12 hover:-rotate-0 hover:scale-105 transition-all"
            />
          </a>
        </div>

        <span
          id="map"
          className="p-12 sm:p-32 pattern h-screen flex items-center justify-center"
        >
          <Link href="/map">
            <img
              src="/assets/imgs/map3.png"
              className="w-full max-w-3xl mx-auto cursor-pointer object-cover border-[6px] border-[#00ffee] rounded-xl hover:shadow-xl transition-all hover:scale-105 rotate-2 hover:-rotate-3"
            />
          </Link>
        </span>

        <img
          src="/assets/imgs/logo.webp"
          className="absolute top-2 right-2 w-28 sm:w-64"
        />
        <Marquee
          pauseOnHover
          className="cursor-pointer marquee text-6xl text-[#c96207] p-14 bg-[#b8fb00]"
        >
          🍇🍷 Our wine selection, from us to you. 🍾🥂
        </Marquee>

        <img src="/assets/imgs/wine.webp" className="w-full" />
      </div>
    </div>
  );
}
