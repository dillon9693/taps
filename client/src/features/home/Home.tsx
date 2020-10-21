import React from "react";
import { useSelector } from "react-redux";
import { selectTopBeers, selectTopTags } from "./homeSlice";

export function Home() {
  const topBeers = useSelector(selectTopBeers);
  const topTags = useSelector(selectTopTags);

  return (
    <div>
      <h2>Top Tags</h2>
      <div>
        {topTags.map(beer => (
          <div>{beer.name}</div>
        ))}
      </div>

      <h2>Top Beers</h2>
      <div>
        {topBeers.map(beer => (
          <div>{beer.name}</div>
        ))}
      </div>
    </div>
  );
}
