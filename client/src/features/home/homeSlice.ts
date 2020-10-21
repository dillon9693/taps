import { RootState } from "../../app/store";
import { createSlice } from "@reduxjs/toolkit";

interface Beer {
  name: string;
}

interface Tag {
  name: string;
}

interface HomeState {
  topBeers: Beer[];
  topTags: Tag[];
}

const mockBeerNames = ["Sip of Sunshine", "Heady Topper", "Whirlpool"];
const mockTagNames = [
  "summer",
  "hoppy",
  "cold",
  "skiing",
  "malty",
  "beach",
  "light"
];

const initialState: HomeState = {
  topBeers: mockBeerNames.map(name => ({ name })),
  topTags: mockTagNames.map(name => ({ name }))
};

export const homeSlice = createSlice({
  name: "topBeers",
  initialState,
  reducers: {
    //
  }
});

export const selectTopBeers = (state: RootState) => state.home.topBeers;
export const selectTopTags = (state: RootState) => state.home.topTags;

export default homeSlice.reducer;
