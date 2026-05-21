import { NextResponse } from "next/server";

const LUGANO = {
  latitude: 46.0037,
  longitude: 8.9511,
};

export async function GET() {
  const params = new URLSearchParams({
    latitude: String(LUGANO.latitude),
    longitude: String(LUGANO.longitude),
    current: "temperature_2m,weather_code",
    timezone: "Europe/Zurich",
  });

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      {
        next: { revalidate: 600 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Lugano weather" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const current = data.current;
    const units = data.current_units;

    if (typeof current?.temperature_2m !== "number") {
      return NextResponse.json(
        { error: "Weather response did not include a temperature" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      location: "Lugano",
      temperature: Math.round(current.temperature_2m),
      unit: units?.temperature_2m || "°C",
      weatherCode: current.weather_code,
      observedAt: current.time,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Lugano weather", message: error.message },
      { status: 500 }
    );
  }
}
