import React, { useEffect, useState } from "react";

import { Beer, getBeers } from "../services/beerService";

export default function Home() {
  const [beers, setBeers] = useState<Beer[]>([]);

  useEffect(() => {
    getBeers().then((beersResult) => setBeers(beersResult));
  }, []);

  return (
    <main>
      <h2>Home</h2>
      <ol>
        {beers.map((beer) => (
          <li key={beer.id}>{beer.name}</li>
        ))}
      </ol>
    </main>
  );
}
