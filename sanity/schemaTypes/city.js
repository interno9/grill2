import { AddressGeocode } from "@/sanity/components/AddressGeocode";

export default {
  name: "city",
  title: "City",
  type: "document",
  fields: [
    {
      name: "location",
      title: "City Name / Address",
      type: "geopoint",
      components: {
        input: AddressGeocode,
      },
      validation: (Rule) => Rule.required(),
    },
  ],

  preview: {
    select: {
      title: "location.address",
    },
  },
};
