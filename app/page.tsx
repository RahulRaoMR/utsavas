import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import TopNavBar from "./components/TopNavBar";
import VenuesSection from "./components/VenuesSection";
import ServicesSection from "./components/ServicesSection";
import EventGallery from "./components/EventGallery";
import Footer from "./components/Footer";
import SeoSearchLinks from "./components/SeoSearchLinks";
import { buildHomeMetadata, buildHomepageJsonLd } from "../lib/seo";

export const metadata = buildHomeMetadata();

const homepageJsonLd = buildHomepageJsonLd();

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <TopNavBar />
      <Hero />
      <SeoSearchLinks />
      <ServicesSection />
      <AboutSection />
      <VenuesSection />
      <EventGallery />
      <Footer />
    </>
  );
}
