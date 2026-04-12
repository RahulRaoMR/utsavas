"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../editHall.module.css";
import { getApiBaseUrl } from "../../../../../lib/api";
import { toAbsoluteImageUrl } from "../../../../../lib/imageUrl";
import {
  buildAddressQuery,
  buildAddressQueries,
  geocodeAddress,
  hasMinimumVenueAddress,
  hasRequiredVenueAddress,
  INDIA_MAP_CENTER,
  isValidLocation,
  normalizeLocation,
} from "../../../../../lib/hallLocation";
import {
  normalizeVenueCategory,
  VENUE_TYPE_OPTIONS,
} from "../../../../../lib/venueCategories";
import { LISTING_PLANS } from "../../../../../lib/listingPlans";

const VenueLocationMap = dynamic(
  () => import("../../../../components/VenueLocationMap"),
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

const DEFAULT_FORM = {
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
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

export default function VendorEditHallPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [location, setLocation] = useState(null);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [mapCenter, setMapCenter] = useState(INDIA_MAP_CENTER);
  const [confirmedAddressQuery, setConfirmedAddressQuery] = useState("");
  const [mapLookupState, setMapLookupState] = useState("idle");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const addressQuery = buildAddressQuery(address);
  const hasMinimumAddress = hasMinimumVenueAddress(address);
  const hasRequiredAddress = hasRequiredVenueAddress(address);

  useEffect(() => {
    async function loadHall() {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const res = await fetch(`${apiBaseUrl}/api/halls/${id}`, {
          cache: "no-store",
        });
        const hall = await res.json();

        if (!res.ok) {
          throw new Error(hall.message || "Failed to load hall");
        }

        setForm({
          hallName: hall.hallName || "",
          category: normalizeVenueCategory(hall.category) || "wedding",
          listingPlan: hall.listingPlan || "basic",
          capacity: hall.capacity || "",
          parkingCapacity: hall.parkingCapacity || "",
          rooms: hall.rooms || "",
          about: hall.about || "",
          pricePerDay: hall.pricePerDay || "",
          pricePerEvent: hall.pricePerEvent || "",
          pricePerPlate: hall.pricePerPlate || "",
        });
        const nextAddress = { ...DEFAULT_ADDRESS, ...(hall.address || {}) };
        const nextLocation = normalizeLocation(hall.location);

        setAddress(nextAddress);
        setLocation(nextLocation);
        setMapCenter(nextLocation || INDIA_MAP_CENTER);
        setConfirmedAddressQuery(buildAddressQuery(nextAddress));
        setMapLookupState(nextLocation ? "saved" : "idle");
        setFeatures({ ...DEFAULT_FEATURES, ...(hall.features || {}) });
        setImages(Array.isArray(hall.images) ? hall.images : []);
      } catch (error) {
        console.error(error);
        alert("Failed to load hall");
      } finally {
        setLoading(false);
      }
    }

    loadHall();
  }, [id]);

  useEffect(() => {
    if (newImages.length === 0) {
      setImagePreviews([]);
      return;
    }

    const previewUrls = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

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
    const nextAddress = { ...address, [e.target.name]: e.target.value };
    const nextAddressQuery = buildAddressQuery(nextAddress);

    setAddress(nextAddress);
    setLocation(null);
    setConfirmedAddressQuery("");
    setMapLookupState(
      nextAddressQuery
        ? hasMinimumVenueAddress(nextAddress)
          ? "idle"
          : "incomplete"
        : "idle"
    );
  };

  const handleFeatureChange = (e) => {
    setFeatures((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files || []));
  };

  const handleMapLocationChange = (nextLocation) => {
    setLocation(nextLocation);
    setMapCenter(nextLocation);
    setConfirmedAddressQuery(addressQuery);
    setMapLookupState("manual");
  };

  useEffect(() => {
    let isCancelled = false;

    if (loading) {
      return;
    }

    if (!addressQuery || !hasMinimumAddress) {
      return;
    }

    if (addressQuery === confirmedAddressQuery && isValidLocation(location)) {
      return;
    }

    setLocation(null);

    const timer = setTimeout(async () => {
      setMapLookupState("loading");
      const coords = await geocodeAddress(buildAddressQueries(address));
      if (isCancelled) {
        return;
      }

      if (coords) {
        setLocation(coords);
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
    hasMinimumAddress,
    loading,
    location,
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
    : mapLookupState === "saved"
    ? "Saved venue pin loaded. Drag the pin or click the map to update it."
    : "Address matched. Drag the pin if you want to fine-tune the exact venue location.";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const session = getVendorSession();
      const vendorId = session.vendorId;

      if (!vendorId || !session.token) {
        alert("Vendor session expired. Please login again.");
        router.replace("/vendor/vendor-login");
        return;
      }

      setSaving(true);

      if (!hasRequiredAddress) {
        throw new Error("Enter Building or Hall Name, Area, City, State, and Pincode before saving.");
      }

      if (!isValidLocation(location) || confirmedAddressQuery !== addressQuery) {
        throw new Error("Set the exact venue location on the map before saving.");
      }

      const formData = new FormData();
      formData.append("hallName", form.hallName);
      formData.append("category", form.category);
      formData.append("listingPlan", form.listingPlan);
      formData.append("capacity", Number(form.capacity) || 0);
      formData.append("parkingCapacity", Number(form.parkingCapacity) || 0);
      formData.append("rooms", Number(form.rooms) || 0);
      formData.append("pricePerDay", Number(form.pricePerDay) || 0);
      formData.append("pricePerEvent", Number(form.pricePerEvent) || 0);
      formData.append("pricePerPlate", Number(form.pricePerPlate) || 0);
      formData.append("about", form.about || "");
      formData.append("address", JSON.stringify(address));
      formData.append("location", JSON.stringify(location));
      formData.append("features", JSON.stringify(features));
      formData.append("vendorId", vendorId);

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch(`${getApiBaseUrl()}/api/halls/${id}?vendorId=${vendorId}`, {
        method: "PUT",
        headers: {
          ...getVendorHeaders(session.token),
        },
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
        throw new Error(data.message || "Failed to update hall");
      }

      alert("Hall updated successfully");
      router.push("/vendor/my-halls");
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
      <h1 className={styles.title}>Edit {form.hallName || "Hall"}</h1>

      <form onSubmit={handleSubmit}>
        <div className={`${styles.card} ${styles.imageEditorCard}`}>
          <div className={styles.imageEditorHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Edit Hall Images</h2>
              <p className={styles.uploadHint}>
                Upload new hall image files here. After saving, the new image will show for users too.
              </p>
            </div>

            <label htmlFor="hall-image-upload" className={styles.uploadButton}>
              Upload New Image
            </label>
          </div>

          <input
            id="hall-image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className={styles.hiddenFileInput}
          />

          {imagePreviews.length > 0 || images.length > 0 ? (
            <div className={styles.imageDisplayBlock}>
              <img
                src={imagePreviews[0] || toAbsoluteImageUrl(images[0])}
                alt={form.hallName}
                className={styles.coverPreview}
              />

              {imagePreviews.length > 0 ? (
                <>
                  <p className={styles.uploadHint}>
                    {`${imagePreviews.length} new image${imagePreviews.length > 1 ? "s are" : " is"} selected. Save changes to replace the current hall image${imagePreviews.length > 1 ? "s" : ""}.`}
                  </p>
                  <div className={styles.imagePreviewGrid}>
                    {imagePreviews.map((previewUrl, index) => (
                      <img
                        key={previewUrl}
                        src={previewUrl}
                        alt={`${form.hallName || "Hall"} preview ${index + 1}`}
                        className={styles.previewImage}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className={styles.uploadHint}>
                  Current saved hall image. Click <strong>Upload New Image</strong> to replace it.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.emptyImageState}>
              <p>No hall image uploaded yet.</p>
              <p>Select an image now and save the hall to add it.</p>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <input
            name="hallName"
            placeholder="Hall Name"
            value={form.hallName}
            onChange={handleFormChange}
            required
          />

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
            name="listingPlan"
            value={form.listingPlan}
            onChange={handleFormChange}
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
            type="number"
            placeholder="Capacity"
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

          <textarea
            name="about"
            placeholder="About"
            value={form.about}
            onChange={handleFormChange}
            rows={5}
          />

          <input name="flat" placeholder="Building / Hall Name" value={address.flat} onChange={handleAddressChange} required />
          <input name="floor" placeholder="Floor" value={address.floor} onChange={handleAddressChange} />
          <input name="area" placeholder="Area / Locality" value={address.area} onChange={handleAddressChange} required />
          <input name="city" placeholder="City" value={address.city} onChange={handleAddressChange} required />
          <input name="state" placeholder="State" value={address.state} onChange={handleAddressChange} required />
          <input name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleAddressChange} required />
          <input name="landmark" placeholder="Landmark" value={address.landmark} onChange={handleAddressChange} />

          <div className={styles.mapBlock}>
            <h2>Map Location</h2>
            <p className={styles.mapIntro}>
              The map tries to locate the venue from the address. If it is not exact,
              click the map or drag the pin to save the precise vendor location.
            </p>
            <p className={styles.mapStatus}>{mapStatus}</p>

            <div className={styles.map}>
              <VenueLocationMap
                fallbackCenter={mapCenter}
                onChange={handleMapLocationChange}
                position={location}
              />
            </div>

            <div className={styles.mapMeta}>
              <span>
                {isValidLocation(location)
                  ? `Lat: ${location.lat.toFixed(5)} | Lng: ${location.lng.toFixed(5)}`
                  : "Pin not set yet"}
              </span>
            </div>

            <p className={styles.mapNote}>
              Tip: the customer &quot;Get Directions&quot; button will use this saved pin.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", margin: "18px 0" }}>
            {Object.entries(features).map(([key, value]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={Boolean(value)}
                  onChange={handleFeatureChange}
                />{" "}
                {formatFeatureLabel(key)}
              </label>
            ))}
          </div>

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
