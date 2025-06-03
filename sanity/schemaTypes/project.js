export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Nome del progetto",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(100),
    },
    {
      name: "slug",
      title: "/nome-del-progetto",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Descrizione del progetto",
      type: "text",
    },
    {
      name: "images",
      title: "Immagini",
      type: "array",
      of: [{ type: "image" }],
      options: {
        layout: "grid",
      },
    },

    {
      name: "videos",
      title: "Video",
      type: "array",
      of: [{ type: "file" }],
      options: {
        layout: "grid",
      },
    },

    {
      name: "positionN",
      title: "Posizione N",
      type: "number",

      validation: (Rule) => Rule.required(),
    },

    {
      name: "positionE",
      title: "Posizione E",
      type: "number",

      validation: (Rule) => Rule.required(),
    },

    // schedule
    {
      name: "schedule",
      title: "Schedule",
      type: "array",
      of: [{ type: "string" }],
    },

    {
      name: "location",
      title: "Location",
      type: "string",
    },

    // instagram
    {
      name: "instagram",
      title: "Instagram",
      type: "string",
    },

    // facebook
    {
      name: "facebook",
      title: "Facebook",
      type: "string",
    },

    // tripadvisor
    {
      name: "tripadvisor",
      title: "Tripadvisor",
      type: "string",
    },

    // website
    {
      name: "website",
      title: "Website",
      type: "string",
    },

    // phone
    {
      name: "phone",
      title: "Phone",
      type: "string",
    },

    // google map
    {
      name: "googleMap",
      title: "Google Map",
      type: "string",
    },

    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
};
