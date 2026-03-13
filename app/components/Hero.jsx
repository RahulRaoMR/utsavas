"use client";

import styles from "./Hero.module.css";
import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className={styles.heroGlow}></div>

      <div className={styles.content}>
        <div className={styles.eyebrow}>Events and venue booking made simple</div>
        <h1>UTSAVAS</h1>
        <p>WHERE UTSAVAS BECOME MEMORIES</p>
        <p>CRAFTED FOR CELEBRATIONS | DISCOVER THE PERFECT VENUE</p>
        <SearchBar />
      </div>
    </section>
  );
}
