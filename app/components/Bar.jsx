import { useEffect } from "react";

export default function Bar({ venues, setLocationActive, locationActive }) {
  useEffect(() => {
    if (locationActive != null) {
      const el = document.getElementById(`${locationActive}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [locationActive]);

  return venues.map((venue, index) => {
    const venueId = venue._id ?? index;

    return (
      <button
        id={`${venueId}`}
        key={venueId}
        onClick={() => setLocationActive(venueId)}
        className={`flex-shrink-0 w-44 md:w-full rounded-2xl md:hover:bg-red-400 text-xs md:hover:text-white bg-neutral-100 text-left transition-colors duration-150
        ${locationActive === venueId ? "!bg-red-500 text-white" : "bg-transparent"}
        `}
      >
        <img
          src={venue.imageUrls?.[0]}
          alt={venue.title}
          className="w-full aspect-square rounded-2xl object-cover"
        />

        <h1 className="font-semibold text-center p-0.5 tracking-tight">
          {venue.title}
        </h1>
      </button>
    );
  });
}
