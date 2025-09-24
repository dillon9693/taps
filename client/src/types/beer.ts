export interface Brewery {
  id: string;
  name: string;
  location: string;
  description?: string;
  yearFounded?: number;
  website?: string;
  beerCount?: number;
  beers?: Beer[];
}

export interface Beer {
  id: string;
  name: string;
  brewery: Brewery;
  style: string;
  styleDisplay: string;
  abv: number;
  ibu: number | null;
  description: string;
  averageRating: number;
  imageUrl: string;
  tags: { name: string }[];
}
