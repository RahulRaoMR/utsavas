import styles from "./EventGallery.module.css";

const images = [
  "/gallery/g1.jpg",
  "/gallery/g2.jpg",
  "/gallery/g3.jpg",
  "/gallery/g4.jpg",
  "/gallery/g5.jpg",
  "/gallery/g6.jpg",
  "/gallery/g7.jpg",
  "/gallery/g8.jpg",
  "/gallery/g9.jpg",
  "/gallery/g10.jpg",
  "/gallery/g11.jpg",
  "/gallery/g12.jpg",
  "/gallery/g13.jpg",
  "/gallery/g14.jpg",
  "/gallery/g15.jpg",
  "/gallery/g16.jpg",
  "/gallery/g17.jpg",
  "/gallery/g18.jpg",
  "/gallery/g19.jpg",
  "/gallery/g20.jpg",
  "/gallery/g21.jpg",
  "/gallery/g22.jpg",
  "/gallery/g23.jpg",
];

export default function EventGallery() {
  return (
    <section className={styles.gallery}>
      <span className={styles.subtitle}>
        SEE THE MAGIC OF UTSAVAS IN MOTION
      </span>

      <h2>Event Gallery from utsavas</h2>

      <p className={styles.desc}>
        Every celebration hosted at utsavas tells a unique story. Our gallery is
        a collection of these beautiful moments — grand weddings under the
        stars, refined corporate gatherings, and joyful birthday soirees brought
        to life in our versatile spaces.
      </p>

      <div className={styles.grid}>
        {images.map((img, index) => (
          <div key={index} className={styles.item}>
            <img src={img} alt={`Utsavam Event ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
