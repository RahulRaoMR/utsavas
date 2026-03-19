"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./halldetail.css";
import { getApiBaseUrl } from "../../../../lib/api";
import { toAbsoluteImageUrl } from "../../../../lib/imageUrl";
import { buildVenueMapUrls } from "../../../../lib/hallLocation";

export default function HallDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchHall = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/halls/${id}`);
        const data = await res.json();
        setHall(data);
      } catch (err) {
        console.error("Failed to load hall details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id]);

  const formatFeatureLabel = (key) => {
    const labels = {
      diningHall: "Dining Hall",
      stage: "Stage",
      powerBackup: "Power Backup",
      airConditioning: "Air Conditioning",
      nonAcHall: "Non-AC Hall",
      outsideFoodAllowed: "Outside Food Allowed",
      outsideDecoratorsAllowed: "Outside Decorators Allowed",
      outsideDjAllowed: "Outside DJ Allowed",
      ac: "Air Conditioning",
      nonAc: "Non-AC Hall",
      outsideFood: "Outside Food Allowed",
      outsideDecorators: "Outside Decorators Allowed",
      outsideDJ: "Outside DJ Allowed",
      alcoholAllowed: "Alcohol Allowed",
      valetParking: "Valet Parking",
      parking: "Parking",
      restaurant: "Restaurant",
      roomService: "Room Service",
      frontDesk24: "24-hour Front Desk",
      fitnessCentre: "Fitness Centre",
      fitnessCenter: "Fitness Center",
      nonSmokingRooms: "Non-smoking Rooms",
      spaWellness: "Spa & Wellness Centre",
      freeWifi: "Free WiFi",
      evCharging: "EV Charging Station",
      liquorLicense: "Liquor License",
      hotTub: "Hot Tub / Jacuzzi",
      evChargingStation: "EV Charging Station",
      swimmingPool: "Swimming Pool",
      selfCatering: "Self Catering",
      breakfastIncluded: "Breakfast Included",
      allMealsIncluded: "All Meals Included",
      breakfastDinnerIncluded: "Breakfast & Dinner Included",
      bonfireIncluded: "Bonfire Included",
      privateDiningIncluded: "Private Dining Included",
      freeCancellation: "Free Cancellation",
      catering: "Catering",
      inhouseStaffAllowed: "Inhouse Staff Allowed",
      shuttleAvailable: "Shuttle Available",
      indoorVenue: "Indoor Venue",
      danceFloor: "Dance Floor",
      smokingRoom: "Smoking Room",
      ageOfBookingGuests: "Age of Booking Guests Policy",
      nearWifi: "Near Wi-Fi",
      wheelchairAccessible: "Wheelchair Accessible",
      cctvCoverage: "CCTV Coverage",
      minibarIncluded: "Minibar Included",
      acceptsOnlinePayments: "Accepts Online Payments",
      airportShuttle: "Airport Shuttle",
    };

    return labels[key] || key.replace(/([A-Z])/g, " $1").trim();
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading hall details...</p>;
  }

  if (!hall) {
    return <p style={{ padding: 20 }}>Hall not found</p>;
  }

  const images =
    hall.images && hall.images.length > 0
      ? hall.images.map((img) => toAbsoluteImageUrl(img))
      : [];

  const featureDisplayOrder = [
    "diningHall",
    "stage",
    "powerBackup",
    "airConditioning",
    "nonAcHall",
    "outsideFoodAllowed",
    "outsideDecoratorsAllowed",
    "outsideDjAllowed",
    "alcoholAllowed",
    "valetParking",
    "parking",
    "restaurant",
    "roomService",
    "frontDesk24",
    "fitnessCentre",
    "fitnessCenter",
    "nonSmokingRooms",
    "airportShuttle",
    "spaWellness",
    "hotTub",
    "freeWifi",
    "evCharging",
    "evChargingStation",
    "wheelchairAccessible",
    "swimmingPool",
    "selfCatering",
    "breakfastIncluded",
    "allMealsIncluded",
    "breakfastDinnerIncluded",
    "acceptsOnlinePayments",
    "freeCancellation",
  ];

  const activeFeatures = hall.features
    ? Object.entries(hall.features).filter(
        ([_, v]) => v === true || v === "true" || v === 1
      )
    : [];
  const orderedFeatureKeys = [
    ...featureDisplayOrder.filter((key) =>
      activeFeatures.some(([featureKey]) => featureKey === key)
    ),
    ...activeFeatures
      .map(([key]) => key)
      .filter((key) => !featureDisplayOrder.includes(key)),
  ];

  const pricePerEvent = Number(hall.pricePerEvent || 0);
  const pricePerDay = Number(hall.pricePerDay || 0);
  const pricePerPlate = Number(hall.pricePerPlate || 0);
  const icons = {
    location: "\uD83D\uDCCD",
    capacity: "\uD83D\uDC65",
    parking: "\uD83D\uDE97",
    rooms: "\uD83D\uDECF",
    phone: "\uD83D\uDCDE",
    check: "\u2714",
  };
  const { fullAddress, mapEmbedUrl, directionsUrl } = buildVenueMapUrls({
    hallName: hall.hallName,
    address: hall.address,
    location: hall.location,
  });
  const offeringCards = [
    {
      key: "discover-wedding-venues",
      title: "\uD83C\uDFDB\uFE0F Discover Wedding Venues",
    },
    {
      key: "explore-decoration-themes",
      title: "\uD83C\uDFA8 Explore Decoration Themes",
    },
    {
      key: "check-venue-availability",
      title: "\uD83D\uDCC5 Check Venue Availability",
    },
    {
      key: "compare-pricing-capacity",
      title: "\uD83D\uDCB0 Compare Pricing & Capacity",
    },
    {
      key: "view-real-venue-photos",
      title: "\uD83D\uDCF8 View Real Venue Photos",
    },
    {
      key: "entertainment-options",
      title: "\uD83C\uDFB5 Entertainment Options",
    },
    {
      key: "parking-facilities",
      title: "\uD83D\uDE97 Parking & Facilities",
    },
    {
      key: "makeup-artists",
      title: "\uD83D\uDC84 Makeup Artists",
    },
    {
      key: "mehndi",
      title: "\uD83C\uDF3F Mehndi",
    },
    {
      key: "bridal-wear",
      title: "\uD83D\uDC57 Bridal Wear",
    },
    {
      key: "quick-booking-requests",
      title: "\u26A1 Quick Booking Requests",
    },
  ];

  const handleBookNow = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const user =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token || !user) {
      if (token && !user) {
        localStorage.removeItem("token");
      }
      const target = `/booking/${hall._id}`;
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    router.push(`/booking/${hall._id}`);
  };

  return (
    <div className="hall-detail-page hall-detail-spacing">
      <div className="hall-top">
        <div className="hall-images">
          {images.length > 0 ? (
            <img
              src={images[activeImage]}
              alt={hall.hallName}
              className="main-image"
            />
          ) : (
            <div className="no-image">No images uploaded</div>
          )}

          {images.length > 1 && (
            <div className="thumbs">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  className={i === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hall-info">
          <h1 className="hall-name">{hall.hallName}</h1>

          <p className="location">{`${icons.location} ${hall.address?.area || ""}, ${hall.address?.city || ""}`}</p>

          <p className="location">
            {hall.address?.flat ? `${hall.address.flat}, ` : ""}
            {hall.address?.floor ? `${hall.address.floor}, ` : ""}
            {hall.address?.state ? `${hall.address.state} - ` : ""}
            {hall.address?.pincode || ""}
            {hall.address?.landmark ? ` (${hall.address.landmark})` : ""}
          </p>

          <div className="price-block">
            {pricePerEvent > 0 && (
                <h2 className="price">
                {"\u20B9"}
                {pricePerEvent.toLocaleString()}
                <span> per event</span>
              </h2>
            )}

            {pricePerDay > 0 && (
              <h2 className="price secondary">
                {"\u20B9"}
                {pricePerDay.toLocaleString()}
                <span> per day</span>
              </h2>
            )}

            {pricePerPlate > 0 && (
              <h2 className="price secondary">
                {"\u20B9"}
                {pricePerPlate.toLocaleString()}
                <span> per plate</span>
              </h2>
            )}

            {pricePerEvent === 0 &&
              pricePerDay === 0 &&
              pricePerPlate === 0 && <h2 className="price">{"\u20B9"}N/A</h2>}
          </div>

          <div className="meta">
            <span>{`${icons.capacity} ${hall.capacity || "N/A"} Capacity`}</span>
            <span>{`${icons.parking} ${hall.parkingCapacity || "N/A"} Parking`}</span>
            {hall.rooms ? <span>{`${icons.rooms} ${hall.rooms} Rooms`}</span> : null}
          </div>

          {hall.vendor?.phone && (
            <button
              className="contact-btn"
              onClick={() => alert(`${icons.phone} Phone Number: ${hall.vendor.phone}`)}
            >
              View phone number
            </button>
          )}
        </div>
      </div>

        {activeFeatures.length > 0 && (
          <section className="hall-section">
            <h3>What this place has to offer</h3>
            <ul className="feature-list">
              {orderedFeatureKeys.map((key) => (
              <li key={key}>
                <span className="feature-dot" aria-hidden="true"></span>
                <span>{formatFeatureLabel(key)}</span>
              </li>
              ))}
            </ul>
          </section>
        )}

      {hall.about && (
        <section className="hall-section">
          <h3>Other Information</h3>
          <p>{hall.about}</p>
        </section>
      )}

      <section className="hall-section map-section">
        <div className="map-copy">
          <h3>Location & Directions</h3>
          <p>
            Find the venue quickly, preview the exact location on the map, and
            open turn-by-turn directions in Google Maps.
          </p>
          <div className="map-address-card">
            <strong>{hall.hallName}</strong>
            <span>{fullAddress || "Address unavailable"}</span>
          </div>
          <a
            href={directionsUrl}
            className="directions-btn"
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </div>

        <div className="map-frame-wrap">
          <iframe
            title={`${hall.hallName} location map`}
            src={mapEmbedUrl}
            className="map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <div className="hall-actions">
        <button className="back-btn" onClick={() => router.back()}>
          {"\u2190"} Back
        </button>

        <button
          className="book-btn"
          onClick={handleBookNow}
        >
          Book Now
        </button>
      </div>

        {offeringCards.length > 0 && (
          <section className="hall-section info-showcase">
          <h3>What We Offer</h3>
            <div className="offer-card-grid">
              {offeringCards.map((item) => (
                <article key={item.key} className="offer-card">
                  <h4>{item.title}</h4>
                </article>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
