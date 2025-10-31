import { Marker, Popup } from "react-leaflet";
import { useEffect, useRef, useState } from "react"; // Added useState import
import { Icon } from "leaflet";
import Swiperino from "./Swiperino";
import { Globe, Instagram, Phone, GlobeIcon } from "lucide-react";

const MarkerComponent = ({
  id,
  position,
  isActive,
  setLocationActive,
  venue,
}) => {
  const markerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null); // Moved useState here

  // Open popup when active flag changes
  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isActive]);

  // Shorten day names
  const shortenDay = (day) => {
    const dayMap = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    };
    return dayMap[day] || day;
  };

  // Group consecutive days with same hours into ranges
  const groupSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return [];

    // Separate closed and open days
    const openDays = [];
    const closedDays = [];

    schedule.forEach((entry) => {
      const match = entry.match(/^([^:]+):\s*(.+)$/);
      if (!match) {
        openDays.push({ original: entry });
        return;
      }

      const [, day, hours] = match;
      if (hours.toLowerCase().includes("closed")) {
        closedDays.push({ day, hours });
      } else {
        openDays.push({ day, hours });
      }
    });

    // Group open days
    const grouped = [];
    let currentGroup = null;

    openDays.forEach((item, index) => {
      if (item.original) {
        grouped.push(item.original);
        return;
      }

      if (!currentGroup) {
        currentGroup = {
          startDay: item.day,
          endDay: item.day,
          hours: item.hours,
        };
      } else if (currentGroup.hours === item.hours) {
        currentGroup.endDay = item.day;
      } else {
        if (currentGroup.startDay === currentGroup.endDay) {
          grouped.push(
            `${shortenDay(currentGroup.startDay)}: ${currentGroup.hours}`
          );
        } else {
          grouped.push(
            `${shortenDay(currentGroup.startDay)} – ${shortenDay(currentGroup.endDay)}: ${currentGroup.hours}`
          );
        }
        currentGroup = {
          startDay: item.day,
          endDay: item.day,
          hours: item.hours,
        };
      }

      if (index === openDays.length - 1 && currentGroup) {
        if (currentGroup.startDay === currentGroup.endDay) {
          grouped.push(
            `${shortenDay(currentGroup.startDay)}: ${currentGroup.hours}`
          );
        } else {
          grouped.push(
            `${shortenDay(currentGroup.startDay)} – ${shortenDay(currentGroup.endDay)}: ${currentGroup.hours}`
          );
        }
      }
    });

    // Group closed days
    if (closedDays.length > 0) {
      if (closedDays.length === 1) {
        grouped.push(
          `${shortenDay(closedDays[0].day)}: ${closedDays[0].hours}`
        );
      } else {
        const closedDayNames = closedDays
          .map((d) => shortenDay(d.day))
          .join(", ");
        grouped.push(`${closedDayNames}: ${closedDays[0].hours}`);
      }
    }

    return grouped;
  };

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error obtaining location:", error);
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  // Scroll bar entry into view on marker click
  const handleClick = () => {
    setLocationActive(id);
    const el = document.getElementById(`${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const userLocationIcon = new Icon({
    iconUrl: "/assets/icons/currentPosition2.png",
    iconSize: [50, 50],
  });

  // Custom icon logic
  const iconUrl =
    venue.title === "Fully Burger"
      ? "/assets/icons/fullySticker.webp"
      : "/assets/icons/positionIcon.svg";

  const normalIcon = new Icon({ iconUrl, iconSize: [40, 40] });

  return (
    <>
      <Marker
        position={position}
        icon={normalIcon}
        ref={markerRef}
        eventHandlers={{ click: handleClick }}
        className="hover:scale-110 transition-transform duration-150 ease-in-out"
      >
        <Popup>
          <div className="w-[300px] shadow-md rounded-xl p-2">
            <h1 className="font-bold tracking-tight text-center mb-2">
              {venue.title}
            </h1>
            <Swiperino imgs={venue.imageUrls || []} videos={[]} />

            {venue.description && (
              <div className="text-xs pt-4 font-bold tracking-tight leading-3">
                {venue.description}
              </div>
            )}
            <div className="flex gap-2 justify-start py-2">
              {venue.phone && (
                <button className="bg-[#c52627] text-white p-2 rounded-full hover:opacity-50 transition-all">
                  <a
                    style={{
                      color: "white",
                    }}
                    href={`tel:${venue.phone}`}
                    target="_blank"
                  >
                    <Phone size={14} />
                  </a>
                </button>
              )}

              {/* <button className="bg-[#c52627] text-white p-2 rounded-full hover:opacity-50 transition-all">
                <a
                  style={{
                    color: "white",
                  }}
                  href={
                    venue.googleMap ||
                    `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`
                  }
                  target="_blank"
                >
                  <Map size={14} />
                </a>
              </button> */}

              {venue.instagram && (
                <button className="bg-[#c52627] text-white p-2 rounded-full hover:opacity-50 transition-all">
                  <a
                    style={{
                      color: "white",
                    }}
                    href={`https://www.instagram.com/${venue.instagram}/`}
                    target="_blank"
                  >
                    <Instagram size={14} />
                  </a>
                </button>
              )}

              {venue.website && (
                <button className="bg-[#c52627] text-white p-2 rounded-full hover:opacity-50 transition-all">
                  <a
                    style={{
                      color: "white",
                    }}
                    href={venue.website}
                    target="_blank"
                  >
                    <GlobeIcon size={14} />
                  </a>
                </button>
              )}

              {/* <button className="bg-[#c52627] text-white w-[30px] h-[30px] rounded-full hover:opacity-50 transition-all">
                <a
                  style={{
                    color: "white",
                  }}
                  target="_blank"
                  href={`https://divoora.ch/it/restaurants`}
                >
                  <img
                    src="/assets/icons/divoora.png"
                    className="rounded-full"
                  />
                </a>
              </button> */}
            </div>

            {/* Opening Hours */}
            {venue.schedule && venue.schedule.length > 0 && (
              <div className="border-t border-gray-200 mt-4 pt-4">
                <h2 className="font-bold text-xs mb-2">Opening Hours</h2>
                <div className="space-y-1">
                  {groupSchedule(venue.schedule).map((hour, index) => (
                    <div key={index} className="text-xs text-gray-700">
                      {hour}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div className="text-center font-semibold p-1 text-[10px]">
              You are here!
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default MarkerComponent;
