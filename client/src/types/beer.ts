export interface Beer {
  id: string;
  name: string;
  brewery: {
    name: string;
    location: string;
  };
  style: string;
  styleDisplay: string;
  abv: number;
  ibu: number | null;
  description: string;
  averageRating: number;
  imageUrl: string;
  tags: { name: string }[];
}
