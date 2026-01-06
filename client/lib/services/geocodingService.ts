/**
 * Google Maps Geocoding Service
 * Provides address validation, autocomplete, and coordinate lookup
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = "https://maps.googleapis.com/maps/api/place";
const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId?: string;
}

interface PlacesAutocompleteResult {
  predictions: Array<{
    description: string;
    place_id: string;
    main_text: string;
    secondary_text?: string;
  }>;
}

/**
 * Get coordinates from an address
 */
export const geocodeAddress = async (
  address: string,
): Promise<GeocodeResult | null> => {
  if (!address || address.trim().length === 0) {
    return null;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&region=au`,
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No geocoding results found for:", address);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry?.location;

    if (!location) {
      console.error("No location data in geocoding result");
      return null;
    }

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Get address predictions from partial input (autocomplete)
 */
export const getAddressPredictions = async (
  input: string,
): Promise<PlacesAutocompleteResult["predictions"] | []> => {
  if (!input || input.trim().length < 3) {
    return [];
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key not configured");
    return [];
  }

  try {
    const response = await fetch(
      `${PLACES_API_URL}/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&region=au&components=country:au`,
    );

    if (!response.ok) {
      console.error("Autocomplete API error:", response.status);
      return [];
    }

    const data: PlacesAutocompleteResult = await response.json();

    if (!data.predictions) {
      return [];
    }

    return data.predictions.map((prediction) => ({
      description: prediction.description,
      place_id: prediction.place_id,
      main_text: prediction.main_text,
      secondary_text: prediction.secondary_text,
    }));
  } catch (error) {
    console.error("Autocomplete error:", error);
    return [];
  }
};

/**
 * Get place details from place ID
 */
export const getPlaceDetails = async (
  placeId: string,
): Promise<GeocodeResult | null> => {
  if (!placeId) {
    return null;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${PLACES_API_URL}/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`,
    );

    if (!response.ok) {
      console.error("Place details API error:", response.status);
      return null;
    }

    const data = await response.json();
    const result = data.result;

    if (!result || !result.geometry) {
      console.error("No geometry data in place details");
      return null;
    }

    const location = result.geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      placeId: placeId,
    };
  } catch (error) {
    console.error("Place details error:", error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  if (!latitude || !longitude) {
    return null;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn("Google Maps API key not configured");
    return null;
  }

  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No reverse geocoding results found");
      return null;
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

/**
 * Validate and normalize an Australian address
 */
export const validateAustralianAddress = async (
  address: string,
): Promise<{ valid: boolean; normalized?: string; coordinates?: GeocodeResult }> => {
  if (!address || address.trim().length === 0) {
    return { valid: false };
  }

  try {
    // Try to geocode the address
    const result = await geocodeAddress(address);

    if (!result) {
      return { valid: false };
    }

    // Check if address is in Australia (rough validation by checking for AU in formatted address)
    if (!result.formattedAddress.toUpperCase().includes("AUSTRALIA")) {
      console.warn("Address does not appear to be in Australia:", address);
      return { valid: false };
    }

    return {
      valid: true,
      normalized: result.formattedAddress,
      coordinates: result,
    };
  } catch (error) {
    console.error("Address validation error:", error);
    return { valid: false };
  }
};

export const geocodingService = {
  geocodeAddress,
  getAddressPredictions,
  getPlaceDetails,
  reverseGeocode,
  validateAustralianAddress,
};
