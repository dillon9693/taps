import React, { useEffect, useState } from "react";

import { Beer, getBeers } from "../services/beerService";

import BeerLogo from "../images/beer.svg";
import "./Home.css";

export default function Home() {
  const [beers, setBeers] = useState<Beer[]>([]);

  useEffect(() => {
    getBeers().then((beersResult) => setBeers(beersResult));
  }, []);

  return (
    <main className="Home">
      <h2>Home</h2>

      <div className="beer-wrapper">
        {beers.map((beer) => (
          <div className="beer-card" key={beer.id}>
            {beer.name}
            <img src={BeerLogo} alt={`beer ${beer.id}`} />
            {beer.brewery}
          </div>
        ))}
      </div>
    </main>
  );
}
