import React from "react";
import { useSelector } from "react-redux";
import Tag from "../../components/Tag/Tag";
import styles from "./Home.module.scss";
import { selectTopBeers, selectTopTags } from "./homeSlice";

export function Home() {
  const topBeers = useSelector(selectTopBeers);
  const topTags = useSelector(selectTopTags);

  return (
    <div>
      <h2>Top Tags</h2>
      <div className={styles.tags}>
        {topTags.map(tag => (
          <Tag key={tag.name} name={tag.name} />
        ))}
      </div>

      <h2>Top Beers</h2>
      <div className={styles.tags}>
        {topBeers.map(beer => (
          <Tag key={beer.name} name={beer.name} />
        ))}
      </div>
    </div>
  );
}
