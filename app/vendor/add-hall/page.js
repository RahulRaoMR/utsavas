"use client";
export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./addHall.module.css";
import {
  buildAddressQuery,
  buildAddressQueries,
  buildVenueMapUrls,
  geocodeAddress,
  hasMinimumVenueAddress,
  INDIA_MAP_CENTER,
  isValidLocation,
} from "../../../lib/hallLocation";
import {
  normalizeVenueCategory,
  VENUE_TYPE_OPTIONS,
} from "../../../lib/venueCategories";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const VenueLocationMap = dynamicImport(
  () => import("../../components/VenueLocationMap"),
  { ssr: false }
);

export default function AddHallPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    hallName: "",
    category: "wedding",
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

  const { openMapUrl } = buildVenueMapUrls({
    hallName: form.hallName,
    address,
    location: geoLocation,
  });

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

    const vendor = JSON.parse(localStorage.getItem("vendor"));
    if (!vendor?._id) {
      alert("Vendor not logged in");
      return;
    }

    if (!hasMinimumAddress) {
      alert("Enter city, state, and at least one address detail like area, pincode, landmark, or hall name.");
      return;
    }

    if (!isValidLocation(geoLocation) || confirmedAddressQuery !== addressQuery) {
      alert("Set the exact venue location on the map before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("hallName", form.hallName);
    formData.append("category", form.category);
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
    formData.append("vendorId", vendor._id);

    images.forEach((img) => formData.append("images", img));

    const res = await fetch(`${API}/api/halls/add`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.message || "Failed to add hall");
      return;
    }

    alert("Hall added successfully! Waiting for admin approval.");
    router.push("/vendor/dashboard");
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

          <input name="flat" placeholder="Building / Hall Name" onChange={handleAddressChange} />
          <input name="floor" placeholder="Floor (optional)" onChange={handleAddressChange} />
          <input name="area" placeholder="Area / Locality" onChange={handleAddressChange} />
          <input name="city" placeholder="City" onChange={handleAddressChange} />
          <input name="state" placeholder="State" onChange={handleAddressChange} />
          <input name="pincode" placeholder="Pincode" onChange={handleAddressChange} />
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
            <a
              href={openMapUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.mapLink}
            >
              Open in Google Maps
            </a>
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
