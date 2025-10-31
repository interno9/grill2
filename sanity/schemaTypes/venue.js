import { VenueSearch } from "@/sanity/components/VenueSearch";
import { TagSuggestions } from "@/sanity/components/TagSuggestions";

export default {
  name: "venue",
  title: "Venue",
  type: "document",
  fields: [
    {
      name: "venueData",
      title: "Search Venue",
      description:
        "Search for a venue using Google Places. This will automatically populate name, address, phone, website, location, and more.",
      type: "object",
      components: {
        input: VenueSearch,
      },
      fields: [
        { name: "name", type: "string", title: "Name" },
        { name: "address", type: "string", title: "Address" },
        { name: "phone", type: "string", title: "Phone" },
        { name: "website", type: "string", title: "Website" },
        { name: "googleMapsUrl", type: "string", title: "Google Maps URL" },
        {
          name: "location",
          type: "geopoint",
          title: "Location",
        },
        {
          name: "types",
          type: "array",
          of: [{ type: "string" }],
          title: "Types",
        },
        {
          name: "openingHours",
          type: "array",
          of: [{ type: "string" }],
          title: "Opening Hours",
        },
        {
          name: "photoUrls",
          type: "array",
          of: [{ type: "string" }],
          title: "Photo URLs",
        },
        { name: "placeId", type: "string", title: "Google Place ID" },
        { name: "instagram", type: "string", title: "Instagram" },
        { name: "description", type: "text", title: "Description" },
      ],
    },
    {
      name: "instagramOverride",
      title: "Instagram Handle",
      description: 'Instagram username (without "@")',
      type: "string",
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          // Check if it's a valid Instagram username format
          if (!/^[a-zA-Z0-9._]{1,30}$/.test(value)) {
            return "Please enter a valid Instagram username (no @ symbol, letters, numbers, dots and underscores only)";
          }
          return true;
        }),
    },
    {
      name: "customImages",
      title: "Assets",
      type: "array",
      of: [{ type: "image" }],
      options: {
        layout: "grid",
      },
    },
    {
      name: "tags",
      title: "Category Tags",
      type: "array",
      of: [{ type: "string" }],
      components: {
        input: TagSuggestions,
      },
    },
  ],
  preview: {
    select: {
      title: "venueData.name",
      subtitle: "venueData.address",
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        title: title || "Unnamed Venue",
        subtitle: subtitle || "No address",
      };
    },
  },
};
