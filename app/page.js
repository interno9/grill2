"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import getSanityData from "../sanity/lib/fetchSanity";
import Bar from "./components/Bar";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Page() {
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationActive, setLocationActive] = useState(null);
  const [categoryActive, setCategoryActive] = useState(null);
  const [showBar, setShowBar] = useState(true);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [openNowFilter, setOpenNowFilter] = useState(false);

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

  useEffect(() => {
    const venueQuery = `*[_type == "venue"]{
      _id,
      "title": venueData.name,
      "description": venueData.description,
      "imageUrls": select(
        count(customImages) > 0 => customImages[].asset->url,
        venueData.photoUrls
      ),
      "location": venueData.location,
      "schedule": venueData.openingHours,
      "instagram": coalesce(instagramOverride, venueData.instagram),
      "website": venueData.website,
      "phone": venueData.phone,
      "googleMap": venueData.googleMapsUrl,
      tags
    }`;

    const cityQuery = `*[_type == "city"]{
      _id,
      location
    }`;

    getSanityData(venueQuery).then((res) => {
      if (res) setVenues(res);
    });

    getSanityData(cityQuery).then((res) => {
      if (res) setCities(res);
    });
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
    const desc = v.description || "";
    const tags = Array.isArray(v.tags) ? v.tags.join(" ") : "";
    return normalize(`${title} ${tags} ${desc}`);
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

  // Check if venue is open now
  const isVenueOpenNow = (venue) => {
    if (!venue.schedule || venue.schedule.length === 0) return true;

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todaySchedule = venue.schedule.find((entry) =>
      entry.toLowerCase().startsWith(currentDay.toLowerCase())
    );

    if (!todaySchedule) return true;
    if (todaySchedule.toLowerCase().includes("closed")) return false;

    const timeMatch = todaySchedule.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM).*?(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!timeMatch) return true;

    const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] =
      timeMatch;

    let openTime = parseInt(startHour) * 60 + parseInt(startMin);
    let closeTime = parseInt(endHour) * 60 + parseInt(endMin);

    if (startPeriod.toUpperCase() === "PM" && startHour !== "12")
      openTime += 12 * 60;
    if (startPeriod.toUpperCase() === "AM" && startHour === "12")
      openTime = parseInt(startMin);
    if (endPeriod.toUpperCase() === "PM" && endHour !== "12")
      closeTime += 12 * 60;
    if (endPeriod.toUpperCase() === "AM" && endHour === "12")
      closeTime = parseInt(endMin);

    return currentTime >= openTime && currentTime <= closeTime;
  };

  // Filter venues based on search and category
  const filteredVenues = useMemo(() => {
    let filtered = venues;

    // Filter by category
    if (categoryActive && categoryActive !== "all") {
      filtered = filtered.filter((v) => v.tags?.includes(categoryActive));
    }

    // Filter by search
    const q = search.trim();
    if (q) {
      const patterns = buildPatterns(q);
      filtered = filtered.filter((v) => {
        const text = fieldText(v);
        return patterns.every((re) => re.test(text));
      });
    }

    // Filter by open now
    if (openNowFilter) {
      filtered = filtered.filter((v) => isVenueOpenNow(v));
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
  }, [venues, search, categoryActive, userLocation, openNowFilter]);

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

  return (
    <div className="overflow-hidden h-[100dvh]">
      {/* <img
        src="/assets/imgs/oil.webp"
        className="w-full aspect-video object-cover"
      /> */}
      <div className="relative flex w-full h-full">
        <img
          src="./assets/imgs/logo.webp"
          className="absolute top-2 right-2 z-50 w-28 md:w-64"
        />

        <Map
          venues={filteredVenues}
          allVenues={venues}
          cities={cities}
          locationActive={locationActive}
          setLocationActive={setLocationActive}
          setCategoryActive={setCategoryActive}
          categoryActive={categoryActive}
          showBar={showBar}
          search={search}
          setSearch={setSearch}
          openNowFilter={openNowFilter}
          setOpenNowFilter={setOpenNowFilter}
        />

        {/* Toggle button on mobile */}
        <div
          onClick={() => setShowBar(!showBar)}
          className="z-20 absolute right-1/2 translate-x-1/2 px-2 py-1 bg-white rounded-t-3xl md:hidden transition-all duration-150 ease-in-out cursor-pointer"
          style={{ bottom: showBar ? "208px" : "0px" }}
        >
          {showBar ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>

        {/* Sidebar / bottom bar */}
        <div
          className={`absolute z-20 gap-2 shadow-md p-2 bottom-0 md:left-0 md:relative bg-white flex md:flex-col md:w-[320px] md:max-h-[100dvh] overflow-x-scroll w-full items-start md:overflow-y-scroll ${
            showBar ? "" : "hidden md:flex"
          }`}
        >
          <Bar
            venues={filteredVenues}
            locationActive={locationActive}
            setLocationActive={setLocationActive}
            setCategoryActive={setCategoryActive}
            categoryActive={categoryActive}
            search={search}
            setSearch={setSearch}
          />
        </div>
      </div>
    </div>
  );
}
