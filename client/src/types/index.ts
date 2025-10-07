// Base brewery information used in beer contexts
export interface BreweryInfo {
  id: string;
  name: string;
  location: string;
  description?: string;
  yearFounded?: number;
  website?: string;
  beerCount?: number;
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
