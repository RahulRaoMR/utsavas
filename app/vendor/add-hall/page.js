"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dynamic from "next/dynamic"; 
import styles from "./addHall.module.css";




const MapContainer = Dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);


const TileLayer = Dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = Dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const LocationPicker = Dynamic(
  () => import("./LocationPicker"),
  { ssr: false }
);



/* =====================
   GEOCODING (OSM)
===================== */
const geocodeAddress = async (query) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
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

  /* =====================
     VENUE DETAILS
  ===================== */
  const [form, setForm] = useState({
    hallName: "",
    category: "wedding",
    capacity: "",
    parkingCapacity: "",
    rooms: "",
    about: "",
    pricePerDay: "",
    pricePerEvent: "",
  });

  /* =====================
     ADDRESS
  ===================== */
  const [address, setAddress] = useState({
    flat: "",
    floor: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });


  const formatFeatureLabel = (key) => {
  const labels = {
    diningHall: "Dining Hall",
    stage: "Stage",
    powerBackup: "Power Backup",
    ac: "Air Conditioning",
    nonAc: "Non-AC Hall",
    outsideFood: "Outside Food Allowed",
    outsideDecorators: "Outside Decorators Allowed",
    outsideDJ: "Outside DJ Allowed",
    alcoholAllowed: "Alcohol Allowed",
    valetParking: "Valet Parking",
  };

  return labels[key] || key;
};



  /* =====================
     MAP LOCATION
  ===================== */
 const [geoLocation, setGeoLocation] = useState({
  lat: 10.8505,
  lng: 76.2711,
});


  {/* MAP */}
<section className={styles.card}>
  <h2>🗺 Pin Venue Location</h2>

  {geoLocation && (
    <MapContainer
      center={geoLocation}
      zoom={15}
      scrollWheelZoom
      className={styles.map}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={geoLocation}
        draggable
        eventHandlers={{
          dragend: (e) => {
            setGeoLocation(e.target.getLatLng());
          },
        }}
      />

      <LocationPicker setGeoLocation={setGeoLocation} />    </MapContainer>
  )}

  {!geoLocation && (
    <p className={styles.mapNote}>
      Enter address to load map…
    </p>
  )}
</section>


  /* =====================
     FEATURES
  ===================== */
  const [features, setFeatures] = useState({
    diningHall: false,
    stage: false,
    powerBackup: false,
    ac: false,
    nonAc: false,
    outsideFood: false,
    outsideDecorators: false,
    outsideDJ: false,
    alcoholAllowed: false,
    valetParking: false,
  });

  /* =====================
     IMAGES
  ===================== */
  const [images, setImages] = useState([]);

  /* =====================
     HANDLERS
  ===================== */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckbox = (e) =>
    setFeatures({ ...features, [e.target.name]: e.target.checked });

  const handleImageChange = (e) =>
    setImages(Array.from(e.target.files));

  const handleAddressChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  /* =====================
     AUTO GEOLOCATION
  ===================== */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (address.area && address.city && address.pincode) {
        const coords = await geocodeAddress(
          `${address.area}, ${address.city}, ${address.state}, ${address.pincode}`
        );
        if (coords) setGeoLocation(coords);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [address]);

  
  
  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const vendor = JSON.parse(localStorage.getItem("vendor"));
    if (!vendor?._id) {
      alert("Vendor not logged in");
      return;
    }

    if (!geoLocation) {
      alert("Location not detected");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("address", JSON.stringify(address));
    formData.append("location", JSON.stringify(geoLocation));
    formData.append("features", JSON.stringify(features));
    formData.append("vendorId", vendor._id);
    images.forEach((img) => formData.append("images", img));

    const res = await fetch("http://localhost:5000/api/halls/add", {
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
      <p className={styles.subtitle}>
        List your venue on <b>UTSAVAS</b>
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* VENUE DETAILS */}
        <section className={styles.card}>
          <h2>🏛 Venue Details</h2>

          <input
            name="hallName"
            placeholder="Hall Name"
            required
            onChange={handleChange}
          />

          {/* FIXED DROPDOWN */}
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

          {/* PRICE ROW */}
          <div className={styles.row}>
            <input
              type="number"
              name="pricePerDay"
              placeholder="Price Per Day (₹)"
              onChange={handleChange}
            />
            <input
              type="number"
              name="pricePerEvent"
              placeholder="Price Per Event (₹)"
              onChange={handleChange}
            />
          </div>

          <textarea
            name="about"
            placeholder="About the venue"
            onChange={handleChange}
          />
        </section>

       {/* ADDRESS */}
<section className={styles.card}>
  <h2>📍 Venue Address</h2>

  <input name="flat" placeholder="Building / Hall Name" onChange={handleAddressChange} />
  <input name="floor" placeholder="Floor (optional)" onChange={handleAddressChange} />
  <input name="area" placeholder="Area / Locality" onChange={handleAddressChange} />
  <input name="city" placeholder="City" onChange={handleAddressChange} />
  <input name="state" placeholder="State" onChange={handleAddressChange} />
  <input name="pincode" placeholder="Pincode" onChange={handleAddressChange} />
  <input name="landmark" placeholder="Nearby Landmark" onChange={handleAddressChange} />
</section>



        {/* MAP */}
        <section className={styles.card}>
          <h2>🗺 Pin Venue Location</h2>

          <MapContainer
            center={geoLocation}
            zoom={15}
            scrollWheelZoom
            className={styles.map}
          >
            <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
    
            <Marker
              position={geoLocation}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  setGeoLocation(e.target.getLatLng());
                },
              }}
            />
            <LocationPicker />
          </MapContainer>

          <p className={styles.mapNote}>
            Click or drag marker to exact venue location
          </p>
        </section>

{/* FEATURES */}
<section className={styles.card}>
  <h2>✨ Facilities</h2>

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


        {/* IMAGES */}
        <section className={styles.card}>
          <h2>📸 Venue Images</h2>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </section>

        <button className={styles.submit}>Submit Hall</button>
      </form>
    </div>
  );
}
