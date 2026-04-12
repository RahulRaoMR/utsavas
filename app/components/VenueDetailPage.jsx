"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiBaseUrl } from "../../lib/api";
import {
  markHallAnalyticsEventTracked,
  shouldTrackHallAnalyticsEvent,
  trackHallPhoneView,
} from "../../lib/hallAnalytics";
import { toAbsoluteImageUrl } from "../../lib/imageUrl";
import { buildVenueMapUrls } from "../../lib/hallLocation";
import { addHallToCart, isHallInCart } from "../../lib/cart";
import chatStyles from "./VenueChat.module.css";

const getChatSessionKey = (hallId) => `utsavas_hall_chat_${hallId}`;

const parseStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getStoredUserToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("token") || "";
};

export default function VenueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const chatBottomRef = useRef(null);
  const reviewFormRef = useRef(null);

  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [chatConversation, setChatConversation] = useState(null);
  const [chatAccessToken, setChatAccessToken] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSubmitting, setChatSubmitting] = useState(false);
  const [chatError, setChatError] = useState("");
  const [hallInCart, setHallInCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [chatReplyDraft, setChatReplyDraft] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    reviewerEmail: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (!id) return;

    const fetchHall = async () => {
      try {
        const shouldTrackView = shouldTrackHallAnalyticsEvent(id, "view");
        const url = `${getApiBaseUrl()}/api/halls/${id}${
          shouldTrackView ? "?trackView=true" : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();
        setHall(data);

        if (res.ok && data?._id && shouldTrackView) {
          markHallAnalyticsEventTracked(data._id, "view");
        }
      } catch (err) {
        console.error("Failed to load hall details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id]);

  const loadPublicConversation = useCallback(
    async (accessToken, options = {}) => {
      if (!accessToken || !id) {
        setChatConversation(null);
        return;
      }

      if (!options.silent) {
        setChatLoading(true);
      }

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/chat/public/${accessToken}`,
          {
            cache: "no-store",
          }
        );

        const payload = await response.json();

        if (response.status === 404) {
          localStorage.removeItem(getChatSessionKey(id));
          setChatAccessToken("");
          setChatConversation(null);
          return;
        }

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load chat");
        }

        setChatConversation(payload?.conversation || null);
        setChatError("");
      } catch (error) {
        console.error("Failed to load public venue chat", error);

        if (!options.silent) {
          setChatError("Unable to load the venue chat right now.");
        }
      } finally {
        if (!options.silent) {
          setChatLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    if (!id || typeof window === "undefined") {
      return;
    }

    const storedAccessToken = localStorage.getItem(getChatSessionKey(id)) || "";
    setChatAccessToken(storedAccessToken);

    const storedUser = parseStoredUser();
    const preferredName =
      storedUser?.name ||
      [storedUser?.firstName, storedUser?.lastName].filter(Boolean).join(" ");

    setLeadForm((current) => ({
      ...current,
      name: current.name || preferredName || "",
      phone: current.phone || storedUser?.phone || "",
      email: current.email || storedUser?.email || "",
    }));

    setReviewForm((current) => ({
      ...current,
      reviewerName: current.reviewerName || preferredName || "",
      reviewerEmail: current.reviewerEmail || storedUser?.email || "",
    }));
  }, [id]);

  useEffect(() => {
    if (reviewImages.length === 0) {
      setReviewImagePreviews([]);
      return;
    }

    const previewUrls = reviewImages.map((file) => URL.createObjectURL(file));
    setReviewImagePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [reviewImages]);

  useEffect(() => {
    if (!chatAccessToken) {
      setChatConversation(null);
      setChatLoading(false);
      return;
    }

    loadPublicConversation(chatAccessToken);
  }, [chatAccessToken, loadPublicConversation]);

  useEffect(() => {
    if (!chatAccessToken) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadPublicConversation(chatAccessToken, { silent: true });
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [chatAccessToken, loadPublicConversation]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [chatConversation?.messages?.length]);

  useEffect(() => {
    if (!hall?._id) {
      setHallInCart(false);
      setCartFeedback("");
      return;
    }

    setHallInCart(isHallInCart(hall._id));
  }, [hall?._id]);

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
        ([, v]) => v === true || v === "true" || v === 1
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
  };
  const { fullAddress, mapEmbedUrl, directionsUrl } = buildVenueMapUrls({
    hallName: hall.hallName,
    address: hall.address,
    location: hall.location,
  });

  const offeringCards = [
    { key: "discover-wedding-venues", title: "\uD83C\uDFDB\uFE0F Discover Wedding Venues" },
    { key: "explore-decoration-themes", title: "\uD83C\uDFA8 Explore Decoration Themes" },
    { key: "check-venue-availability", title: "\uD83D\uDCC5 Check Venue Availability" },
    { key: "compare-pricing-capacity", title: "\uD83D\uDCB0 Compare Pricing & Capacity" },
    { key: "view-real-venue-photos", title: "\uD83D\uDCF8 View Real Venue Photos" },
    { key: "entertainment-options", title: "\uD83C\uDFB5 Entertainment Options" },
    { key: "parking-facilities", title: "\uD83D\uDE97 Parking & Facilities" },
    { key: "makeup-artists", title: "\uD83D\uDC84 Makeup Artists" },
    { key: "mehndi", title: "\uD83C\uDF3F Mehndi" },
    { key: "bridal-wear", title: "\uD83D\uDC57 Bridal Wear" },
    { key: "quick-booking-requests", title: "\u26A1 Quick Booking Requests" },
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

  const handleCartAction = () => {
    if (!hall?._id) {
      return;
    }

    if (hallInCart) {
      router.push("/my-cart");
      return;
    }

    const result = addHallToCart(hall);

    setHallInCart(true);
    setCartFeedback(
      result.added
        ? `${hall.hallName || "This venue"} was added to your cart.`
        : `${hall.hallName || "This venue"} is already in your cart.`
    );
  };

  const venueOwnerLabel = hall?.vendor?.businessName || "Venue Owner";
  const venueReplyBadge = hall?.vendor?.isOnline
    ? `${venueOwnerLabel} is online now`
    : hall?.vendor?.autoReplyEnabled
    ? `${venueOwnerLabel} is offline. UTSAVAS Assistant replies instantly`
    : `${venueOwnerLabel} will reply shortly`;

  const reviews = Array.isArray(hall?.reviews)
    ? [...hall.reviews].sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
      )
    : [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
        reviewCount
      : 0;
  const formattedAverageRating = reviewCount > 0 ? averageRating.toFixed(1) : "0.0";
  const highlightedReviewPhotos = reviews
    .flatMap((review) => (Array.isArray(review.photos) ? review.photos : []))
    .slice(0, 6);

  const renderStarIcons = (value) =>
    Array.from({ length: 5 }, (_, index) => (
      <span
        key={`${value}-${index}`}
        className={index < Math.round(value) ? "review-star filled" : "review-star"}
        aria-hidden="true"
      >
        ★
      </span>
    ));

  const handleLeadFieldChange = (field, value) => {
    setLeadForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleReviewFieldChange = (field, value) => {
    setReviewForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleReviewImageChange = (event) => {
    setReviewImages(Array.from(event.target.files || []));
  };

  const openReviewForm = () => {
    setShowReviewForm(true);

    window.setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const handleStartChat = async () => {
    if (!hall?._id) {
      return;
    }

    if (!leadForm.name || !leadForm.phone || !leadForm.message.trim()) {
      setChatError("Please enter your name, phone number, and message.");
      return;
    }

    setChatSubmitting(true);
    setChatError("");

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const userToken = getStoredUserToken();

      if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/chat/start`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          hallId: hall._id,
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          message: leadForm.message,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to start chat");
      }

      if (payload?.accessToken) {
        localStorage.setItem(getChatSessionKey(hall._id), payload.accessToken);
        setChatAccessToken(payload.accessToken);
      }

      setChatConversation(payload?.conversation || null);
      setLeadForm((current) => ({
        ...current,
        message: "",
      }));
      setChatReplyDraft("");
    } catch (error) {
      console.error("Start chat error", error);
      setChatError(error.message || "Unable to start the venue chat right now.");
    } finally {
      setChatSubmitting(false);
    }
  };

  const handleSendChatReply = async () => {
    if (!chatAccessToken || !chatReplyDraft.trim()) {
      return;
    }

    setChatSubmitting(true);
    setChatError("");

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/chat/public/${chatAccessToken}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: chatReplyDraft,
          }),
        }
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to send message");
      }

      setChatConversation(payload?.conversation || null);
      setChatReplyDraft("");
    } catch (error) {
      console.error("Venue chat reply error", error);
      setChatError(error.message || "Unable to send the message right now.");
    } finally {
      setChatSubmitting(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!hall?._id) {
      return;
    }

    if (!reviewForm.reviewerName.trim()) {
      setReviewError("Please enter your name.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewError("Please share your review.");
      return;
    }

    if (!Number.isFinite(Number(reviewForm.rating))) {
      setReviewError("Please choose a rating.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const payload = new FormData();
      payload.append("reviewerName", reviewForm.reviewerName.trim());
      payload.append("reviewerEmail", reviewForm.reviewerEmail.trim());
      payload.append("rating", String(reviewForm.rating));
      payload.append("comment", reviewForm.comment.trim());

      reviewImages.forEach((image) => {
        payload.append("reviewImages", image);
      });

      const response = await fetch(`${getApiBaseUrl()}/api/halls/${hall._id}/reviews`, {
        method: "POST",
        body: payload,
      });

      const payloadResponse = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payloadResponse?.message || "Failed to add review");
      }

      setHall((currentHall) => ({
        ...currentHall,
        reviews: Array.isArray(payloadResponse?.hall?.reviews)
          ? payloadResponse.hall.reviews
          : [
              payloadResponse?.review,
              ...(Array.isArray(currentHall?.reviews) ? currentHall.reviews : []),
            ].filter(Boolean),
      }));
      setReviewSuccess("Thanks for sharing your review.");
      setReviewImages([]);
      setReviewForm((current) => ({
        ...current,
        rating: 5,
        comment: "",
      }));
    } catch (error) {
      console.error("Submit review error", error);
      setReviewError(error.message || "Unable to submit your review right now.");
    } finally {
      setReviewSubmitting(false);
    }
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
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="thumb"
                  className={index === activeImage ? "active" : ""}
                  onClick={() => setActiveImage(index)}
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
              onClick={() => {
                void trackHallPhoneView(hall._id);
                alert(`${icons.phone} Phone Number: ${hall.vendor.phone}`);
              }}
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
          className={`cart-btn ${hallInCart ? "added" : ""}`}
          onClick={handleCartAction}
        >
          {hallInCart ? "Go to Cart" : "Add to Cart"}
        </button>

        <button className="book-btn" onClick={handleBookNow}>
          Book Now
        </button>
      </div>

      {cartFeedback ? <p className="cart-feedback">{cartFeedback}</p> : null}

      <section className={chatStyles.chatSection}>
        <div className={chatStyles.chatHeader}>
          <div>
            <p className={chatStyles.chatEyebrow}>Venue Chat</p>
            <h3 className={chatStyles.chatTitle}>Chat with venue owner</h3>
            <p className={chatStyles.chatCopy}>
              Start a lead instantly from this hall page. Your message is saved
              for the vendor CRM, and admin can also assist when needed.
            </p>
          </div>

          <div
            className={`${chatStyles.chatStatusBadge} ${
              hall?.vendor?.isOnline
                ? chatStyles.chatStatusOnline
                : chatStyles.chatStatusOffline
            }`}
          >
            {venueReplyBadge}
          </div>
        </div>

        {!chatConversation ? (
          <div className={chatStyles.chatStartGrid}>
            <div className={chatStyles.chatLeadCard}>
              <h4>Start your conversation</h4>
              <p>
                Share your details once and the vendor team can continue the
                conversation from their CRM inbox.
              </p>

              <div className={chatStyles.chatFieldGrid}>
                <label className={chatStyles.chatField}>
                  Name
                  <input
                    type="text"
                    value={leadForm.name}
                    onChange={(event) =>
                      handleLeadFieldChange("name", event.target.value)
                    }
                    placeholder="Your full name"
                  />
                </label>

                <label className={chatStyles.chatField}>
                  Phone
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(event) =>
                      handleLeadFieldChange("phone", event.target.value)
                    }
                    placeholder="Your phone number"
                  />
                </label>
              </div>

              <label className={chatStyles.chatField}>
                Email
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(event) =>
                    handleLeadFieldChange("email", event.target.value)
                  }
                  placeholder="Optional email address"
                />
              </label>

              <label className={chatStyles.chatField}>
                Message
                <textarea
                  value={leadForm.message}
                  onChange={(event) =>
                    handleLeadFieldChange("message", event.target.value)
                  }
                  placeholder="Tell the venue your date, guest count, and event type"
                  rows={5}
                />
              </label>

              {chatError ? (
                <p className={chatStyles.chatError}>{chatError}</p>
              ) : null}

              <button
                type="button"
                className={chatStyles.chatPrimaryButton}
                onClick={handleStartChat}
                disabled={chatSubmitting}
              >
                {chatSubmitting ? "Starting..." : "Start Chat"}
              </button>
            </div>

            <div className={chatStyles.chatInfoCard}>
              <h4>What happens next</h4>
              <ul className={chatStyles.chatInfoList}>
                <li>Your enquiry becomes a CRM lead for this venue.</li>
                <li>Vendor can reply from their dashboard inbox.</li>
                <li>Admin can step in and assist if needed.</li>
                <li>Offline owners still get an instant assistant reply.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className={chatStyles.chatWorkspace}>
            <div className={chatStyles.chatMetaBar}>
              <div>
                <strong>{chatConversation.vendor?.businessName || venueOwnerLabel}</strong>
                <span>
                  Lead status:{" "}
                  {String(chatConversation.status || "new").toUpperCase()}
                </span>
              </div>
              <div className={chatStyles.chatMetaRight}>
                <span>{chatConversation.customer?.name}</span>
                <span>{chatConversation.customer?.phone}</span>
              </div>
            </div>

            <div className={chatStyles.chatMessages}>
              {chatLoading ? (
                <p className={chatStyles.chatEmpty}>Loading chat...</p>
              ) : null}

              {!chatLoading &&
              Array.isArray(chatConversation.messages) &&
              chatConversation.messages.length > 0
                ? chatConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${chatStyles.chatBubble} ${
                        message.senderType === "user"
                          ? chatStyles.chatBubbleUser
                          : message.senderType === "bot"
                          ? chatStyles.chatBubbleBot
                          : chatStyles.chatBubbleTeam
                      }`}
                    >
                      <div className={chatStyles.chatBubbleMeta}>
                        <strong>{message.senderName || message.senderType}</strong>
                        <span>
                          {new Date(message.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p>{message.text}</p>
                    </div>
                  ))
                : null}

              {!chatLoading &&
              (!chatConversation.messages || chatConversation.messages.length === 0) ? (
                <p className={chatStyles.chatEmpty}>
                  No messages yet. Start by sharing your requirement.
                </p>
              ) : null}

              <div ref={chatBottomRef} />
            </div>

            <div className={chatStyles.chatComposer}>
              <textarea
                value={chatReplyDraft}
                onChange={(event) => setChatReplyDraft(event.target.value)}
                placeholder="Reply here with your next question"
                rows={3}
              />

              <div className={chatStyles.chatComposerActions}>
                {chatError ? (
                  <p className={chatStyles.chatError}>{chatError}</p>
                ) : (
                  <p className={chatStyles.chatHint}>
                    This chat stays saved for this hall on your device.
                  </p>
                )}

                <button
                  type="button"
                  className={chatStyles.chatPrimaryButton}
                  onClick={handleSendChatReply}
                  disabled={chatSubmitting || !chatReplyDraft.trim()}
                >
                  {chatSubmitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

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

      <section className="hall-section customer-reviews-section">
        <div className="reviews-header">
          <div className="reviews-summary-card">
            <p className="reviews-eyebrow">Customer Reviews</p>
            <h3>What customers are saying</h3>

            <div className="reviews-summary-rating">
              <strong>{formattedAverageRating}</strong>
              <div className="reviews-summary-stars">
                {renderStarIcons(averageRating || 0)}
              </div>
              <span>
                {reviewCount === 0
                  ? "No reviews yet"
                  : `${reviewCount} customer review${reviewCount > 1 ? "s" : ""}`}
              </span>
            </div>

            <p className="reviews-summary-copy">
              Add real customer ratings, venue experience, and event photos so
              people can review the hall the same way they browse trusted venue
              reviews.
            </p>

            {highlightedReviewPhotos.length > 0 ? (
              <div className="review-photo-strip">
                {highlightedReviewPhotos.map((photo, index) => (
                  <img
                    key={`${photo}-${index}`}
                    src={toAbsoluteImageUrl(photo)}
                    alt={`${hall.hallName} review photo ${index + 1}`}
                    className="review-photo-strip-image"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="reviews-cta-card">
            <h4>Add your review</h4>
            <p>
              Rate this hall, write your experience, and upload photos from the
              event so future customers can see real feedback.
            </p>

            <button
              type="button"
              className="review-add-button"
              onClick={openReviewForm}
            >
              Add Customer Review
            </button>
          </div>
        </div>

        <div className="reviews-layout">
          <div className="reviews-list-card">
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <article
                    key={review._id || `${review.reviewerName}-${review.createdAt}`}
                    className="review-card"
                  >
                    <div className="review-card-top">
                      <div>
                        <h4>{review.reviewerName || "Customer"}</h4>
                        <p className="review-date">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Recently"}
                        </p>
                      </div>

                      <div className="review-rating-badge">
                        <span>{Number(review.rating || 0).toFixed(1)}</span>
                        <div className="review-card-stars">
                          {renderStarIcons(Number(review.rating || 0))}
                        </div>
                      </div>
                    </div>

                    <p className="review-comment">{review.comment}</p>

                    {Array.isArray(review.photos) && review.photos.length > 0 ? (
                      <div className="review-photos-grid">
                        {review.photos.map((photo, index) => (
                          <img
                            key={`${photo}-${index}`}
                            src={toAbsoluteImageUrl(photo)}
                            alt={`${review.reviewerName || "Customer"} review photo ${index + 1}`}
                            className="review-photo"
                          />
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="reviews-empty-state">
                <h4>No customer reviews yet</h4>
                <p>Be the first customer to rate this hall and upload event photos.</p>
              </div>
            )}
          </div>

          {showReviewForm ? (
            <div className="review-form-card" ref={reviewFormRef}>
              <div className="review-form-header">
                <div>
                  <p className="reviews-eyebrow">Add Customer Review</p>
                  <h4>Share your hall experience</h4>
                </div>
              </div>

              <form onSubmit={handleSubmitReview} className="review-form">
                <label className="review-field">
                  Name
                  <input
                    type="text"
                    value={reviewForm.reviewerName}
                    onChange={(event) =>
                      handleReviewFieldChange("reviewerName", event.target.value)
                    }
                    placeholder="Your full name"
                  />
                </label>

                <label className="review-field">
                  Email
                  <input
                    type="email"
                    value={reviewForm.reviewerEmail}
                    onChange={(event) =>
                      handleReviewFieldChange("reviewerEmail", event.target.value)
                    }
                    placeholder="Optional email address"
                  />
                </label>

                <div className="review-field">
                  <span>Star rating</span>
                  <div
                    className="review-rating-selector"
                    role="radiogroup"
                    aria-label="Customer rating"
                  >
                    {Array.from({ length: 5 }, (_, index) => {
                      const ratingValue = index + 1;
                      const isActive = Number(reviewForm.rating) >= ratingValue;

                      return (
                        <button
                          key={ratingValue}
                          type="button"
                          className={
                            isActive
                              ? "rating-star-button active"
                              : "rating-star-button"
                          }
                          onClick={() =>
                            handleReviewFieldChange("rating", ratingValue)
                          }
                          aria-label={`${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="review-field">
                  Review
                  <textarea
                    value={reviewForm.comment}
                    onChange={(event) =>
                      handleReviewFieldChange("comment", event.target.value)
                    }
                    placeholder="Tell customers about the hall, service, cleanliness, space, or overall experience"
                    rows={5}
                  />
                </label>

                <label className="review-field">
                  Upload photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleReviewImageChange}
                  />
                </label>

                {reviewImagePreviews.length > 0 ? (
                  <div className="review-upload-preview-grid">
                    {reviewImagePreviews.map((previewUrl, index) => (
                      <img
                        key={`${previewUrl}-${index}`}
                        src={previewUrl}
                        alt={`Review upload preview ${index + 1}`}
                        className="review-upload-preview"
                      />
                    ))}
                  </div>
                ) : null}

                {reviewError ? <p className="review-form-error">{reviewError}</p> : null}
                {reviewSuccess ? <p className="review-form-success">{reviewSuccess}</p> : null}

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
