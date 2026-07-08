import { useEffect, useMemo, useRef, useState } from "react";
import Swiperino from "./Swiperino";

const PAGE_SIZE = 15;
const LOAD_AHEAD_OFFSET = 3;

export default function Bar({ venues, setLocationActive, locationActive }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreTriggerRef = useRef(null);

  const visibleVenues = useMemo(
    () => venues.slice(0, visibleCount),
    [venues, visibleCount],
  );
  const triggerIndex = Math.max(0, visibleVenues.length - 1 - LOAD_AHEAD_OFFSET);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [venues]);

  useEffect(() => {
    if (locationActive == null) return;

    const activeIndex = venues.findIndex(
      (v, index) => (v._id || index) === locationActive,
    );

    if (activeIndex >= visibleCount) {
      setVisibleCount(
        Math.min(
          venues.length,
          Math.ceil((activeIndex + 1) / PAGE_SIZE) * PAGE_SIZE,
        ),
      );
    }
  }, [locationActive, venues, visibleCount]);

  useEffect(() => {
    const triggerEl = loadMoreTriggerRef.current;
    if (!triggerEl || visibleCount >= venues.length) return;

    if (!("IntersectionObserver" in window)) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, venues.length));
      return;
    }

    const scrollContainer =
      triggerEl.closest(".overflow-y-scroll") ||
      triggerEl.closest(".overflow-x-scroll");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, venues.length));
        }
      },
      {
        root: scrollContainer,
        rootMargin: "160px",
        threshold: 0.1,
      },
    );

    observer.observe(triggerEl);

    return () => observer.disconnect();
  }, [venues.length, visibleCount, triggerIndex]);

  useEffect(() => {
    if (locationActive != null) {
      const el = document.getElementById(`${locationActive}`);
      if (el) {
        // Check if it's the last venue
        const venueIndex = venues.findIndex(
          (v) => (v._id || venues.indexOf(v)) === locationActive,
        );
        const isLastVenue = venueIndex === venues.length - 1;

        // Find the scrollable parent container
        const scrollContainer = el.closest(".overflow-y-scroll");

        if (scrollContainer) {
          if (isLastVenue) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest",
            });
          } else {
            // Scroll container with 16px offset from top on desktop only
            const isMobile = window.innerWidth < 640;
            const offset = isMobile ? 0 : 16;

            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = el.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top;
            const targetScrollTop =
              scrollContainer.scrollTop + relativeTop - offset;

            scrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: "smooth",
            });
          }
        }
      }
    }
  }, [locationActive, venues, visibleCount]);

  return visibleVenues.map((venue, index) => {
    const venueId = venue._id ?? index;
    const isActive = locationActive === venueId;

    return (
      <button
        ref={index === triggerIndex ? loadMoreTriggerRef : null}
        id={`${venueId}`}
        key={venueId}
        onClick={() => setLocationActive(venueId)}
        className="sm:pb-0 w-full sm:shadow-md bg-white text-black flex-shrink-0 w-44 sm:w-full transition-all text-left duration-200 group"
      >
        <div
          className={`p-4 overflow-hidden transition-all duration-200
            ${isActive ? "sm:bg-[#c1282e] sm:text-white" : ""}
          `}
        >
          <div className="relative">
            <Swiperino
              imgs={[`/assets/grill/img${(index + 1) % 8}.png`]}
              slidesPerView={1}
              pagination={{ clickable: true }}
            />
          </div>
          <h1 className="mt-4 tracking-tight text-2xl sm:text-3xl font-semibold">
            {venue.title}
          </h1>
        </div>
      </button>
    );
  });
}
