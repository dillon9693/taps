import React from "react";

import styles from "./Tag.module.scss";

interface TagProps {
  name: string;
}

const Tag = ({ name }: TagProps) => {
  return (
    <div className={styles.tag}>
      <div className={styles.tagName}>{name}</div>
    </div>
  );
};

export default Tag;
