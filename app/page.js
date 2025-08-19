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
      schedule,
      location,
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

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      const title = p.title?.toLowerCase() || "";
      const desc = p.description?.toLowerCase() || "";
      const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : "";
      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [projects, search]);

  return (
    <div className="flex w-full h-[100dvh] relative">
      <Map
        projects={projects}
        locationActive={locationActive}
        setLocationActive={setLocationActive}
        setCategoryActive={setCategoryActive}
        showBar={showBar}
        search={search}
        setSearch={setSearch}
      />

      <div
        onClick={() => setShowBar(!showBar)}
        className="z-20 fixed right-1/2 translate-x-1/2 px-2 py-1 bg-white rounded-t-3xl md:hidden transition-all duration-150 ease-in-out cursor-pointer"
        style={{ bottom: showBar ? "208px" : "0px" }}
      >
        {showBar ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>

      <div
        className={`fixed z-20 gap-2 shadow-md p-2 bottom-0 md:left-0 md:relative bg-white flex md:flex-col md:w-[280px] md:max-h-[100dvh] overflow-x-scroll w-full items-start md:overflow-y-scroll ${showBar ? "" : "hidden md:flex"}`}
      >
        <Bar
          projects={filteredProjects}
          locationActive={locationActive}
          setLocationActive={setLocationActive}
          setCategoryActive={setCategoryActive}
        />
      </div>
    </div>
  );
}
