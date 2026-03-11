import styles from "./EventGallery.module.css";

const galleryItems = [
  { src: "/gallery/g1.jpg", label: "Wedding Grandeur", shape: "medium" },
  { src: "/gallery/g2.jpg", label: "Open Air Elegance", shape: "large" },
  { src: "/gallery/g3.jpg", label: "Floral Styling", shape: "tall" },
  { src: "/gallery/g4.jpg", label: "Celebration Evenings", shape: "medium" },
  { src: "/gallery/g5.jpg", label: "Sacred Moments", shape: "tall" },
  { src: "/gallery/g6.jpg", label: "Table Details", shape: "medium" },
  { src: "/gallery/g7.jpg", label: "Cocktail Hour", shape: "medium" },
  { src: "/gallery/g8.jpg", label: "Color Palette", shape: "small" },
  { src: "/gallery/g9.jpg", label: "Portrait Frame", shape: "medium" },
  { src: "/gallery/g10.jpg", label: "Evening Lights", shape: "small" },
  { src: "/gallery/g11.jpg", label: "Guest Experience", shape: "medium" },
  { src: "/gallery/g12.jpg", label: "Stage Craft", shape: "small" },
];

const carouselItems = [
  { src: "/gallery/g13.jpg", label: "Venue Atmosphere" },
  { src: "/gallery/g14.jpg", label: "Dining Layout" },
  { src: "/gallery/g15.jpg", label: "Decor Styling" },
  { src: "/gallery/g16.jpg", label: "Ceremony Details" },
  { src: "/gallery/g17.jpg", label: "Night Ambience" },
  { src: "/gallery/g18.jpg", label: "Private Events" },
];

export default function EventGallery() {
  return (
    <section className={styles.gallery}>
      <div className={styles.header}>
        <span className={styles.subtitle}>SEE THE MAGIC OF UTSAVAS IN MOTION</span>
        <h2>Event Gallery from utsavas</h2>
        <p className={styles.desc}>
          A richer visual look at weddings, receptions, private parties, and
          curated venue styling across utsavas.
        </p>
      </div>

      <div className={styles.galleryGrid}>
        {galleryItems.map((item) => (
          <figure
            key={item.src}
            className={`${styles.card} ${styles[item.shape]}`}
          >
            <img src={item.src} alt={item.label} />
          </figure>
        ))}
      </div>

      <div className={styles.carouselSection}>
        <div className={styles.carouselHeader}>
          <span>More moments from utsavas</span>
        </div>

        <div className={styles.carouselViewport}>
          <div className={styles.carouselTrack}>
            {[...carouselItems, ...carouselItems].map((item, index) => (
              <figure key={`${item.src}-${index}`} className={styles.carouselCard}>
                <img src={item.src} alt={item.label} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
