"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./editHall.module.css";
import { toAbsoluteImageUrl } from "../../../../../lib/imageUrl";
import {
  normalizeVenueCategory,
  VENUE_TYPE_OPTIONS,
} from "../../../../../lib/venueCategories";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const DEFAULT_FORM = {
  hallName: "",
  category: "wedding",
  capacity: "",
  parkingCapacity: "",
  rooms: "",
  about: "",
  pricePerDay: "",
  pricePerEvent: "",
  pricePerPlate: "",
  status: "pending",
};

const DEFAULT_ADDRESS = {
  flat: "",
  floor: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

const DEFAULT_LOCATION = {
  lat: "",
  lng: "",
};

const DEFAULT_FEATURES = {
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
};

function formatFeatureLabel(key) {
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
    hotTub: "Hot Tub / Jacuzzi",
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

  return labels[key] || key.replace(/([A-Z])/g, " $1").trim();
}

export default function AdminEditHallPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadHall() {
      try {
        const res = await fetch(`${API}/api/admin/halls/${id}`, {
          cache: "no-store",
        });
        const hall = await res.json();

        if (!res.ok) {
          throw new Error(hall.message || "Failed to load hall");
        }

        setForm({
          hallName: hall.hallName || "",
          category: normalizeVenueCategory(hall.category) || "wedding",
          capacity: hall.capacity || "",
          parkingCapacity: hall.parkingCapacity || "",
          rooms: hall.rooms || "",
          about: hall.about || "",
          pricePerDay: hall.pricePerDay || "",
          pricePerEvent: hall.pricePerEvent || "",
          pricePerPlate: hall.pricePerPlate || "",
          status: hall.status || "pending",
        });
        setAddress({ ...DEFAULT_ADDRESS, ...(hall.address || {}) });
        setLocation({
          lat: hall.location?.lat ?? "",
          lng: hall.location?.lng ?? "",
        });
        setFeatures({ ...DEFAULT_FEATURES, ...(hall.features || {}) });
        setImages(Array.isArray(hall.images) ? hall.images : []);
      } catch (error) {
        console.error(error);
        alert("Failed to load hall details");
      } finally {
        setLoading(false);
      }
    }

    loadHall();
  }, [id]);

  const handleFormChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.name === "category"
          ? normalizeVenueCategory(e.target.value)
          : e.target.value,
    }));
  };

  const handleAddressChange = (e) => {
    setAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationChange = (e) => {
    setLocation((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFeatureChange = (e) => {
    setFeatures((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch(`${API}/api/admin/halls/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity) || 0,
          parkingCapacity: Number(form.parkingCapacity) || 0,
          rooms: Number(form.rooms) || 0,
          pricePerDay: Number(form.pricePerDay) || 0,
          pricePerEvent: Number(form.pricePerEvent) || 0,
          pricePerPlate: Number(form.pricePerPlate) || 0,
          address,
          location: {
            lat: Number(location.lat) || 0,
            lng: Number(location.lng) || 0,
          },
          features,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update hall");
      }

      alert("Hall updated successfully");
      router.push("/admin/halls?status=all");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update hall");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading hall editor...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Admin Hall Editor</p>
          <h1 className={styles.title}>Edit {form.hallName || "Venue"}</h1>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => router.push("/admin/halls?status=all")}
          >
            Back to Halls
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className={styles.coverCard}>
          <img
            src={toAbsoluteImageUrl(images[0])}
            alt={form.hallName}
            className={styles.coverImage}
          />
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <h2>Venue Details</h2>

          <input
            name="hallName"
            placeholder="Hall Name"
            value={form.hallName}
            onChange={handleFormChange}
            required
          />

          <div className={styles.twoCol}>
            <select
              name="category"
              value={form.category}
              onChange={handleFormChange}
            >
              {VENUE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className={styles.threeCol}>
            <input
              name="capacity"
              type="number"
              placeholder="Guest Capacity"
              value={form.capacity}
              onChange={handleFormChange}
            />
            <input
              name="parkingCapacity"
              type="number"
              placeholder="Parking Capacity"
              value={form.parkingCapacity}
              onChange={handleFormChange}
            />
            <input
              name="rooms"
              type="number"
              placeholder="Rooms"
              value={form.rooms}
              onChange={handleFormChange}
            />
          </div>

          <div className={styles.threeCol}>
            <input
              name="pricePerDay"
              type="number"
              placeholder="Price Per Day"
              value={form.pricePerDay}
              onChange={handleFormChange}
            />
            <input
              name="pricePerEvent"
              type="number"
              placeholder="Price Per Event"
              value={form.pricePerEvent}
              onChange={handleFormChange}
            />
            <input
              name="pricePerPlate"
              type="number"
              placeholder="Price Per Plate"
              value={form.pricePerPlate}
              onChange={handleFormChange}
            />
          </div>

          <textarea
            name="about"
            placeholder="About the venue"
            value={form.about}
            onChange={handleFormChange}
            rows={6}
          />
        </section>

        <section className={styles.card}>
          <h2>Address</h2>

          <div className={styles.twoCol}>
            <input
              name="flat"
              placeholder="Building / Hall Name"
              value={address.flat}
              onChange={handleAddressChange}
            />
            <input
              name="floor"
              placeholder="Floor"
              value={address.floor}
              onChange={handleAddressChange}
            />
          </div>

          <div className={styles.twoCol}>
            <input
              name="area"
              placeholder="Area / Locality"
              value={address.area}
              onChange={handleAddressChange}
            />
            <input
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
            />
          </div>

          <div className={styles.threeCol}>
            <input
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
            />
            <input
              name="pincode"
              placeholder="Pincode"
              value={address.pincode}
              onChange={handleAddressChange}
            />
            <input
              name="landmark"
              placeholder="Landmark"
              value={address.landmark}
              onChange={handleAddressChange}
            />
          </div>
        </section>

        <section className={styles.card}>
          <h2>Map Coordinates</h2>

          <div className={styles.twoCol}>
            <input
              name="lat"
              type="number"
              step="any"
              placeholder="Latitude"
              value={location.lat}
              onChange={handleLocationChange}
            />
            <input
              name="lng"
              type="number"
              step="any"
              placeholder="Longitude"
              value={location.lng}
              onChange={handleLocationChange}
            />
          </div>
        </section>

        <section className={styles.card}>
          <h2>Facilities & Amenities</h2>

          <div className={styles.featureGrid}>
            {Object.entries(features).map(([key, value]) => (
              <label key={key} className={styles.featureItem}>
                <input
                  type="checkbox"
                  name={key}
                  checked={Boolean(value)}
                  onChange={handleFeatureChange}
                />
                <span>{formatFeatureLabel(key)}</span>
              </label>
            ))}
          </div>
        </section>

        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => router.back()}
          >
            Cancel
          </button>

          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Hall Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
