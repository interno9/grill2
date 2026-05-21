import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import MarkerComponent from "./MarkerComponent";
import { Minus, Plus, X, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function InitialViewSetup({ startCoordinates, zoom }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (startCoordinates && !initialized) {
      // First set the view to initialize the map
      map.setView(startCoordinates, zoom, { animate: false });

      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        // On desktop, apply offset for the sidebar after a brief moment
        requestAnimationFrame(() => {
          const barWidth = 500;
          const targetPoint = map.latLngToContainerPoint(startCoordinates);
          targetPoint.x -= barWidth / 2;
          const offsetLatLng = map.containerPointToLatLng(targetPoint);
          map.setView([offsetLatLng.lat, offsetLatLng.lng], zoom, {
            animate: false,
          });
        });
      }

      setInitialized(true);
    }
  }, [startCoordinates, zoom, initialized, map]);

  return null;
}

function PanToActiveVenue({ venues, locationActive }) {
  const map = useMap();

  useEffect(() => {
    if (locationActive != null) {
      // Find the active venue
      const activeVenue = venues.find((venue, index) => {
        const venueId = venue._id || index;
        return venueId === locationActive;
      });

      if (
        activeVenue?.location?.lat != null &&
        activeVenue?.location?.lng != null
      ) {
        const targetLatLng = [
          activeVenue.location.lat,
          activeVenue.location.lng,
        ];

        const isMobile = window.innerWidth < 640;

        if (!isMobile) {
          // On desktop, offset for the 450px bar on the left
          const barWidth = 450;

          // Convert the target point to container point, shift it left, then convert back
          const targetPoint = map.latLngToContainerPoint(targetLatLng);
          targetPoint.x -= barWidth / 2; // Shift left by half the bar width
          const offsetLatLng = map.containerPointToLatLng(targetPoint);

          map.setView(offsetLatLng, map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
        } else {
          // On mobile, center marker in the top 20dvh visible area
          // Bar takes 80dvh from bottom, leaving 20dvh visible at top
          const viewportHeight = window.innerHeight;

          const targetPoint = map.latLngToContainerPoint(targetLatLng);
          // We want marker at 10dvh from top (center of visible 20dvh)
          // Current marker is at center (50dvh), need to shift map so it appears at 10dvh
          // Shift down by 40dvh (50dvh - 10dvh)
          targetPoint.y += viewportHeight * 0.4;
          const offsetLatLng = map.containerPointToLatLng(targetPoint);

          map.setView(offsetLatLng, map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
        }
      }
    }
  }, [locationActive, venues, map]);

  return null;
}

function ResizeMap({ showBar }) {
  const map = useMap();
  useEffect(() => {
    // Delay to ensure DOM updates before invalidating size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [showBar, map]);
  return null;
}

function MapClickHandler({ setOpenBar }) {
  useMapEvents({
    click: () => {
      setOpenBar(false);
    },
  });
  return null;
}

const MapApp = ({
  venues,
  locationActive,
  setLocationActive,
  showBar,
  search,
  setSearch,
  setOpenBar,
}) => {
  const zoom = 11;
  const darkMode = false;
  const noLabels = false;
  const satelliteMode = false;
  const startCoordinates = [46.0037, 8.9511];

  return (
    <div
      className={`transition-all duration-150 ease-in-out w-full absolute ${showBar ? "h-[calc(100dvh)] sm:h-[100dvh]" : "h-[100dvh]"}`}
    >
      <nav className="hidden absolute m-4 bottom-0 sm:left-[calc(450px-1em)] z-50 rounded-full">
        <Popover>
          <PopoverTrigger asChild>
            <SlidersHorizontal size={28} className="bg-white" />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-white" align="start">
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">
                  Search
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search venues..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg ring-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                  }}
                  className="w-full bg-red-500 text-white font-semibold px-3 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  Clear filters
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </nav>

      <MapContainer
        className="absolute w-full top-0 right-0 z-0"
        style={{
          height: "100%",
          zIndex: 0,
        }}
        center={startCoordinates}
        zoom={zoom}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        zoomControl={false}
        dragging={true}
        keyboard={false}
      >
        <InitialViewSetup startCoordinates={startCoordinates} zoom={zoom} />
        <ResizeMap showBar={showBar} />
        <PanToActiveVenue venues={venues} locationActive={locationActive} />

        <MapClickHandler setOpenBar={setOpenBar} />

        {!satelliteMode && (
          <TileLayer
            attribution='© <a href="https://carto.com/">CartoDB</a>'
            url={`https://{s}.basemaps.cartocdn.com/${
              darkMode
                ? noLabels
                  ? "dark_nolabels"
                  : "dark_all"
                : noLabels
                  ? "rastertiles/voyager_nolabels"
                  : "rastertiles/voyager"
            }/{z}/{x}/{y}{r}.png`}
            subdomains={["a", "b", "c", "d"]}
          />
        )}

        {satelliteMode && (
          <TileLayer
            className="saturate-[0.7] brightness-[0.9]"
            attribution='© <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        {venues.map((venue, index) => {
          const venueId = venue._id || index;

          // Determine position from location field
          let lat, lng;

          if (venue.location?.lat != null && venue.location?.lng != null) {
            // Use location field
            lat = venue.location.lat;
            lng = venue.location.lng;
          } else {
            // Skip venues without valid position data
            return null;
          }

          return (
            <MarkerComponent
              key={venueId}
              id={venueId}
              position={[lat, lng]}
              isActive={locationActive === venueId}
              locationActive={locationActive}
              setLocationActive={setLocationActive}
              venue={venue}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapApp;
