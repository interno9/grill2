"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import grillData from "../../grill.json";
import Bar from "../components/Bar";
import { ChevronDown, ChevronUp, CloudSun } from "lucide-react";

export default function MapPage() {
  const [openBar, setOpenBar] = useState(false);
  const [weather, setWeather] = useState(null);
  const venues = useMemo(
    () =>
      grillData.map((item, index) => ({
        _id: `grill-${index}`,
        title: item.name,
        imageUrls: item.img ? [item.img] : [],
        location: {
          lat: item.lat,
          lng: item.lon,
        },
      })),
    []
  );
  const [locationActive, setLocationActive] = useState(null);
  const [showBar, setShowBar] = useState(true);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const Map = useMemo(
    () =>
      dynamic(() => import("@/app/components/MapComponent"), {
        loading: () => null,
        ssr: false,
      }),
    []
  );

  // --- Search helpers ---
  const normalize = (str = "") =>
    str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .toLowerCase();

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const tokenToPattern = (token) => {
    const clean = escapeRegExp(token);
    const chars = clean
      .split("")
      .map((c) => `${c}(?:[\\s_\\-]*)`)
      .join("");
    return new RegExp(`${chars}(?:e?s)?`, "i");
  };

  const buildPatterns = (query) =>
    normalize(query).trim().split(/\s+/).filter(Boolean).map(tokenToPattern);

  const fieldText = (v) => {
    const title = v.title || "";
    return normalize(title);
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter venues based on search
  const filteredVenues = useMemo(() => {
    let filtered = venues;

    // Filter by search
    const q = search.trim();
    if (q) {
      const patterns = buildPatterns(q);
      filtered = filtered.filter((v) => {
        const text = fieldText(v);
        return patterns.every((re) => re.test(text));
      });
    }

    // Sort by distance from user location
    if (userLocation) {
      filtered = [...filtered].sort((a, b) => {
        const distA = a.location
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              a.location.lat,
              a.location.lng
            )
          : Infinity;
        const distB = b.location
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              b.location.lat,
              b.location.lng
            )
          : Infinity;
        return distA - distB;
      });
    }

    return filtered;
  }, [venues, search, userLocation]);

  // ID focus: trigger when exactly one venue matches search
  useEffect(() => {
    if (!search || venues.length === 0) return;
    const q = normalize(search);
    const matches = venues.filter((v) => normalize(v.title || "").includes(q));
    if (matches.length === 1) {
      setLocationActive(matches[0]._id);
    } else {
      setLocationActive(null);
    }
  }, [search, venues]);

  // Auto-open bar when a marker is clicked
  useEffect(() => {
    if (locationActive) {
      setOpenBar(false);
    }
  }, [locationActive]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/weather")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch weather");
        return response.json();
      })
      .then((data) => {
        if (isMounted) setWeather(data);
      })
      .catch((error) => {
        console.error("Error getting Lugano weather:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="overflow-hidden h-[100dvh]">
      <div className="relative flex w-full h-full">
        {/* <a href="/" className="pointer-events-none">
          <img
            src="/assets/imgs/logo.webp"
            className="absolute top-4 transition-all hover:opacity-75 right-2 z-50 w-28 sm:w-40 cursor-pointer"
          />
        </a> */}

        <Map
          venues={filteredVenues}
          locationActive={locationActive}
          setLocationActive={setLocationActive}
          showBar={showBar}
          search={search}
          setSearch={setSearch}
          setOpenBar={setOpenBar}
        />

        <div className="fixed top-3 right-3 z-50 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-black shadow-md">
            <CloudSun size={17} strokeWidth={2} />
            <span>
              {weather ? `${weather.temperature}${weather.unit}` : "--°C"}
            </span>
          </div>
        </div>

        {/* Sidebar / bottom bar */}

        <div className="fixed z-50 bottom-0 left-0 w-full sm:w-[450px] pointer-events-none">
          <button
            onClick={() => {
              setOpenBar((prevOpenBar) => !prevOpenBar);
            }}
            className="z-1 absolute -top-[26px] left-1/2 -translate-x-1/2 bg-white rounded-t-full px-2 py-1 pointer-events-auto"
          >
            {openBar ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div
            onWheel={(event) => event.stopPropagation()}
            className={`outline sm:outline-none outline-white z-10 ${openBar ? "max-h-[20vh]" : "max-h-[80dvh]"} transition-all w-full bg-white sm:bg-transparent gap-4 sm:p-4 flex flex-col sm:max-h-[100dvh] overflow-x-scroll items-center overflow-y-scroll pointer-events-auto`}
          >
            <Bar
              venues={filteredVenues}
              locationActive={locationActive}
              setLocationActive={setLocationActive}
              search={search}
              setSearch={setSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
