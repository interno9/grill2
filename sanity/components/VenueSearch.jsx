import React, { useState, useCallback, useEffect } from "react";
import {
  Stack,
  TextInput,
  Button,
  Card,
  Text,
  Flex,
  Box,
  Grid,
} from "@sanity/ui";
import { set, unset } from "sanity";

// Custom input component for venue search using Google Places API
export function VenueSearch(props) {
  const { onChange, value } = props;
  const [searchQuery, setSearchQuery] = useState(value?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update search query when value changes (e.g., when loading existing venue)
  useEffect(() => {
    if (value?.name) {
      setSearchQuery(value.name);
    }
  }, [value?.name]);

  // Fetch venue details from Google Places API via Next.js API route
  const searchVenue = useCallback(
    async (query) => {
      if (!query.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/places/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to search venue");
          return;
        }

        // Build the venue data object with Sanity types
        const venueData = {
          _type: "object",
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          website: data.website || "",
          googleMapsUrl: data.googleMapsUrl || "",
          location: {
            _type: "geopoint",
            lat: data.location.lat,
            lng: data.location.lng,
          },
          types: data.types || [],
          openingHours: data.openingHours || [],
          photoUrls: data.photoUrls || [],
          placeId: data.placeId,
          instagram: data.instagram || "",
          description: data.description || "",
        };

        onChange(set(venueData));
      } catch (err) {
        setError(
          "Error searching venue. Please check your internet connection and try again."
        );
        console.error("Venue search error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange]
  );

  const handleSearch = useCallback(() => {
    searchVenue(searchQuery);
  }, [searchQuery, searchVenue]);

  const handleClear = useCallback(() => {
    onChange(unset());
    setSearchQuery("");
    setError(null);
  }, [onChange]);

  return (
    <Stack space={4}>
      {/* Search Input Section */}
      <Card padding={3} radius={2} shadow={1}>
        <Stack space={3}>
          <Flex gap={2} align="center">
            <Box flex={1}>
              <TextInput
                placeholder="Search for a venue (e.g., 'Caffè Milano, Via Roma, Milano')"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                fontSize={2}
              />
            </Box>
            <Button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
              loading={isLoading}
              text="Search"
              tone="primary"
              fontSize={2}
              padding={3}
            />
            {value?.name && (
              <Button
                onClick={handleClear}
                text="Clear"
                tone="critical"
                mode="ghost"
                fontSize={2}
                padding={3}
              />
            )}
          </Flex>
        </Stack>
      </Card>

      {/* Error Message */}
      {error && (
        <Card tone="critical" padding={4} radius={2} shadow={1}>
          <Flex align="center" gap={2}>
            <Text size={2}>⚠️</Text>
            <Text size={2}>{error}</Text>
          </Flex>
        </Card>
      )}

      {/* Venue Details Section */}
      {value?.name && (
        <Card tone="positive" padding={4} radius={2} shadow={1}>
          <Stack space={4}>
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Text size={3} weight="bold">
                  ✓
                </Text>
                <Text size={3} weight="bold">
                  Venue Found
                </Text>
              </Flex>
              {value.googleMapsUrl && (
                <Button
                  as="a"
                  href={value.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  text="View on Google Maps"
                  tone="primary"
                  mode="ghost"
                  fontSize={1}
                />
              )}
            </Flex>

            {/* Main Information Grid */}
            <Stack space={4}>
              <Box>
                <Text size={1} weight="semibold" muted>
                  Name
                </Text>
                <Text size={2} weight="semibold" style={{ marginTop: 4 }}>
                  {value.name}
                </Text>
              </Box>

              <Box>
                <Text size={1} weight="semibold" muted>
                  Address
                </Text>
                <Text size={2} style={{ marginTop: 4 }}>
                  {value.address}
                </Text>
              </Box>

              <Grid columns={[1, 1, 2]} gap={4}>
                {value.phone && (
                  <Box>
                    <Text size={1} weight="semibold" muted>
                      Phone
                    </Text>
                    <Text size={2} style={{ marginTop: 4 }}>
                      {value.phone}
                    </Text>
                  </Box>
                )}

                {value.instagram && (
                  <Box>
                    <Text size={1} weight="semibold" muted>
                      Instagram
                    </Text>
                    <Text size={2} style={{ marginTop: 4 }}>
                      @{value.instagram}
                    </Text>
                  </Box>
                )}
              </Grid>

              {value.website && (
                <Box>
                  <Text size={1} weight="semibold" muted>
                    Website
                  </Text>
                  <Text size={2} style={{ marginTop: 4 }}>
                    <a
                      href={value.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "inherit",
                        textDecoration: "underline",
                      }}
                    >
                      {value.website}
                    </a>
                  </Text>
                </Box>
              )}

              {value.description && (
                <Box>
                  <Text size={1} weight="semibold" muted>
                    Description
                  </Text>
                  <Text size={2} style={{ marginTop: 4, lineHeight: 1.6 }}>
                    {value.description}
                  </Text>
                </Box>
              )}

              {value.openingHours && value.openingHours.length > 0 && (
                <Box>
                  <Text size={1} weight="semibold" muted>
                    Opening Hours
                  </Text>
                  <Card
                    padding={3}
                    radius={2}
                    tone="transparent"
                    border
                    style={{ marginTop: 8 }}
                  >
                    <Stack space={2}>
                      {value.openingHours.map((hour, index) => (
                        <Flex key={index} justify="space-between">
                          <Text size={2}>{hour}</Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Card>
                </Box>
              )}

              {/* Coordinates (Hidden but available for debugging) */}
              {value.location && (
                <Box style={{ display: "none" }}>
                  <Text size={1} muted>
                    Coordinates: {value.location?.lat?.toFixed(6)},{" "}
                    {value.location?.lng?.toFixed(6)}
                  </Text>
                </Box>
              )}
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
