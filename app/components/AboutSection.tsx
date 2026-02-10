import styles from "./AboutSection.module.css";

export default function AboutSection() {
  return (
    <section className={styles.about}>
      <div className={styles.left}>
        <img
          src="/images/about-utsavam.jpg"
          alt="UTSAVAM Event Spaces Bangalore"
        />
      </div>

      <div className={styles.right}>
        <h2 className={styles.title}>
  Welcome to <br /> UTSAVAS Event Spaces
</h2>


        <p>
          UTSAVAS is one of Bangalore’s most elegant and thoughtfully designed
          event destinations, created to host celebrations that deserve
          grandeur, beauty, and flawless execution.
        </p>

        <p>
          From luxurious weddings and grand receptions to corporate events and
          private celebrations, UTSAVAS offers a collection of premium indoor
          and outdoor venues crafted to suit every occasion.
        </p>

        <p>
          Surrounded by serene landscapes, refined architecture, and modern
          amenities, every space at UTSAVAS is designed to transform your
          special moments into timeless memories.
        </p>
      </div>
    </section>
  );
}
