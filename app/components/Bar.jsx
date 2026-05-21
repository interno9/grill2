import { useEffect } from "react";
import Swiperino from "./Swiperino";

export default function Bar({ venues, setLocationActive, locationActive }) {
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
  }, [locationActive, venues]);

  return venues.map((venue, index) => {
    const venueId = venue._id ?? index;
    const isActive = locationActive === venueId;

    return (
      <button
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
