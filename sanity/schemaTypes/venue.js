import { VenueSearch } from "@/sanity/components/VenueSearch";

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
      ],
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
  ],
  preview: {
    select: {
      title: "venueData.name",
      subtitle: "venueData.address",
      customImages: "customImages",
    },
    prepare(selection) {
      const { title, subtitle, customImages } = selection;

      // Get first image from customImages only
      // Note: photoUrls (external URLs) cannot be used as media in Sanity preview
      let media = undefined;
      if (customImages && customImages.length > 0 && customImages[0]?.asset) {
        media = customImages[0];
      }

      return {
        title: title || "Unnamed Venue",
        subtitle: subtitle || "No address",
        media: media,
      };
    },
  },
};
