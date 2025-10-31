import { NextResponse } from "next/server";

// Scrape social media links from Google Maps page
export async function POST(request) {
  try {
    const { googleMapsUrl, placeName } = await request.json();

    if (!googleMapsUrl) {
      return NextResponse.json(
        { error: "Google Maps URL is required" },
        { status: 400 }
      );
    }

    console.log("Fetching social media for:", placeName, googleMapsUrl);

    // Fetch the Google Maps page
    const response = await fetch(googleMapsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch Google Maps page:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch page", instagram: "" },
        { status: 200 }
      );
    }

    const html = await response.text();
    console.log("Fetched HTML length:", html.length);

    // Look for Instagram in the raw HTML text
    let instagram = "";
    const instagramPatterns = [
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/gi,
      /(?:https?:\/\/)?(?:www\.)?instagr\.am\/([a-zA-Z0-9._]+)/gi,
      /"instagram":\s*"([a-zA-Z0-9._]+)"/gi,
      /instagram\.com\\\/([a-zA-Z0-9._]+)/gi,
    ];

    for (const pattern of instagramPatterns) {
      const matches = [...html.matchAll(pattern)];
      for (const match of matches) {
        if (match[1]) {
          const handle = match[1]
            .replace(/\/$/, "")
            .replace(/\?.*$/, "")
            .replace(/\\/g, "")
            .replace(/"/g, "")
            .replace(/&amp;/g, "");

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
            "legal",
            "help",
          ];
          if (
            !blacklist.includes(handle.toLowerCase()) &&
            handle.length >= 3 &&
            handle.length <= 30
          ) {
            instagram = handle;
            console.log("Found Instagram in HTML:", handle);
            break;
          }
        }
      }
      if (instagram) break;
    }

    // Method 3: Try Outscraper API as fallback (if you have API key)
    if (!instagram && process.env.OUTSCRAPER_API_KEY) {
      try {
        const outscraperResponse = await fetch(
          `https://api.app.outscraper.com/maps/search-v2?query=${encodeURIComponent(
            placeName
          )}&limit=1`,
          {
            headers: {
              "X-API-KEY": process.env.OUTSCRAPER_API_KEY,
            },
          }
        );

        if (outscraperResponse.ok) {
          const outscraperData = await outscraperResponse.json();
          if (
            outscraperData.data &&
            outscraperData.data[0] &&
            outscraperData.data[0][0]
          ) {
            const place = outscraperData.data[0][0];
            if (place.instagram) {
              instagram = place.instagram.replace("@", "");
              console.log("Found Instagram via Outscraper:", instagram);
            }
          }
        }
      } catch (error) {
        console.error("Outscraper error:", error);
      }
    }

    console.log("Final Instagram result:", instagram || "NOT FOUND");

    return NextResponse.json({
      instagram: instagram || "",
      success: !!instagram,
    });
  } catch (error) {
    console.error("Social media scraping error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        instagram: "",
      },
      { status: 200 } // Return 200 even on error so the main flow continues
    );
  }
}
