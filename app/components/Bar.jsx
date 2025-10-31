import { useEffect } from "react";

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
        
        el.scrollIntoView({ 
          behavior: "smooth", 
          block: isLastVenue ? "end" : "center",
          inline: "nearest"
        });
      }
    }
  }, [locationActive, venues]);

  return venues.map((venue, index) => {
    const venueId = venue._id ?? index;

    const radomColor = () => {
      const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-yellow-400",
        "bg-purple-400",
        "bg-pink-400",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const isActive = locationActive === venueId;

    return (
      <button
        id={`${venueId}`}
        key={venueId}
        onClick={() => setLocationActive(venueId)}
        className={`${radomColor()} flex-shrink-0 w-44 md:w-full rounded-xl transition-all text-left duration-200 group p-2
        ${isActive ? "!bg-[#c52627] text-white" : "md:hover:text-white"}
        `}
      >
        <h1 className="font-semibold text-center p-0.5 tracking-tight text-white text-xs">
          {venue.title}
        </h1>
        <div
          className={`overflow-hidden transition-all duration-200 rounded-b-xl
            ${isActive ? "m-4 rounded-xl" : "md:group-hover:m-2 md:group-hover:rounded-xl"}
          `}
        >
          <img
            src={venue.imageUrls?.[0]}
            alt={venue.title}
            className={`w-full aspect-square object-cover transition-transform duration-200
              ${isActive ? "scale-110 rotate-6" : "md:group-hover:scale-110 md:group-hover:rotate-6"}
            `}
          />
        </div>
      </button>
    );
  });
}
