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
        className={`
        flex-shrink-0  w-40 md:w-full rounded-2xl hover:bg-red-500 text-xs hover:text-white bg-neutral-100 text-left transition-colors duration-150
        ${locationActive === projectId ? "bg-red-400 text-white" : "bg-transparent"}
        `}
      >
        <img
          src={project.imageUrls[0]}
          alt={project.title}
          className="w-full aspect-square rounded-2xl object-cover"
        />
        <div className="px-2 py-1 mb-1">
          <h1 className="md:text-lg font-semibold">{project.title}</h1>
          {/* <p className="truncate">
         
            {project.description ||
              "Un accogliente locale nel cuore di Lugano, specialità tipiche di cucina locale."}
          </p> */}
        </div>
      </button>
    );
  });
}
