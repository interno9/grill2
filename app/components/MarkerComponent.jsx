import { Marker, Popup } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { Icon } from "leaflet";

const MarkerComponent = ({
  id,
  position,
  isActive,
  setLocationActive,
  venue,
}) => {
  const markerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);

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

  const iconSize = isActive ? [40, 40] : [30, 30];

  const normalIcon = new Icon({
    iconUrl,
    iconSize,
    opacity: 1,
  });

  return (
    <>
      <Marker
        position={position}
        icon={isActive ? normalIcon : normalIcon}
        ref={markerRef}
        eventHandlers={{ click: handleClick }}
        className={isActive ? "marker-active" : ""}
      />

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
