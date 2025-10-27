import React, { useState, useCallback, useEffect } from "react";
import { Stack, TextInput, Button, Card, Text, Flex, Box } from "@sanity/ui";
import { set, unset } from "sanity";

// Custom input component for address geocoding
export function AddressGeocode(props) {
  const { onChange, value } = props;
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize address field with stored address if available
  useEffect(() => {
    if (value?.address && !address) {
      setAddress(value.address);
    }
  }, [value?.address, address]);

  // Google Maps Geocoding API function
  const geocodeAddress = useCallback(
    async (addressToGeocode) => {
      if (!addressToGeocode.trim()) return;

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError(
          "Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables."
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Using Google Maps Geocoding API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressToGeocode
          )}&key=${apiKey}`
        );

        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const formattedAddress = data.results[0].formatted_address;

          // Update the field value with coordinates and formatted address
          onChange(
            set({
              _type: "geopoint",
              lat: location.lat,
              lng: location.lng,
              address: formattedAddress,
            })
          );

          // Update the input field with the formatted address
          setAddress(formattedAddress);
        } else {
          let errorMessage =
            "Address not found. Please try a different address.";
          if (data.status === "ZERO_RESULTS") {
            errorMessage = "No results found for this address.";
          } else if (data.status === "OVER_QUERY_LIMIT") {
            errorMessage =
              "Google Maps API quota exceeded. Please try again later.";
          } else if (data.status === "REQUEST_DENIED") {
            errorMessage =
              "Google Maps API request denied. Please check your API key.";
          }
          setError(errorMessage);
        }
      } catch (err) {
        setError(
          "Error geocoding address. Please check your internet connection and try again."
        );
        console.error("Geocoding error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange]
  );

  const handleGeocode = useCallback(() => {
    geocodeAddress(address);
  }, [address, geocodeAddress]);

  const handleClear = useCallback(() => {
    onChange(unset());
    setAddress("");
    setError(null);
  }, [onChange]);

  return (
    <Stack space={3}>
      <Flex gap={2}>
        <TextInput
          placeholder="Enter an address (e.g., Via Montenapoleone, Milano, Italy)"
          value={address}
          onChange={(event) => setAddress(event.currentTarget.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleGeocode();
            }
          }}
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleGeocode}
          disabled={!address.trim() || isLoading}
          loading={isLoading}
          text="Find Location"
          tone="primary"
        />
        {value?.lat != null && (
          <Button
            onClick={handleClear}
            text="Clear"
            tone="critical"
            mode="ghost"
          />
        )}
      </Flex>

      {error && (
        <Card tone="critical" padding={3}>
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {value?.lat != null && value?.lng != null && (
        <Card tone="positive" padding={3}>
          <Stack space={2}>
            <Text weight="medium">📍 Location found:</Text>
            <Text size={1}>
              <strong>Address:</strong> {value.address || "N/A"}
            </Text>
            <Text size={1}>
              <strong>Coordinates:</strong> {value.lat.toFixed(6)},{" "}
              {value.lng.toFixed(6)}
            </Text>
            <Box>
              <Text size={1} muted>
                <a
                  href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit" }}
                >
                  🗺️ View on Google Maps
                </a>
              </Text>
            </Box>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
