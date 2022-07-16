import axios from "axios";

export type Beer = {
  id: number;
  name: string;
  brewery: string;
}

export const getBeers = () => axios.get("beers.json").then(res => res.data)
