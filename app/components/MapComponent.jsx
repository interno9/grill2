import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import MarkerComponent from "./MarkerComponent";
import { Minus, Plus, X } from "lucide-react";

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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
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
      className={`transition-all duration-150 ease-in-out w-full absolute ${showBar ? "h-[calc(100dvh-165px)] md:h-[100dvh]" : "h-[100dvh]"}`}
    >
      <nav className="absolute m-2 top-0 md:left-[calc(320px)] z-50 text-black backdrop-blur-md flex gap-2 p-2 shadow-md font-bold text-xs rounded-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search..."
          className="top-0 w-32  font-bold border border-neutral-300 rounded-full ring-0 focus:ring-0 focus:outline-none"
        />

        <select
          defaultValue=""
          className="ring-0 border border-neutral-300 rounded-full w-28"
          onChange={(e) => {
            setStartCoordinates(positions[e.target.value]);
          }}
        >
          <option value="" disabled>
            Zone
          </option>
          {Object.keys(positions).map((cityKey) => (
            <option key={cityKey} value={cityKey}>
              {cityKey.charAt(0).toUpperCase() + cityKey.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={categoryActive || ""}
          className="ring-0 border border-neutral-300 rounded-full w-28"
          onChange={(e) => {
            setCategoryActive(e.target.value);
          }}
        >
          <option value="" disabled>
            Category
          </option>
          <option value="all">All</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag} className="capitalize">
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={() => setOpenNowFilter(!openNowFilter)}
          className={`px-3 py-2 rounded-full transition-all border border-neutral-300 ${
            openNowFilter
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          Open now
        </button>

        {(search || categoryActive || openNowFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryActive(null);
              setOpenNowFilter(false);
            }}
            className="bg-[#c52627] text-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
          >
            <X size={16} />
          </button>
        )}
      </nav>

      <MapContainer
        className="absolute w-full md:w-[calc(100vw-320px)] top-0 right-0 z-0"
        style={{
          height: "100%",
          zIndex: 0,
        }}
        center={startCoordinates}
        zoom={zoom}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={false}
        dragging={true}
      >
        <ChangeView center={startCoordinates} zoom={zoom} />
        <ResizeMap showBar={showBar} />
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
