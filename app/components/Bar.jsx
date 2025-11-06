import { useEffect } from "react";
import Swiper from "swiper";
import Swiperino from "./Swiperino";
import { Globe, Instagram, InstagramIcon, Phone } from "lucide-react";

export default function Bar({ venues, setLocationActive, locationActive }) {
  useEffect(() => {
    if (locationActive != null) {
      const el = document.getElementById(`${locationActive}`);
      if (el) {
        // Check if it's the last venue
        const venueIndex = venues.findIndex(
          (v) => (v._id || venues.indexOf(v)) === locationActive
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

    const radomColor = () => {
      const colors = [
        "bg-[#d3235b]",
        "bg-[#241757]",
        "bg-[#e6b66a]",
        "bg-[#98b6aa]",
        "bg-[#aa2226]",
        "bg-[#a4f96c]",
        "bg-[#ff7e20]",
        "bg-[#85b7df]",
      ];
      return null;
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const isActive = locationActive === venueId;

    return (
      <button
        id={`${venueId}`}
        key={venueId}
        onClick={() => setLocationActive(venueId)}
        className={`sm:pb-0 w-full sm:shadow-md ${radomColor()} bg-white text-black flex-shrink-0 w-44 sm:w-full transition-all text-left duration-200 group 
          ${isActive ? `${radomColor()}` : ""}`}
      >
        <div
          className={`p-4 overflow-hidden transition-all duration-200
            ${isActive ? "sm:bg-[#c1282e] sm:text-white" : ""}
          `}
        >
          <div className="relative">
            <Swiperino
              imgs={venue.imageUrls}
              slidesPerView={1}
              pagination={{ clickable: true }}
            />

            <div className="absolute z-50 top-2 right-2 flex gap-1 text-[10px]">
              {venue.tags.map((tag) => (
                <span
                  key={tag}
                  className={`font-bold px-2 outline bg-[#c1282e] text-white outline-[0] rounded-full capitalize`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <h1 className="my-2 tracking-tight text-4xl sm:text-5xl font-semibold">
            {venue.title}
          </h1>

          <div className="">
            <hr />
            <p className="mt-2 text-xs leading-4 tracking-tight">
              {venue.description ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud."}
            </p>

            <div className="mt-4 flex items-center gap-4 text-xs">
              {venue.instagram && (
                <a
                  href={"https://www.instagram.com/" + venue.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon size={18} strokeWidth={2} />
                </a>
              )}

              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={18} strokeWidth={2} />
                </a>
              )}

              {venue.phone && (
                <a
                  href={`tel:${venue.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone size={18} strokeWidth={2} />
                </a>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  });
}
