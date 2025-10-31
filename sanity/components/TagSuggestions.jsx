import React, { useState, useCallback, useEffect } from "react";
import { Stack, Button, Card, Text, Flex, Box, Checkbox } from "@sanity/ui";
import { set } from "sanity";
import { useFormValue } from "sanity";

// Predefined tag categories
const TAG_CATEGORIES = {
  food: [
    "restaurant",
    "cafe",
    "bar",
    "pizzeria",
    "bistro",
    "trattoria",
    "bakery",
    "fast-food",
    "fine-dining",
    "street-food",
  ],
  beverage: [
    "wine-bar",
    "cocktail-bar",
    "beer-garden",
    "pub",
    "coffee-shop",
    "tea-house",
    "juice-bar",
  ],
  cuisine: [
    "italian",
    "french",
    "japanese",
    "chinese",
    "indian",
    "mexican",
    "mediterranean",
    "asian",
    "american",
    "swiss",
  ],
  atmosphere: [
    "casual",
    "cozy",
    "romantic",
    "family-friendly",
    "trendy",
    "elegant",
    "rustic",
    "modern",
    "outdoor-seating",
    "live-music",
  ],
  dietary: ["vegetarian", "vegan", "gluten-free", "organic", "halal", "kosher"],
  service: [
    "takeaway",
    "delivery",
    "reservations",
    "wifi",
    "parking",
    "pet-friendly",
  ],
};

export function TagSuggestions(props) {
  const { onChange, value = [] } = props;
  const venueData = useFormValue(["venueData"]);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Auto-generate tags using AI when venue data changes
  useEffect(() => {
    if (!venueData || !venueData.name || !venueData.placeId) {
      return;
    }

    // Only generate if we don't have tags yet
    if (value && value.length > 0) {
      return;
    }

    // Call AI API to generate tags
    const generateAITags = async () => {
      try {
        const response = await fetch("/api/ai/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ venueData }),
        });

        const data = await response.json();

        if (response.ok && data.tags && data.tags.length > 0) {
          setSuggestedTags(data.tags);
          onChange(set(data.tags));
        } else {
          // Fallback to basic tags if AI fails
          const fallbackTags = ["restaurant", "bar", "cafe"];
          setSuggestedTags(fallbackTags);
          onChange(set(fallbackTags));
        }
      } catch (error) {
        console.error("AI tag generation failed:", error);
        const fallbackTags = ["restaurant", "bar", "cafe"];
        setSuggestedTags(fallbackTags);
        onChange(set(fallbackTags));
      }
    };

    generateAITags();

    // Match based on Google Place types
    venueTypes.forEach((type) => {
      const normalizedType = type.toLowerCase();

      // Food-related
      if (normalizedType.includes("restaurant")) suggestions.add("restaurant");
      if (normalizedType.includes("cafe")) suggestions.add("cafe");
      if (normalizedType.includes("bar")) suggestions.add("bar");
      if (normalizedType.includes("bakery")) suggestions.add("bakery");
      if (normalizedType.includes("meal_takeaway")) suggestions.add("takeaway");
      if (normalizedType.includes("meal_delivery")) suggestions.add("delivery");

      // Beverage-related
      if (normalizedType.includes("night_club"))
        suggestions.add("cocktail-bar");
      if (normalizedType.includes("liquor_store")) suggestions.add("wine-bar");
    });

    // Analyze name and description for additional tags
    Object.entries(TAG_CATEGORIES).forEach(([category, tags]) => {
      tags.forEach((tag) => {
        const tagPattern = tag.replace(/-/g, "[ -]?");
        if (combinedText.match(new RegExp(tagPattern, "i"))) {
          suggestions.add(tag);
        }
      });
    });

    // Add some smart defaults based on patterns
    if (combinedText.includes("pizza")) suggestions.add("pizzeria");
    if (combinedText.includes("wine")) suggestions.add("wine-bar");
    if (combinedText.includes("coffee")) suggestions.add("coffee-shop");
    if (combinedText.includes("beer")) suggestions.add("beer-garden");
    if (combinedText.includes("cocktail")) suggestions.add("cocktail-bar");
    if (combinedText.includes("vegan")) suggestions.add("vegan");
    if (combinedText.includes("vegetarian")) suggestions.add("vegetarian");
    if (combinedText.includes("outdoor")) suggestions.add("outdoor-seating");
    if (combinedText.includes("family")) suggestions.add("family-friendly");

    // Cuisine detection
    const cuisines = [
      "italian",
      "french",
      "japanese",
      "chinese",
      "indian",
      "mexican",
      "mediterranean",
      "asian",
      "american",
      "swiss",
    ];
    cuisines.forEach((cuisine) => {
      if (combinedText.includes(cuisine)) suggestions.add(cuisine);
    });

    // Convert to array, sort, and auto-apply
    const suggestionsArray = Array.from(suggestions).sort();

    if (suggestionsArray.length === 0) {
      suggestionsArray.push("restaurant", "bar", "cafe");
    }

    setSuggestedTags(suggestionsArray);

    // Auto-apply the generated tags ONLY ONCE
    onChange(set(suggestionsArray));
  }, [venueData?.placeId]); // Only depend on placeId to run once per venue

  // Toggle tag selection
  const toggleTag = useCallback(
    (tag) => {
      const currentTags = value || [];
      let newTags;
      if (currentTags.includes(tag)) {
        newTags = currentTags.filter((t) => t !== tag);
      } else {
        newTags = [...currentTags, tag];
      }
      onChange(set(newTags));
    },
    [value, onChange]
  );

  // Add custom tag
  const [customTag, setCustomTag] = useState("");
  const addCustomTag = useCallback(() => {
    const currentTags = value || [];
    if (customTag.trim() && !currentTags.includes(customTag.trim())) {
      const newTags = [...currentTags, customTag.trim()];
      onChange(set(newTags));
      setCustomTag("");
    }
  }, [customTag, value, onChange]);

  return (
    <Stack space={4}>
      <Card padding={4} border>
        <Stack space={3}>
          <Text weight="semibold" size={1}>
            Add Custom Tag:
          </Text>
          <Flex gap={2}>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="Type a custom tag..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <Button
              onClick={addCustomTag}
              disabled={!customTag.trim()}
              text="Add"
              tone="primary"
            />
          </Flex>
        </Stack>
      </Card>

      {suggestedTags.length > 0 && (
        <Card padding={4} tone="primary" border>
          <Stack space={3}>
            <Text weight="semibold" size={1}>
              AI-Generated Tags (auto-applied, click to remove):
            </Text>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              {suggestedTags.map((tag) => (
                <Flex key={tag} align="center" gap={2}>
                  <Checkbox
                    checked={(value || []).includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  <Text size={1}>{tag}</Text>
                </Flex>
              ))}
            </Box>
          </Stack>
        </Card>
      )}

      {value && value.length > 0 && (
        <Card padding={4} tone="positive">
          <Stack space={3}>
            <Text weight="semibold" size={1}>
              Active Tags ({value.length}):
            </Text>
            <Flex wrap="wrap" gap={2}>
              {value.map((tag) => (
                <Card
                  key={tag}
                  padding={2}
                  tone="primary"
                  radius={2}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleTag(tag)}
                >
                  <Flex align="center" gap={2}>
                    <Text size={1}>{tag}</Text>
                    <Text size={1}>✕</Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
