"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./addHall.module.css";

const geocodeAddress = async (query) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
      query
    )}`
  );
  const data = await res.json();
  if (data?.length) {
    return { lat: +data[0].lat, lng: +data[0].lon };
  }
  return null;
};

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

  const [geoLocation, setGeoLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
  });
  const [resolvedQuery, setResolvedQuery] = useState("");
  const [mapLookupState, setMapLookupState] = useState("idle");

  const [images, setImages] = useState([]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckbox = (e) =>
    setFeatures({ ...features, [e.target.name]: e.target.checked });

  const handleImageChange = (e) =>
    setImages(Array.from(e.target.files));

  const handleAddressChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const addressQuery = [
    address.flat,
    address.floor,
    address.landmark,
    address.area,
    address.city,
    address.state,
    address.pincode,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    const hasMinimumAddress =
      Boolean(address.city.trim()) &&
      Boolean(address.state.trim()) &&
      Boolean(
        address.area.trim() ||
          address.pincode.trim() ||
          address.landmark.trim() ||
          address.flat.trim()
      );

    if (!addressQuery) {
      return;
    }

    if (!hasMinimumAddress) {
      return;
    }

    const timer = setTimeout(async () => {
      setMapLookupState("loading");
      const coords = await geocodeAddress(addressQuery);
      if (coords) {
        setGeoLocation(coords);
        setResolvedQuery(addressQuery);
        setMapLookupState("resolved");
      } else {
        setMapLookupState("not_found");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [
    address.flat,
    address.floor,
    address.landmark,
    address.area,
    address.city,
    address.state,
    address.pincode,
    addressQuery,
  ]);

  const mapQuery =
    resolvedQuery === addressQuery &&
    typeof geoLocation?.lat === "number" &&
    typeof geoLocation?.lng === "number"
      ? `${geoLocation.lat},${geoLocation.lng}`
      : addressQuery || "Bengaluru";
  const mapStatus = !addressQuery
    ? "Enter the venue address to update the map."
    : !(
        address.city.trim() &&
        address.state.trim() &&
        (address.area.trim() ||
          address.pincode.trim() ||
          address.landmark.trim() ||
          address.flat.trim())
      )
    ? "Add area or pincode along with city and state for a more accurate map."
    : mapLookupState === "loading"
    ? "Updating map from the address..."
    : mapLookupState === "not_found"
    ? "Address not matched exactly. Refine area, landmark, or pincode."
    : resolvedQuery === addressQuery
    ? "Map updated automatically from the address."
    : "Map will refresh after the address is resolved.";

  const embedMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQuery || "Bengaluru"
  )}&z=16&output=embed`;
  const openMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    mapQuery || "Bengaluru"
  )}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendor = JSON.parse(localStorage.getItem("vendor"));
    if (!vendor?._id) {
      alert("Vendor not logged in");
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

    const res = await fetch("https://utsavas-backend-1.onrender.com/api/halls/add", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("Failed to add hall");
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

          <select name="category" onChange={handleChange}>
            <option value="wedding">Wedding Hall</option>
            <option value="banquet">Banquet Hall</option>
            <option value="party">Party Venue</option>
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
            This map updates automatically from the address above so the venue
            location is easier to verify.
          </p>
          <p className={styles.mapStatus}>{mapStatus}</p>

          <div className={styles.map}>
            <iframe
              title="Venue map preview"
              src={embedMapUrl}
              className={styles.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className={styles.mapMeta}>
            <span>
              Lat: {geoLocation.lat.toFixed(5)} | Lng: {geoLocation.lng.toFixed(5)}
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
