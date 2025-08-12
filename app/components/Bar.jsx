import { useEffect } from "react";

export default function Bar({ projects, setLocationActive, locationActive }) {
  useEffect(() => {
    if (locationActive != null) {
      const el = document.getElementById(`${locationActive}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [locationActive]);

  return projects.map((project, index) => {
    const projectId = project.slug?.current ?? index;
    return (
      <button
        id={`${projectId}`}
        key={projectId}
        onClick={() => setLocationActive(projectId)}
        className={`flex-shrink-0 w-32 md:w-full rounded-2xl hover:bg-red-400 text-xs hover:text-white bg-neutral-100 text-left transition-colors duration-150
        ${locationActive === projectId ? "!bg-red-500 text-white" : "bg-transparent"}
        `}
      >
        <img
          src={project.imageUrls[0]}
          alt={project.title}
          className="w-full aspect-square rounded-2xl object-cover"
        />

        <h1 className="font-semibold text-center p-0.5 text-[10px] md:text-sm">
          {project.title}
        </h1>
        {/* <p className="truncate">
         
            {project.description ||
              "Un accogliente locale nel cuore di Lugano, specialità tipiche di cucina locale."}
          </p> */}
      </button>
    );
  });
}
