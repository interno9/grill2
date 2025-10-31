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
const INSTAGRAM_REGEX = /instagram\.com\/([a-zA-Z0-9._]+)/;

// Helper functions
const extractInstagramHandle = (text) => {
  if (!text) return "";

  console.log("Checking for Instagram in:", text);

  // Match Instagram URLs and handles in various formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi,
    /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([a-zA-Z0-9._]+)/gi,
    /instagram\.com\\?\/([a-zA-Z0-9._]+)/gi, // Escaped slashes
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[1]) {
        // Clean up the handle
        let handle = match[1]
          .replace(/\/$/, "") // Remove trailing slash
          .replace(/\?.*$/, "") // Remove query params
          .replace(/\\/g, ""); // Remove escaped characters

        // Filter out common false positives
        const blacklist = [
          "explore",
          "accounts",
          "p",
          "stories",
          "reel",
          "reels",
          "tv",
          "about",
          "direct",
        ];
        if (!blacklist.includes(handle.toLowerCase())) {
          console.log("Found Instagram handle:", handle);
          return handle;
        }
      }
    }
  }

  console.log("No Instagram handle found");
  return "";
};

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
    "editorial_summary",
    "international_phone_number",
    "business_status",
    "reviews", // Reviews sometimes contain social media mentions
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
    hasEditorialSummary: !!details.editorial_summary?.overview,
    url: details.url,
    hasReviews: !!details.reviews,
  });

  // Try to find Instagram from multiple sources
  let instagram = "";

  // 1. Check website
  if (details.website) {
    console.log("Checking website:", details.website);
    instagram = extractInstagramHandle(details.website);
  }

  // 2. Check editorial summary/description
  if (!instagram && details.editorial_summary?.overview) {
    console.log(
      "Checking editorial summary:",
      details.editorial_summary.overview
    );
    instagram = extractInstagramHandle(details.editorial_summary.overview);
  }

  // 3. Check reviews for Instagram mentions
  if (!instagram && details.reviews) {
    console.log("Checking reviews for Instagram mentions");
    for (const review of details.reviews) {
      if (review.text) {
        instagram = extractInstagramHandle(review.text);
        if (instagram) break;
      }
    }
  }

  // 4. Check Google Maps URL (sometimes contains social media)
  if (!instagram && details.url) {
    console.log("Checking Google Maps URL:", details.url);
    instagram = extractInstagramHandle(details.url);
  }

  console.log("Final Instagram handle:", instagram || "NOT FOUND");

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
    instagram,
    description: details.editorial_summary?.overview || "",
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

    // Step 4: If Instagram not found, try scraping from Google Maps page
    if (!venueData.instagram && detailsData.result.url) {
      try {
        console.log("Attempting to scrape Instagram from Google Maps...");
        const socialResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/places/social`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              googleMapsUrl: detailsData.result.url,
              placeName: detailsData.result.name,
            }),
          }
        );

        if (socialResponse.ok) {
          const socialData = await socialResponse.json();
          if (socialData.instagram) {
            venueData.instagram = socialData.instagram;
            console.log("Instagram found via scraping:", socialData.instagram);
          }
        }
      } catch (error) {
        console.error("Error fetching social media:", error);
        // Continue without Instagram - not a critical error
      }
    }

    return NextResponse.json(venueData);
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
