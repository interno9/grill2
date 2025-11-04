import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import MarkerComponent from "./MarkerComponent";
import { Minus, Plus, X, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ZoomControl() {
  const map = useMap();

  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => {
          map.zoomIn();
        }}
        className="bg-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={() => {
          map.zoomOut();
        }}
        className="bg-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

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

        // Get map dimensions
        const mapSize = map.getSize();
        const isMobile = window.innerWidth < 768;

        if (!isMobile) {
          // On desktop, offset for the 500px bar on the left
          const barWidth = 500;

          // Convert the target point to container point, shift it left, then convert back
          const targetPoint = map.latLngToContainerPoint(targetLatLng);
          targetPoint.x -= barWidth / 2; // Shift left by half the bar width
          const offsetLatLng = map.containerPointToLatLng(targetPoint);

          map.setView(offsetLatLng, map.getZoom(), {
            animate: true,
            duration: 0.5,
          });
        } else {
          // On mobile, just center normally
          map.setView(targetLatLng, map.getZoom(), {
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

const MapApp = ({
  venues,
  allVenues,
  cities,
  locationActive,
  setLocationActive,
  showBar,
  setCategoryActive,
  categoryActive,
  search,
  setSearch,
  openNowFilter,
  setOpenNowFilter,
}) => {
  const zoom = 15;

  // Convert cities from Sanity to positions object
  const positions = useMemo(() => {
    if (!cities || cities.length === 0) return {};

    return cities.reduce((acc, city) => {
      if (city.location?.lat && city.location?.lng && city.location?.address) {
        // Use the address (city name) as the key, converted to lowercase
        const cityName = city.location.address
          .toLowerCase()
          .split(",")[0]
          .trim();
        acc[cityName] = [city.location.lat, city.location.lng];
      }
      return acc;
    }, {});
  }, [cities]);

  const [darkMode, setDarkMode] = useState(false);
  const [noLabels, setNoLabels] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [startCoordinates, setStartCoordinates] = useState(null);

  // Set initial coordinates to user's current position
  useEffect(() => {
    if (startCoordinates) return; // Already set

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartCoordinates([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.error("Error obtaining location:", error);
        // Fallback to first city if geolocation fails
        if (Object.keys(positions).length > 0) {
          const firstCity = Object.values(positions)[0];
          if (firstCity) {
            setStartCoordinates(firstCity);
          }
        }
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, [positions, startCoordinates]);

  // Extract unique tags from all venues (not filtered)
  const uniqueTags = useMemo(() => {
    const venuesToUse = allVenues || venues;
    const allTags = venuesToUse.flatMap((venue) => venue.tags || []);
    const uniqueSet = new Set(allTags);
    return Array.from(uniqueSet).sort();
  }, [allVenues, venues]);

  return (
    <div
      className={`transition-all duration-150 ease-in-out w-full absolute ${showBar ? "h-[calc(100dvh)] sm:h-[100dvh]" : "h-[100dvh]"}`}
    >
      <nav className="absolute m-4 bottom-0 sm:left-[calc(500px-1em)] z-50 rounded-full">
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

              <div>
                <label className="text-xs font-semibold mb-1 block">Zone</label>
                <select
                  defaultValue=""
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onChange={(e) => {
                    setStartCoordinates(positions[e.target.value]);
                  }}
                >
                  <option value="" disabled>
                    Select zone
                  </option>
                  {Object.keys(positions).map((cityKey) => (
                    <option key={cityKey} value={cityKey}>
                      {cityKey.charAt(0).toUpperCase() + cityKey.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">
                  Category
                </label>
                <select
                  value={categoryActive || ""}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onChange={(e) => {
                    setCategoryActive(e.target.value);
                  }}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  <option value="all">All</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag} className="capitalize">
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => setOpenNowFilter(!openNowFilter)}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-all font-semibold ${
                    openNowFilter
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {openNowFilter ? "✓ Open now" : "Open now"}
                </button>
              </div>

              {(search || categoryActive || openNowFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryActive(null);
                    setOpenNowFilter(false);
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
        zoomControl={true}
        dragging={true}
      >
        <InitialViewSetup startCoordinates={startCoordinates} zoom={zoom} />
        <ResizeMap showBar={showBar} />
        <PanToActiveVenue venues={venues} locationActive={locationActive} />
        <ZoomControl />

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
