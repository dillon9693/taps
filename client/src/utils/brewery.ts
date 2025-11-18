import type { BreweryInfo } from "../types";

export default function formatBreweryLocation(brewery: BreweryInfo): string {
  // Prefer new fields if available, fallback to deprecated location field
  if (brewery.city && brewery.stateProvince) {
    return `${brewery.city}, ${brewery.stateProvince}`;
  }
  return brewery.location || "";
}
