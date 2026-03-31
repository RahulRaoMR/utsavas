"use client";
export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./addHall.module.css";
import { getApiBaseUrl } from "../../../lib/api";
import {
  buildAddressQuery,
  buildAddressQueries,
  geocodeAddress,
  hasMinimumVenueAddress,
  hasRequiredVenueAddress,
  INDIA_MAP_CENTER,
  isValidLocation,
} from "../../../lib/hallLocation";
import {
  normalizeVenueCategory,
  VENUE_TYPE_OPTIONS,
} from "../../../lib/venueCategories";
import { LISTING_PLANS } from "../../../lib/listingPlans";

const VenueLocationMap = dynamicImport(
  () => import("../../components/VenueLocationMap"),
  { ssr: false }
);

const getVendorSession = () => {
  if (typeof window === "undefined") {
    return {
      token: "",
      vendor: null,
      vendorId: "",
    };
  }

  const rawVendor = localStorage.getItem("vendor");
  const vendor = rawVendor ? JSON.parse(rawVendor) : null;

  return {
    token: localStorage.getItem("vendorToken") || "",
    vendor,
    vendorId: vendor?._id || vendor?.id || "",
  };
};

const getVendorHeaders = (token) =>
  token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

export default function AddHallPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    hallName: "",
    category: "wedding",
    listingPlan: "basic",
    capacity: "",
    parkingCapacity: "",
    rooms: "",
    about: "",
    pricePerDay: "",
    pricePerEvent: "",
    pricePerPlate: "",
  });

  const [address, setAddress] = useState({
    flat: "",
    floor: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [features, setFeatures] = useState({
    diningHall: false,
    stage: false,
    powerBackup: false,
    airConditioning: false,
    nonAcHall: false,
    outsideFoodAllowed: false,
    outsideDecoratorsAllowed: false,
    outsideDjAllowed: false,
    alcoholAllowed: false,
    valetParking: false,
    parking: false,
    restaurant: false,
    roomService: false,
    frontDesk24: false,
    fitnessCentre: false,
    nonSmokingRooms: false,
    airportShuttle: false,
    spaWellness: false,
    hotTub: false,
    freeWifi: false,
    evCharging: false,
    wheelchairAccessible: false,
    swimmingPool: false,
    selfCatering: false,
    breakfastIncluded: false,
    allMealsIncluded: false,
    breakfastDinnerIncluded: false,
    acceptsOnlinePayments: false,
    freeCancellation: false,
  });

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
      alcoholAllowed: "Alcohol Allowed",
      valetParking: "Valet Parking",
      parking: "Parking",
      restaurant: "Restaurant",
      roomService: "Room Service",
      frontDesk24: "24-hour Front Desk",
      fitnessCentre: "Fitness Centre",
      nonSmokingRooms: "Non-smoking Rooms",
      airportShuttle: "Airport Shuttle",
      spaWellness: "Spa & Wellness Centre",
      hotTub: "Hot Tub/Jacuzzi",
      freeWifi: "Free WiFi",
      evCharging: "EV Charging Station",
      wheelchairAccessible: "Wheelchair Accessible",
      swimmingPool: "Swimming Pool",
      selfCatering: "Self Catering",
      breakfastIncluded: "Breakfast Included",
      allMealsIncluded: "All Meals Included",
      breakfastDinnerIncluded: "Breakfast & Dinner Included",
      acceptsOnlinePayments: "Accepts Online Payments",
      freeCancellation: "Free Cancellation",
    };

    return labels[key] || key;
  };

  const [geoLocation, setGeoLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(INDIA_MAP_CENTER);
  const [confirmedAddressQuery, setConfirmedAddressQuery] = useState("");
  const [mapLookupState, setMapLookupState] = useState("idle");

  const [images, setImages] = useState([]);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "category"
          ? normalizeVenueCategory(e.target.value)
          : e.target.value,
    });

  const handleCheckbox = (e) =>
    setFeatures({ ...features, [e.target.name]: e.target.checked });

  const handleImageChange = (e) =>
    setImages(Array.from(e.target.files));

  const handleAddressChange = (e) => {
    const nextAddress = { ...address, [e.target.name]: e.target.value };
    const nextAddressQuery = buildAddressQuery(nextAddress);

    setAddress(nextAddress);
    setGeoLocation(null);
    setConfirmedAddressQuery("");
    setMapLookupState(
      nextAddressQuery
        ? hasMinimumVenueAddress(nextAddress)
          ? "idle"
          : "incomplete"
        : "idle"
    );
  };

  const addressQuery = buildAddressQuery(address);
  const hasMinimumAddress = hasMinimumVenueAddress(address);
  const hasRequiredAddress = hasRequiredVenueAddress(address);

  const handleGeoLocationChange = (nextLocation) => {
    setGeoLocation(nextLocation);
    setMapCenter(nextLocation);
    setConfirmedAddressQuery(addressQuery);
    setMapLookupState("manual");
  };

  useEffect(() => {
    let isCancelled = false;

    if (!addressQuery || !hasMinimumAddress) {
      return;
    }

    if (addressQuery === confirmedAddressQuery && isValidLocation(geoLocation)) {
      return;
    }

    const timer = setTimeout(async () => {
      setMapLookupState("loading");
      const coords = await geocodeAddress(buildAddressQueries(address));
      if (isCancelled) {
        return;
      }
      if (coords) {
        setGeoLocation(coords);
        setMapCenter(coords);
        setConfirmedAddressQuery(addressQuery);
        setMapLookupState("resolved");
      } else {
        setMapLookupState("not_found");
      }
    }, 700);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    address,
    addressQuery,
    confirmedAddressQuery,
    geoLocation,
    hasMinimumAddress,
  ]);

  const mapStatus = !addressQuery
    ? "Enter the venue address, then click the map if you need to place the exact location manually."
    : !hasMinimumAddress
    ? "Add city and state with area, hall name, landmark, or pincode so the map can locate the venue."
    : mapLookupState === "loading"
    ? "Trying to place the venue from the address..."
    : mapLookupState === "not_found"
    ? "Address not matched. Click the exact venue spot on the map or drag the pin after placing it."
    : mapLookupState === "manual"
    ? "Exact venue pin selected. Customers will get directions to this point."
    : "Address matched. Drag the pin if you want to fine-tune the exact venue location.";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const session = getVendorSession();

    if (!session.vendorId || !session.token) {
      alert("Vendor session expired. Please login again.");
      router.replace("/vendor/vendor-login");
      return;
    }

    if (!hasRequiredAddress) {
      alert("Enter Building or Hall Name, Area, City, State, and Pincode before submitting.");
      return;
    }

    if (!isValidLocation(geoLocation) || confirmedAddressQuery !== addressQuery) {
      alert("Set the exact venue location on the map before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("hallName", form.hallName);
    formData.append("category", form.category);
    formData.append("listingPlan", form.listingPlan);
    formData.append("capacity", Number(form.capacity) || 0);
    formData.append("parkingCapacity", Number(form.parkingCapacity) || 0);
    formData.append("rooms", Number(form.rooms) || 0);
    formData.append("pricePerDay", form.pricePerDay ? Number(form.pricePerDay) : 0);
    formData.append("pricePerEvent", form.pricePerEvent ? Number(form.pricePerEvent) : 0);
    formData.append("pricePerPlate", form.pricePerPlate ? Number(form.pricePerPlate) : 0);
    formData.append("about", form.about);
    formData.append("address", JSON.stringify(address));
    formData.append("location", JSON.stringify(geoLocation));
    formData.append("features", JSON.stringify(features));
    formData.append("vendorId", session.vendorId);

    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/halls/add`, {
        method: "POST",
        headers: getVendorHeaders(session.token),
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401 || res.status === 403) {
        alert(data.message || "Vendor session expired. Please login again.");
        localStorage.removeItem("vendor");
        localStorage.removeItem("vendorToken");
        router.replace("/vendor/vendor-login");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to add hall");
        return;
      }

      alert("Hall added successfully! Waiting for admin approval.");
      router.push("/vendor/dashboard");
    } catch (error) {
      console.error("Add hall error:", error);
      alert("Failed to add hall. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Add Your Venue</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2>Venue Details</h2>

          <input
            name="hallName"
            placeholder="Hall Name"
            required
            onChange={handleChange}
          />

          <select name="category" value={form.category} onChange={handleChange}>
            {VENUE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="listingPlan"
            value={form.listingPlan}
            onChange={handleChange}
          >
            {LISTING_PLANS.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {`${plan.name} - ${plan.price}`}
              </option>
            ))}
          </select>

          <p className={styles.helperText}>
            User-side city and PIN code results show Digital Presence plans
            first, then Premium, Featured, and finally Basic listings.
          </p>

          <input
            name="capacity"
            placeholder="Guest Capacity"
            onChange={handleChange}
          />

          <input
            name="parkingCapacity"
            placeholder="Parking Capacity"
            onChange={handleChange}
          />

          <input
            name="rooms"
            placeholder="Rooms / Green Rooms"
            onChange={handleChange}
          />

          <div className={styles.row}>
            <input
              type="number"
              name="pricePerDay"
              placeholder="Price Per Day (Rs)"
              value={form.pricePerDay}
              onChange={handleChange}
            />

            <input
              type="number"
              name="pricePerEvent"
              placeholder="Price Per Event (Rs)"
              value={form.pricePerEvent}
              onChange={handleChange}
            />

            <input
              type="number"
              name="pricePerPlate"
              placeholder="Price Per Plate (Rs)"
              value={form.pricePerPlate}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="about"
            placeholder="About the venue"
            onChange={handleChange}
          />
        </section>

        <section className={styles.card}>
          <h2>Venue Address</h2>

          <input name="flat" placeholder="Building / Hall Name" onChange={handleAddressChange} required />
          <input name="floor" placeholder="Floor (optional)" onChange={handleAddressChange} />
          <input name="area" placeholder="Area / Locality" onChange={handleAddressChange} required />
          <input name="city" placeholder="City" onChange={handleAddressChange} required />
          <input name="state" placeholder="State" onChange={handleAddressChange} required />
          <input name="pincode" placeholder="Pincode" onChange={handleAddressChange} required />
          <input name="landmark" placeholder="Nearby Landmark" onChange={handleAddressChange} />
        </section>

        <section className={styles.card}>
          <h2>Map Location</h2>
          <p className={styles.mapIntro}>
            The map tries to locate the venue from the address. If it is not exact,
            click the map or drag the pin to save the precise vendor location.
          </p>
          <p className={styles.mapStatus}>{mapStatus}</p>

          <div className={styles.map}>
            <VenueLocationMap
              fallbackCenter={mapCenter}
              onChange={handleGeoLocationChange}
              position={geoLocation}
            />
          </div>

          <div className={styles.mapMeta}>
            <span>
              {isValidLocation(geoLocation)
                ? `Lat: ${geoLocation.lat.toFixed(5)} | Lng: ${geoLocation.lng.toFixed(5)}`
                : "Pin not set yet"}
            </span>
          </div>

          <p className={styles.mapNote}>
            Tip: the customer &quot;Get Directions&quot; button will use this saved pin.
          </p>
        </section>

        <section className={styles.card}>
          <h2>Facilities & Amenities</h2>

          <div className={styles.featureGrid}>
            {Object.entries(features).map(([key, value]) => (
              <label key={key} className={styles.featureItem}>
                <input
                  type="checkbox"
                  name={key}
                  checked={value}
                  onChange={handleCheckbox}
                />
                <span>{formatFeatureLabel(key)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2>Venue Images</h2>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </section>

        <button className={styles.submit}>Submit Hall</button>
      </form>
    </div>
  );
}
