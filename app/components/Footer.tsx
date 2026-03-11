"use client";

import styles from "./Footer.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="4"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M10 9.2L15.4 12L10 14.8V9.2Z" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 4L19 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 4L5 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M13.5 20V12.8H16.3L16.7 9.8H13.5V7.9C13.5 7 13.9 6.4 15.2 6.4H16.8V3.7C16.5 3.7 15.6 3.6 14.5 3.6C12 3.6 10.4 5.1 10.4 7.8V9.8H8V12.8H10.4V20H13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Footer() {
  const router = useRouter();

  const handleRedirect = (path: string) => {
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");

    if (token) {
      router.push(path);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <Image
            src="/logo/utsavaa-gold.png"
            alt="Utsavas Logo"
            width={160}
            height={160}
          />

          <h4>Best Event Venue in Bangalore</h4>

          <p>
            Utsavas brings together nature, elegance, and hospitality to create
            unforgettable spaces for life&apos;s most cherished moments.
          </p>
        </div>

        <div className={styles.links}>
          <h5>Quick Links</h5>
          <ul>
            <li onClick={() => handleRedirect("/")}>Home</li>
            <li onClick={() => handleRedirect("/dashboard")}>Venues</li>
            <li onClick={() => handleRedirect("/dashboard")}>Amenities</li>
            <li onClick={() => handleRedirect("/services")}>Events</li>
            <li onClick={() => handleRedirect("/faqs")}>FAQs</li>
            <li onClick={() => handleRedirect("/services")}>Contact Us</li>
          </ul>
        </div>

        <div className={styles.contact}>
          <Link href="/contact" className={styles.contactTitleLink}>
            <h5>Get in Touch</h5>
          </Link>

          <p>
            Email{" "}
            <Link href="/contact" className={styles.contactLink}>
              utsavas26@gmail.com
            </Link>
          </p>

          <p>
            Call{" "}
            <Link href="/contact" className={styles.contactLink}>
              +91 1234567890
            </Link>
          </p>

          <p>
            285/A, 14th Main Rd, Siddanna Layout, Banashankari Stage II,
            Banashankari, Bengaluru, Karnataka 560070
          </p>

          <h5 className={styles.socialTitle}>Social Links</h5>
          <div className={styles.socials}>
            <a
              href="https://www.instagram.com/utsavas?igsh=OWliZDVxMjVvOGJ0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://www.youtube.com/channel/UCvnp8ihWb7QzbDASj8AKyyQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <YouTubeIcon />
            </a>

            <a
              href="https://x.com/utsavas26"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <XIcon />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61587886567668"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerTagline}>
          Utsavas.com is part of TALME Technologies Pvt Ltd, Where Every Utsavam
          Becomes a Beautiful Memory
        </p>

        <p className={styles.footerCopy}>
          Copyright (c) 2012-2026 Talme.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
