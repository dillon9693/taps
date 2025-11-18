// Base brewery information used in beer contexts
export interface BreweryInfo {
  id: string;
  name: string;
  city?: string;
  stateProvince?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  country?: string;
  longitude?: number;
  latitude?: number;
  phone?: string;
  description?: string;
  yearFounded?: number;
  website?: string;
  beerCount?: number;
  // Deprecated: Use city and stateProvince instead
  location?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface TagWithVotes {
  tagId: string;
  tagName: string;
  upvoteCount: number;
  downvoteCount: number;
  currentUserVote: boolean | null; // null indicates user has not voted yet
}

export function isTag(tag: Tag | TagWithVotes): tag is Tag {
  return "id" in tag && "name" in tag;
}

export function isTagWithVotes(tag: Tag | TagWithVotes): tag is TagWithVotes {
  return "tagId" in tag && "tagName" in tag;
}

export function toNormalizedTag(tag: Tag | TagWithVotes): Tag {
  if (isTagWithVotes(tag)) {
    return { id: tag.tagId, name: tag.tagName };
  }

  if (isTag(tag)) {
    return tag;
  }

  throw new Error("Unexpected type");
}

// Base beer information
export interface BeerSummary {
  id: string;
  name: string;
  style: string;
  styleDisplay: string;
  abv: number;
  ibu: number | null;
  averageRating: number;
  imageUrl: string;
  description: string;
  isSaved: boolean;
  tags: Tag[];
  tagsWithVotes: TagWithVotes[];
}

// Full brewery details for brewery detail page
export interface Brewery extends BreweryInfo {
  beers?: BeerSummary[];
}

// Full beer details for beer contexts
export interface Beer extends BeerSummary {
  brewery: BreweryInfo;
}
