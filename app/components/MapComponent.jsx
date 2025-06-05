import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import MarkerComponent from "./MarkerComponent";

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
      console.log("Map invalidated, showBar:", showBar);
    }, 200);
    return () => clearTimeout(timer);
  }, [showBar, map]);
  return null;
}

const MapApp = ({ projects, locationActive, setLocationActive, showBar }) => {
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

  const handleLocationChange = (location) => {
    setStartCoordinates(positions[location]);
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out w-full fixed ${showBar ? "h-[calc(100dvh-207px)] md:h-[100dvh]" : "h-[100dvh]"}`}
    >
      <nav className="fixed m-3 top-0 md:left-[calc(300px)] z-50 text-black backdrop-blur-md flex gap-3 p-3 shadow-md font-bold text-sm rounded-full">
        <select
          onChange={(e) => handleLocationChange(e.target.value)}
          defaultValue="lugano"
        >
          <option value="lugano">Lugano</option>
          <option value="bellinzona">Bellinzona</option>
          <option value="locarno">Locarno</option>
          <option value="agno">Agno</option>
        </select>

        <select
          onChange={(e) => {
            console.log("Filter selected:", e.target.value);
          }}
        >
          <option value="kebab">Kebab</option>
          <option value="pizza">Pizza</option>
          <option value="sushi">Sushi</option>
          <option value="burger">Burger</option>
          <option value="icecream">Ice Cream</option>
          <option value="all">All</option>
          <option value="cafe">Café</option>
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="pub">Pub</option>
          <option value="pasta">Pasta</option>
          <option value="tapas">Tapas</option>
          <option value="asian">Asian</option>
          <option value="veg">Veg</option>
        </select>
      </nav>

      <MapContainer
        className="absolute w-full md:w-[calc(100vw-300px)] top-0 right-0 z-0"
        style={{
          height: "100%",
          zIndex: 0,
        }}
        center={startCoordinates}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        <ChangeView center={startCoordinates} zoom={zoom} />
        <ResizeMap showBar={showBar} />

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
          return (
            <MarkerComponent
              key={projectId}
              position={[project.positionN, project.positionE]}
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
