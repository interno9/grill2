import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import MarkerComponent from "./MarkerComponent";

function ZoomControl() {
  const map = useMap();

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => {
          map.zoomIn();
        }}
        className="bg-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
      >
        +
      </button>
      <button
        onClick={() => {
          map.zoomOut();
        }}
        className="bg-white font-bold w-6 h-6 rounded-full flex items-center justify-center"
      >
        −
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
  projects,
  allProjects,
  locationActive,
  setLocationActive,
  showBar,
  setCategoryActive,
  categoryActive,
  search,
  setSearch,
}) => {
  const zoom = 15;

  const positions = {
    lugano: [46.0057, 8.9611],
    bellinzona: [46.1946, 9.0244],
    locarno: [46.167, 8.7943],
    agno: [45.997, 8.8994],
  };

  const [darkMode, setDarkMode] = useState(false);
  const [noLabels, setNoLabels] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [startCoordinates, setStartCoordinates] = useState(positions.lugano);

  // Extract unique tags from all projects (not filtered)
  const uniqueTags = useMemo(() => {
    const projectsToUse = allProjects || projects;
    const allTags = projectsToUse.flatMap((project) => project.tags || []);
    const uniqueSet = new Set(allTags);
    return Array.from(uniqueSet).sort();
  }, [allProjects, projects]);

  const handleLocationChange = (location) => {
    setStartCoordinates(positions[location]);
  };

  return (
    <div
      className={`transition-all duration-150 ease-in-out w-full fixed ${showBar ? "h-[calc(100dvh-165px)] md:h-[100dvh]" : "h-[100dvh]"}`}
    >
      <nav className="fixed m-2 top-0 md:left-[calc(280px)] z-50 text-black backdrop-blur-md flex gap-2 p-2 shadow-md font-bold text-xs rounded-full">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Search..."
          className="top-0 w-32  font-bold border border-neutral-300 rounded-full px-2 py-2 ring-0 focus:ring-0 focus:outline-none"
        />

        <select
          defaultValue=""
          className="ring-0 border border-neutral-300 rounded-full"
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          <option value="" disabled>
            Città
          </option>
          <option value="lugano">Lugano</option>
          <option value="bellinzona">Bellinzona</option>
          <option value="locarno">Locarno</option>
          <option value="agno">Agno</option>
        </select>

        <select
          value={categoryActive || ""}
          className="ring-0 border border-neutral-300 rounded-full"
          onChange={(e) => {
            setCategoryActive(e.target.value);
          }}
        >
          <option value="" disabled>
            Categorie
          </option>
          <option value="all">All</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </option>
          ))}
        </select>

        {(search || categoryActive) && (
          <button
            onClick={() => {
              setSearch("");
              setCategoryActive(null);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full transition-colors"
            title="Clear filters"
          >
            ✕
          </button>
        )}
      </nav>

      <MapContainer
        className="absolute w-full md:w-[calc(100vw-280px)] top-0 right-0 z-0"
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

        {projects.map((project, index) => {
          const projectId = project.slug?.current || index;

          // Determine position from either new location field or old positionN/E fields
          let lat, lng;

          if (project.location?.lat != null && project.location?.lng != null) {
            // Use new location field if available
            lat = project.location.lat;
            lng = project.location.lng;
          } else if (project.positionN != null && project.positionE != null) {
            // Fallback to old position fields
            lat = project.positionN;
            lng = project.positionE;
          } else {
            // Skip projects without valid position data
            return null;
          }

          return (
            <MarkerComponent
              key={projectId}
              position={[lat, lng]}
              isActive={locationActive === projectId}
              locationActive={locationActive}
              setLocationActive={setLocationActive}
              project={project}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapApp;
