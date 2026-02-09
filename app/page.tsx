
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import TopNavBar from "./components/TopNavBar";
import VenuesSection from "./components/VenuesSection";
import ServicesSection from "./components/ServicesSection";
import EventGallery from "./components/EventGallery";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <>
       <TopNavBar />
      
      <Hero />
      <AboutSection />
      <VenuesSection /> 
      <ServicesSection />
       <EventGallery /> 
        <Footer />

    </>
  );
}
