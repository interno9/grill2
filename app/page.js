"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import getSanityData from "../sanity/lib/fetchSanity";
import Bar from "./components/Bar";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Page() {
  const [projects, setProjects] = useState([]);
  const [locationActive, setLocationActive] = useState(null);
  const [categoryActive, setCategoryActive] = useState(null);
  const [showBar, setShowBar] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const query = `*[_type == "project"]{
      title,
      slug,
      description,
      "imageUrls": images[].asset->url,
      "videosUrls": videos[].asset->url,
      positionN,
      positionE,
      location,
      schedule,
      instagram,
      facebook,
      tripadvisor,
      website,
      phone,
      googleMap,
      tags
    }`;

    getSanityData(query).then((res) => {
      if (res) setProjects(res);
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

  const fieldText = (p) => {
    const title = p.title || "";
    const desc = p.description || "";
    const tags = Array.isArray(p.tags) ? p.tags.join(" ") : "";
    return normalize(`${title} ${tags} ${desc}`);
  };

  // Filter projects based on search and category
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by category
    if (categoryActive && categoryActive !== "all") {
      filtered = filtered.filter((p) => p.tags?.includes(categoryActive));
    }

    // Filter by search
    const q = search.trim();
    if (q) {
      const patterns = buildPatterns(q);
      filtered = filtered.filter((p) => {
        const text = fieldText(p);
        return patterns.every((re) => re.test(text));
      });
    }

    return filtered;
  }, [projects, search, categoryActive]);

  // Slug focus: trigger when exactly one project matches slug partially
  useEffect(() => {
    if (!search || projects.length === 0) return;
    const q = normalize(search);
    const matches = projects.filter((p) =>
      normalize(p.slug?.current || "").includes(q)
    );
    if (matches.length === 1) {
      setLocationActive(matches[0].slug.current);
    } else {
      setLocationActive(null);
    }
  }, [search, projects]);

  return (
    <div className="flex w-full h-[100dvh] relative">
      <Map
        projects={filteredProjects}
        allProjects={projects}
        locationActive={locationActive}
        setLocationActive={setLocationActive}
        setCategoryActive={setCategoryActive}
        categoryActive={categoryActive}
        showBar={showBar}
        search={search}
        setSearch={setSearch}
      />

      {/* Toggle button on mobile */}
      <div
        onClick={() => setShowBar(!showBar)}
        className="z-20 fixed right-1/2 translate-x-1/2 px-2 py-1 bg-white rounded-t-3xl md:hidden transition-all duration-150 ease-in-out cursor-pointer"
        style={{ bottom: showBar ? "208px" : "0px" }}
      >
        {showBar ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>

      {/* Sidebar / bottom bar */}
      <div
        className={`fixed z-20 gap-2 shadow-md p-2 bottom-0 md:left-0 md:relative bg-white flex md:flex-col md:w-[280px] md:max-h-[100dvh] overflow-x-scroll w-full items-start md:overflow-y-scroll ${
          showBar ? "" : "hidden md:flex"
        }`}
      >
        <Bar
          projects={filteredProjects}
          locationActive={locationActive}
          setLocationActive={setLocationActive}
          setCategoryActive={setCategoryActive}
          categoryActive={categoryActive}
          search={search}
          setSearch={setSearch}
        />
      </div>
    </div>
  );
}
