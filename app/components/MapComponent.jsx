"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import { Moon, Sun, Globe, Layers } from "lucide-react";
import MarkerComponent from "./MarkerComponent";

const MapApp = ({ projects, locationActive, setLocationActive }) => {
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
    <div>
      <nav className="fixed m-3 top-0 md:left-[calc(300px)] z-50 text-black backdrop-blur-md flex gap-6 p-2 shadow-md font-bold text-sm rounded-full">
        <select
          onChange={(e) => {
            handleLocationChange(e.target.value);
          }}
        >
          <option value="lugano">Lugano</option>
          <option value="bellinzona">Bellinzona</option>
          <option value="locarno">Locarno</option>
          <option value="agno">Agno</option>
        </select>

        <select
          onChange={(e) => {
            handleLocationChange(e.target.value);
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

        {/* <button onClick={() => setSatelliteMode((prev) => !prev)}>
          <Globe size={32} />
        </button>
        <button
          onClick={() => {
            setDarkMode((prev) => !prev);
            setSatelliteMode(false);
          }}
        >
          {darkMode ? <Moon size={32} /> : <Sun size={32} />}
        </button> */}
        {/* <button onClick={() => setNoLabels(!noLabels)}>
          <Layers size={32} />
        </button> */}
      </nav>

      <MapContainer
        className="absolute w-full md:w-[calc(100vw-300px)]  top-0 right-0 h-[calc(100vh-207px)] md:h-full z-0"
        center={startCoordinates}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        {!satelliteMode && (
          <TileLayer
            attribution='© <a href="https://carto.com/">CartoDB</a>'
            url={`https://{s}.basemaps.cartocdn.com/${
              darkMode
                ? noLabels
                  ? "dark_all"
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
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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
