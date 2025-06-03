"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import getSanityData from "../sanity/lib/fetchSanity";
import Bar from "./components/Bar";

export default function Page() {
  const [projects, setProjects] = useState([]);
  const [locationActive, setLocationActive] = useState(null);

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
      if (res) {
        setProjects(res);
      }
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

  // TODO
  // centering

  return (
    <div className="flex w-full h-[100dvh] relative">
      <Map
        projects={projects}
        locationActive={locationActive}
        setLocationActive={setLocationActive}
      />

      <div className="z-20 gap-3 shadow-md p-3 fixed bottom-0 md:relative bg-white flex md:flex-col md:w-[300px] md:max-h-[100dvh] overflow-x-scroll w-full items-start md:overflow-y-scroll">
        <Bar
          projects={projects}
          locationActive={locationActive}
          setLocationActive={setLocationActive}
        />
      </div>
    </div>
  );
}
