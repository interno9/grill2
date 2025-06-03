import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

async function scrapeEvents(siteUrl = "https://www.longlake.ch") {
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      executablePath: isLocal
        ? process.env.CHROME_EXECUTABLE_PATH
        : await chromium.executablePath(),
      headless: isLocal ? false : chromium.headless,
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    // Navigate to the page
    console.log(`Navigating to: ${siteUrl}`);
    await page.goto(siteUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait for event elements
    const selector = ".eapp-events-calendar-grid-item";
    await page.waitForSelector(selector, { timeout: 30000 });

    // Scrape event data
    const events = await page.$$eval(selector, (items) =>
      items.map((item) => ({
        title:
          item
            .querySelector(
              ".eapp-events-calendar-name-component.eapp-events-calendar-grid-item-name"
            )
            ?.textContent?.trim() || "",
        date: {
          month:
            item
              .querySelector(".eapp-events-calendar-date-element-month")
              ?.textContent?.trim() || "",
          day:
            item
              .querySelector(".eapp-events-calendar-date-element-day")
              ?.textContent?.trim() || "",
          dayOfWeek:
            item
              .querySelector(".eapp-events-calendar-date-element-dayOfWeek")
              ?.textContent?.trim() || "",
          time:
            item
              .querySelector(".eapp-events-calendar-time-time")
              ?.textContent?.trim() || "",
        },
        location:
          item
            .querySelector(".eapp-events-calendar-location-text")
            ?.textContent?.trim() || "",
        image:
          item
            .querySelector(".eapp-events-calendar-grid-item-imageContainer img")
            ?.getAttribute("src") || "",
      }))
    );

    console.log(`Total events scraped: ${events.length}`);
    await browser.close();

    if (events.length === 0) {
      console.warn("No events found. Check selectors or page content.");
      return { success: false, error: "No events found", events: [] };
    }

    return { success: true, events };
  } catch (error) {
    console.error("Scraping error:", error.message);
    return {
      success: false,
      error: `Failed to scrape the website: ${error.message}`,
      events: [],
    };
  }
}

// API route handlers
export async function POST(request) {
  const { siteUrl } = await request.json();
  const result = await scrapeEvents(siteUrl);
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function GET() {
  const result = await scrapeEvents();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
