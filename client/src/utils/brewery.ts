export default function formatBreweryLocation(
  city?: string,
  stateProvince?: string,
  location?: string,
): string {
  // Prefer new fields if available, fallback to deprecated location field
  if (city && stateProvince) {
    return `${city}, ${stateProvince}`;
  }
  return location || "";
}
