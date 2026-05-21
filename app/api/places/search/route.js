import { NextResponse } from "next/server";

// Constants
const GOOGLE_PLACES_TEXT_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const GOOGLE_PLACES_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_PLACES_PHOTO_URL =
  "https://maps.googleapis.com/maps/api/place/photo";
const MAX_PHOTOS = 5;
const PHOTO_MAX_WIDTH = 800;

const buildPhotoUrls = (photos, apiKey) => {
  if (!photos || photos.length === 0) return [];

  return photos
    .slice(0, MAX_PHOTOS)
    .map(
      (photo) =>
        `${GOOGLE_PLACES_PHOTO_URL}?maxwidth=${PHOTO_MAX_WIDTH}&photoreference=${photo.photo_reference}&key=${apiKey}`
    );
};

const searchPlace = async (query, apiKey) => {
  const response = await fetch(
    `${GOOGLE_PLACES_TEXT_SEARCH_URL}?query=${encodeURIComponent(query)}&key=${apiKey}`
  );
  return response.json();
};

const getPlaceDetails = async (placeId, apiKey) => {
  const fields = [
    "name",
    "formatted_address",
    "formatted_phone_number",
    "website",
    "geometry",
    "photos",
    "opening_hours",
    "types",
    "url",
    "international_phone_number",
    "business_status",
  ].join(",");

  const response = await fetch(
    `${GOOGLE_PLACES_DETAILS_URL}?place_id=${placeId}&fields=${fields}&key=${apiKey}`
  );
  const data = await response.json();
  console.log("Place details response:", JSON.stringify(data, null, 2));
  return data;
};

const buildVenueData = (details, placeId, photoUrls) => {
  const location = details.geometry?.location;

  console.log("Building venue data from:", {
    name: details.name,
    website: details.website,
    url: details.url,
  });

  return {
    name: details.name || "",
    address: details.formatted_address || "",
    phone: details.formatted_phone_number || "",
    website: details.website || "",
    googleMapsUrl: details.url || "",
    location: location ? { lat: location.lat, lng: location.lng } : null,
    types: details.types || [],
    openingHours: details.opening_hours?.weekday_text || [],
    photoUrls,
    placeId,
  };
};

// Main API route
export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Step 1: Search for place
    const searchData = await searchPlace(query, apiKey);

    if (searchData.status !== "OK" || searchData.results.length === 0) {
      return NextResponse.json(
        { error: "Venue not found", status: searchData.status },
        { status: 404 }
      );
    }

    const placeId = searchData.results[0].place_id;

    // Step 2: Get place details
    const detailsData = await getPlaceDetails(placeId, apiKey);

    if (detailsData.status !== "OK") {
      return NextResponse.json(
        { error: "Could not fetch place details", status: detailsData.status },
        { status: 500 }
      );
    }

    // Step 3: Build venue data
    const photoUrls = buildPhotoUrls(detailsData.result.photos, apiKey);
    const venueData = buildVenueData(detailsData.result, placeId, photoUrls);

    return NextResponse.json(venueData);
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
