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
    const el = document.getElementById(`bar-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const userLocationIcon = new Icon({
    iconUrl: "/assets/icons/currentPosition.png",
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
          <div className="w-[280px] shadow-md rounded-2xl p-2">
            <Swiperino imgs={venue.imageUrls || []} videos={[]} />
            <h1 className="font-bold tracking-tight mt-1 text-center">
              {venue.title}
            </h1>
            <div className="text-xs font-bold p-1 tracking-tight leading-3">
              {venue.description}
            </div>
            <div className="flex gap-2 justify-evenly my-2">
              {venue.phone && (
                <button className="bg-red-500 text-white p-2 rounded-full hover:opacity-50 transition-all">
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

              {/* <button className="bg-red-500 text-white p-2 rounded-full hover:opacity-50 transition-all">
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
                <button className="bg-red-500 text-white p-2 rounded-full hover:opacity-50 transition-all">
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
                <button className="bg-red-500 text-white p-2 rounded-full hover:opacity-50 transition-all">
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

              <button className="bg-red-500 text-white w-[30px] h-[30px] rounded-full hover:opacity-50 transition-all">
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
              </button>
            </div>
          </div>
        </Popup>
      </Marker>

      {/* User Location Marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>
            <div className="text-center font-semibold">
              <h1>You are here!</h1>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default MarkerComponent;
