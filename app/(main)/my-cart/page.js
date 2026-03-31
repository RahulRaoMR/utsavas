"use client";

import Link from "next/link";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import styles from "./myCart.module.css";
import { CART_UPDATED_EVENT, getHallCart, removeHallFromCart } from "../../../lib/cart";
import { getApiBaseUrl } from "../../../lib/api";
import { toAbsoluteImageUrl } from "../../../lib/imageUrl";
import { getVenueCategoryLabel, getVenueRoute } from "../../../lib/venueCategories";

const EMPTY_CART = [];
const MAX_COMPARE_ITEMS = 3;
const SCORE_FEATURE_KEYS = [
  "airConditioning",
  "ac",
  "stage",
  "diningHall",
  "outsideFoodAllowed",
  "outsideFood",
  "outsideDecoratorsAllowed",
  "outsideDecorators",
  "outsideDjAllowed",
  "outsideDJ",
  "valetParking",
  "restaurant",
  "roomService",
  "wheelchairAccessible",
  "freeWifi",
];

const formatAddress = (address = {}) =>
  [address.area, address.city, address.state].filter(Boolean).join(", ") ||
  "Address unavailable";

const formatNumber = (value) => {
  const numericValue = Number(value || 0);
  return numericValue > 0 ? numericValue.toLocaleString("en-IN") : "N/A";
};

const formatBooleanFeature = (value) => {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "Not listed";
};

const getFeatureValue = (hall, key) => {
  if (!hall?.features || typeof hall.features !== "object") {
    return null;
  }

  const value = hall.features[key];

  if (value === undefined || value === null) {
    return null;
  }

  if (value === true || value === "true" || value === 1) {
    return true;
  }

  if (value === false || value === "false" || value === 0) {
    return false;
  }

  return Boolean(value);
};

const getAirConditioningValue = (hall) => {
  const primaryValue = getFeatureValue(hall, "airConditioning");

  if (primaryValue !== null) {
    return primaryValue;
  }

  return getFeatureValue(hall, "ac");
};

const getOutsideFoodValue = (hall) => {
  const primaryValue = getFeatureValue(hall, "outsideFoodAllowed");

  if (primaryValue !== null) {
    return primaryValue;
  }

  return getFeatureValue(hall, "outsideFood");
};

const getOutsideDecoratorsValue = (hall) => {
  const primaryValue = getFeatureValue(hall, "outsideDecoratorsAllowed");

  if (primaryValue !== null) {
    return primaryValue;
  }

  return getFeatureValue(hall, "outsideDecorators");
};

const getOutsideDjValue = (hall) => {
  const primaryValue = getFeatureValue(hall, "outsideDjAllowed");

  if (primaryValue !== null) {
    return primaryValue;
  }

  return getFeatureValue(hall, "outsideDJ");
};

const getPriceDetails = (hall) => {
  const pricePerEvent = Number(hall?.pricePerEvent || 0);
  const pricePerDay = Number(hall?.pricePerDay || 0);
  const pricePerPlate = Number(hall?.pricePerPlate || 0);

  if (pricePerEvent > 0) {
    return {
      value: pricePerEvent,
      label: `Rs ${pricePerEvent.toLocaleString("en-IN")} per event`,
    };
  }

  if (pricePerDay > 0) {
    return {
      value: pricePerDay,
      label: `Rs ${pricePerDay.toLocaleString("en-IN")} per day`,
    };
  }

  if (pricePerPlate > 0) {
    return {
      value: pricePerPlate,
      label: `Rs ${pricePerPlate.toLocaleString("en-IN")} per plate`,
    };
  }

  return {
    value: 0,
    label: "Price on request",
  };
};

const formatPrice = (hall) => getPriceDetails(hall).label;

const getAmenityScore = (hall) =>
  SCORE_FEATURE_KEYS.reduce((total, featureKey) => {
    const featureValue = getFeatureValue(hall, featureKey);
    return total + (featureValue === true ? 1 : 0);
  }, 0);

const getComparisonScore = (hall, halls) => {
  const prices = halls
    .map((item) => getPriceDetails(item).value)
    .filter((value) => value > 0);
  const capacities = halls.map((item) => Number(item?.capacity || 0));
  const parkings = halls.map((item) => Number(item?.parkingCapacity || 0));
  const rooms = halls.map((item) => Number(item?.rooms || 0));
  const amenities = halls.map((item) => getAmenityScore(item));

  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const maxCapacity = Math.max(1, ...capacities);
  const maxParking = Math.max(1, ...parkings);
  const maxRooms = Math.max(1, ...rooms);
  const maxAmenities = Math.max(1, ...amenities);

  const hallPrice = getPriceDetails(hall).value;
  const hallCapacity = Number(hall?.capacity || 0);
  const hallParking = Number(hall?.parkingCapacity || 0);
  const hallRooms = Number(hall?.rooms || 0);
  const hallAmenities = getAmenityScore(hall);

  let score = 0;

  if (hallPrice > 0 && maxPrice > 0) {
    score += ((maxPrice - hallPrice) / maxPrice) * 35;
  }

  score += (hallCapacity / maxCapacity) * 30;
  score += (hallParking / maxParking) * 10;
  score += (hallRooms / maxRooms) * 10;
  score += (hallAmenities / maxAmenities) * 15;

  return score;
};

const getBestChoiceHallId = (halls) => {
  let bestHallId = "";
  let bestScore = Number.NEGATIVE_INFINITY;

  halls.forEach((hall) => {
    const hallId = String(hall?._id || "");
    const score = getComparisonScore(hall, halls);

    if (score > bestScore) {
      bestScore = score;
      bestHallId = hallId;
    }
  });

  return bestHallId;
};

const getLowestPriceHallId = (halls) => {
  const pricedHalls = halls
    .map((hall) => ({
      hallId: String(hall?._id || ""),
      value: getPriceDetails(hall).value,
    }))
    .filter((hall) => hall.value > 0);

  if (pricedHalls.length === 0) {
    return "";
  }

  const lowestPrice = Math.min(...pricedHalls.map((hall) => hall.value));
  return pricedHalls.find((hall) => hall.value === lowestPrice)?.hallId || "";
};

const getHighestCapacityHallId = (halls) => {
  const capacityHalls = halls.map((hall) => ({
    hallId: String(hall?._id || ""),
    value: Number(hall?.capacity || 0),
  }));
  const highestCapacity = Math.max(...capacityHalls.map((hall) => hall.value));

  return capacityHalls.find((hall) => hall.value === highestCapacity)?.hallId || "";
};

const getMostFeatureRichHallId = (halls) => {
  const amenityHalls = halls.map((hall) => ({
    hallId: String(hall?._id || ""),
    value: getAmenityScore(hall),
  }));
  const highestAmenityCount = Math.max(...amenityHalls.map((hall) => hall.value));

  return (
    amenityHalls.find((hall) => hall.value === highestAmenityCount)?.hallId || ""
  );
};

const getHallBadges = (hall, halls) => {
  const hallId = String(hall?._id || "");
  const badges = [];
  const bestChoiceHallId = getBestChoiceHallId(halls);
  const lowestPriceHallId = getLowestPriceHallId(halls);
  const highestCapacityHallId = getHighestCapacityHallId(halls);
  const mostFeatureRichHallId = getMostFeatureRichHallId(halls);

  if (hallId && hallId === bestChoiceHallId) {
    badges.push({
      label: "Best Choice",
      tone: "best",
    });
  }

  if (hallId && hallId === lowestPriceHallId) {
    badges.push({
      label: "Best Budget",
      tone: "budget",
    });
  }

  if (hallId && hallId === highestCapacityHallId) {
    badges.push({
      label: "Big Events",
      tone: "capacity",
    });
  }

  if (hallId && hallId === mostFeatureRichHallId) {
    badges.push({
      label: "Feature Rich",
      tone: "feature",
    });
  }

  return badges.slice(0, 2);
};

const getCateringPolicy = (hall) => {
  const outsideFoodAllowed = getOutsideFoodValue(hall);
  const hasInHouseDining =
    getFeatureValue(hall, "restaurant") === true ||
    getFeatureValue(hall, "diningHall") === true;
  const hasFeatureData = Boolean(hall?.features && typeof hall.features === "object");

  if (outsideFoodAllowed === true && hasInHouseDining) {
    return "In-house + outside";
  }

  if (hasInHouseDining) {
    return "In-house";
  }

  if (outsideFoodAllowed === true) {
    return "Outside allowed";
  }

  return hasFeatureData ? "On request" : "Not listed";
};

const getComparisonSections = () => [
  {
    title: "Basic Info",
    rows: [
      {
        label: "Hall Name",
        getDisplayValue: (hall) => hall?.hallName || "Venue",
        getCompareValue: (hall) => String(hall?.hallName || "").trim(),
      },
      {
        label: "Venue Type",
        getDisplayValue: (hall) => getVenueCategoryLabel(hall?.category) || "Venue",
        getCompareValue: (hall) =>
          String(getVenueCategoryLabel(hall?.category) || "").trim(),
      },
      {
        label: "Location",
        getDisplayValue: (hall) => formatAddress(hall?.address),
        getCompareValue: (hall) => String(formatAddress(hall?.address) || "").trim(),
      },
    ],
  },
  {
    title: "Pricing",
    rows: [
      {
        label: "Starting Price",
        getDisplayValue: (hall) => formatPrice(hall),
        getCompareValue: (hall) => String(formatPrice(hall) || "").trim(),
      },
      {
        label: "Catering Policy",
        getDisplayValue: (hall) => getCateringPolicy(hall),
        getCompareValue: (hall) => String(getCateringPolicy(hall) || "").trim(),
      },
    ],
  },
  {
    title: "Capacity",
    rows: [
      {
        label: "Guest Capacity",
        getDisplayValue: (hall) => formatNumber(hall?.capacity),
        getCompareValue: (hall) => Number(hall?.capacity || 0),
      },
      {
        label: "Parking Capacity",
        getDisplayValue: (hall) => formatNumber(hall?.parkingCapacity),
        getCompareValue: (hall) => Number(hall?.parkingCapacity || 0),
      },
      {
        label: "Rooms",
        getDisplayValue: (hall) => formatNumber(hall?.rooms),
        getCompareValue: (hall) => Number(hall?.rooms || 0),
      },
    ],
  },
  {
    title: "Facilities",
    rows: [
      {
        label: "Air Conditioning",
        getDisplayValue: (hall) => formatBooleanFeature(getAirConditioningValue(hall)),
        getCompareValue: (hall) => String(getAirConditioningValue(hall)),
      },
      {
        label: "Stage",
        getDisplayValue: (hall) => formatBooleanFeature(getFeatureValue(hall, "stage")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "stage")),
      },
      {
        label: "Dining Hall",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "diningHall")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "diningHall")),
      },
      {
        label: "Outside Food",
        getDisplayValue: (hall) => formatBooleanFeature(getOutsideFoodValue(hall)),
        getCompareValue: (hall) => String(getOutsideFoodValue(hall)),
      },
      {
        label: "Outside Decorators",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getOutsideDecoratorsValue(hall)),
        getCompareValue: (hall) => String(getOutsideDecoratorsValue(hall)),
      },
      {
        label: "Outside DJ",
        getDisplayValue: (hall) => formatBooleanFeature(getOutsideDjValue(hall)),
        getCompareValue: (hall) => String(getOutsideDjValue(hall)),
      },
      {
        label: "Valet Parking",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "valetParking")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "valetParking")),
      },
      {
        label: "Restaurant",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "restaurant")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "restaurant")),
      },
      {
        label: "Room Service",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "roomService")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "roomService")),
      },
      {
        label: "Wheelchair Access",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "wheelchairAccessible")),
        getCompareValue: (hall) =>
          String(getFeatureValue(hall, "wheelchairAccessible")),
      },
      {
        label: "Free WiFi",
        getDisplayValue: (hall) =>
          formatBooleanFeature(getFeatureValue(hall, "freeWifi")),
        getCompareValue: (hall) => String(getFeatureValue(hall, "freeWifi")),
      },
    ],
  },
];

const isComparisonRowDifferent = (row, halls) => {
  const values = halls.map((hall) => {
    const value = row.getCompareValue(hall);
    return value === null || value === undefined || value === ""
      ? "__empty__"
      : String(value);
  });

  return new Set(values).size > 1;
};

const buildVenueLink = (hall) => `${getVenueRoute(hall?.category)}/${hall?._id}`;

const subscribeToCart = (callback) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCartUpdate = () => {
    callback();
  };

  window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);
  window.addEventListener("storage", handleCartUpdate);

  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    window.removeEventListener("storage", handleCartUpdate);
  };
};

export default function MyCartPage() {
  const cartItems = useSyncExternalStore(
    subscribeToCart,
    getHallCart,
    () => EMPTY_CART
  );
  const comparisonSectionRef = useRef(null);
  const [selectedHallIds, setSelectedHallIds] = useState([]);
  const [comparisonDataById, setComparisonDataById] = useState({});
  const [comparisonNotice, setComparisonNotice] = useState("");
  const [comparisonError, setComparisonError] = useState("");
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [hideCommonRows, setHideCommonRows] = useState(false);

  useEffect(() => {
    const cartHallIds = new Set(
      cartItems.map((hall) => String(hall?._id || "")).filter(Boolean)
    );

    setSelectedHallIds((current) =>
      current.filter((hallId) => cartHallIds.has(hallId)).slice(0, MAX_COMPARE_ITEMS)
    );
  }, [cartItems]);

  useEffect(() => {
    if (selectedHallIds.length === 0) {
      setComparisonError("");
      setComparisonLoading(false);
      return undefined;
    }

    const missingHallIds = selectedHallIds.filter(
      (hallId) => !comparisonDataById[hallId]
    );

    if (missingHallIds.length === 0) {
      setComparisonLoading(false);
      return undefined;
    }

    let isCancelled = false;

    const loadComparisonData = async () => {
      setComparisonLoading(true);

      try {
        const responses = await Promise.all(
          missingHallIds.map(async (hallId) => {
            const response = await fetch(`${getApiBaseUrl()}/api/halls/${hallId}`, {
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error(`Failed to load hall ${hallId}`);
            }

            const payload = await response.json();
            return [hallId, payload];
          })
        );

        if (isCancelled) {
          return;
        }

        setComparisonDataById((current) => {
          const nextState = { ...current };
          responses.forEach(([hallId, hallData]) => {
            nextState[hallId] = hallData;
          });
          return nextState;
        });
        setComparisonError("");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error("Failed to load comparison data", error);
        setComparisonError(
          "We could not load the latest venue specs, so the comparison is using saved cart data for some halls."
        );
      } finally {
        if (!isCancelled) {
          setComparisonLoading(false);
        }
      }
    };

    loadComparisonData();

    return () => {
      isCancelled = true;
    };
  }, [selectedHallIds, comparisonDataById]);

  const selectedComparisonHalls = selectedHallIds
    .map((hallId) => {
      const cartHall = cartItems.find((item) => String(item?._id || "") === hallId);

      if (!cartHall) {
        return null;
      }

      const latestHallData = comparisonDataById[hallId];
      return latestHallData
        ? {
            ...cartHall,
            ...latestHallData,
            address: latestHallData.address || cartHall.address,
            images: latestHallData.images || cartHall.images,
            features: latestHallData.features || cartHall.features,
          }
        : cartHall;
    })
    .filter(Boolean);

  const comparisonSections = getComparisonSections()
    .map((section) => ({
      ...section,
      rows: hideCommonRows
        ? section.rows.filter((row) => isComparisonRowDifferent(row, selectedComparisonHalls))
        : section.rows,
    }))
    .filter((section) => section.rows.length > 0);

  const handleRemove = (hallId) => {
    removeHallFromCart(hallId);
    setComparisonNotice("");
  };

  const handleCompareToggle = (hallId) => {
    const normalizedHallId = String(hallId || "").trim();

    if (!normalizedHallId) {
      return;
    }

    setSelectedHallIds((current) => {
      if (current.includes(normalizedHallId)) {
        setComparisonNotice("");
        return current.filter((item) => item !== normalizedHallId);
      }

      if (current.length >= MAX_COMPARE_ITEMS) {
        setComparisonNotice("You can compare up to 3 halls at once.");
        return current;
      }

      setComparisonNotice(
        current.length === 0
          ? "Pick one more hall to unlock the full side-by-side comparison."
          : ""
      );

      return [...current, normalizedHallId];
    });
  };

  const handleCompareNow = () => {
    if (selectedComparisonHalls.length < 2) {
      setComparisonNotice("Select at least 2 halls to compare them side by side.");
      return;
    }

    comparisonSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const clearComparedHalls = () => {
    setSelectedHallIds([]);
    setComparisonNotice("");
    setComparisonError("");
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1>My Cart</h1>
        <p>
          Save halls here, compare them later, and jump back into booking
          whenever you are ready.
        </p>
      </section>

      {cartItems.length > 1 ? (
        <section className={styles.compareDock}>
          <div>
            <p className={styles.compareEyebrow}>Compare Halls</p>
            <h2>Build your shortlist before you book</h2>
            <p className={styles.infoText}>
              Select up to 3 halls for a side-by-side venue comparison with
              pricing, capacity, and feature highlights.
            </p>
          </div>

          <div className={styles.compareDockActions}>
            <span className={styles.compareCount}>
              {selectedHallIds.length}/{MAX_COMPARE_ITEMS} selected
            </span>
            <button
              type="button"
              className={styles.compareButton}
              onClick={handleCompareNow}
            >
              Compare Now
            </button>
            {selectedHallIds.length > 0 ? (
              <button
                type="button"
                className={styles.compareGhostButton}
                onClick={clearComparedHalls}
              >
                Clear
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {comparisonNotice ? (
        <p className={styles.compareNotice}>{comparisonNotice}</p>
      ) : null}

      <section ref={comparisonSectionRef} className={styles.comparePanel}>
        <div className={styles.comparePanelHeader}>
          <div>
            <p className={styles.compareEyebrow}>Comparison Studio</p>
            <h2>See your favorite halls side by side</h2>
            <p className={styles.infoText}>
              Best Choice blends price, capacity, rooms, parking, and listed
              venue amenities into one quick shortlist signal.
            </p>
          </div>

          <label className={styles.compareToggle}>
            <input
              type="checkbox"
              checked={hideCommonRows}
              onChange={(event) => setHideCommonRows(event.target.checked)}
            />
            <span>Hide common features</span>
          </label>
        </div>

        {selectedComparisonHalls.length === 0 ? (
          <div className={styles.compareEmptyState}>
            <h3>Select halls from your cart</h3>
            <p>
              Use the Compare toggle on each card. Once you choose 2 or 3 halls,
              the full venue comparison table appears here.
            </p>
          </div>
        ) : null}

        {selectedComparisonHalls.length > 0 ? (
          <div className={styles.compareCards}>
            {selectedComparisonHalls.map((hall) => {
              const hallBadges = getHallBadges(hall, selectedComparisonHalls);
              const imageUrl = toAbsoluteImageUrl(hall?.images?.[0]);
              const venueLink = buildVenueLink(hall);

              return (
                <article key={hall._id} className={styles.compareCard}>
                  <div className={styles.compareCardImageWrap}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={hall.hallName || "Venue"}
                        className={styles.compareCardImage}
                      />
                    ) : (
                      <div className={styles.compareCardFallback}>No image</div>
                    )}
                  </div>

                  <div className={styles.compareCardBody}>
                    <div className={styles.compareBadgeRow}>
                      {hallBadges.length > 0
                        ? hallBadges.map((badge) => (
                            <span
                              key={`${hall._id}-${badge.label}`}
                              className={`${styles.compareBadge} ${
                                badge.tone === "best"
                                  ? styles.compareBadgeBest
                                  : badge.tone === "budget"
                                  ? styles.compareBadgeBudget
                                  : badge.tone === "capacity"
                                  ? styles.compareBadgeCapacity
                                  : styles.compareBadgeFeature
                              }`}
                            >
                              {badge.label}
                            </span>
                          ))
                        : (
                          <span className={styles.compareBadgeMuted}>
                            Shortlisted
                          </span>
                        )}
                    </div>

                    <h3>{hall.hallName || "Venue"}</h3>
                    <p className={styles.compareCardPrice}>{formatPrice(hall)}</p>
                    <p className={styles.compareCardLocation}>
                      {formatAddress(hall.address)}
                    </p>

                    <div className={styles.compareCardActions}>
                      <Link href={venueLink} className={styles.compareCardLink}>
                        View Details
                      </Link>
                      <button
                        type="button"
                        className={styles.compareCardRemove}
                        onClick={() => handleCompareToggle(hall._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {comparisonLoading ? (
          <p className={styles.compareLoading}>Loading the latest hall details...</p>
        ) : null}

        {comparisonError ? (
          <p className={styles.compareError}>{comparisonError}</p>
        ) : null}

        {selectedComparisonHalls.length >= 2 && comparisonSections.length === 0 ? (
          <p className={styles.compareTableEmpty}>
            These halls match on the currently visible comparison fields.
            Switch off Hide common features to see the full table again.
          </p>
        ) : null}

        {selectedComparisonHalls.length >= 2 && comparisonSections.length > 0 ? (
          <div className={styles.comparisonTableWrap}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {selectedComparisonHalls.map((hall) => (
                    <th key={`comparison-head-${hall._id}`} scope="col">
                      {hall.hallName || "Venue"}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonSections.map((section) => (
                  <Fragment key={section.title}>
                    <tr className={styles.comparisonSectionRow}>
                      <th colSpan={selectedComparisonHalls.length + 1} scope="colgroup">
                        {section.title}
                      </th>
                    </tr>

                    {section.rows.map((row) => {
                      const rowHasDifference = isComparisonRowDifferent(
                        row,
                        selectedComparisonHalls
                      );

                      return (
                        <tr
                          key={`${section.title}-${row.label}`}
                          className={
                            rowHasDifference ? styles.comparisonDifferenceRow : ""
                          }
                        >
                          <th scope="row">{row.label}</th>
                          {selectedComparisonHalls.map((hall) => (
                            <td key={`${hall._id}-${row.label}`}>
                              {row.getDisplayValue(hall)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className={styles.panel}>
        {cartItems.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Your cart is empty</h2>
            <p>
              Open any venue detail page and use the new Add to Cart button to
              save halls here.
            </p>
            <Link href="/dashboard" className={styles.emptyAction}>
              Browse Venues
            </Link>
          </div>
        ) : null}

        {cartItems.map((hall) => {
          const imageUrl = toAbsoluteImageUrl(hall?.images?.[0]);
          const venueLink = buildVenueLink(hall);
          const isSelectedForComparison = selectedHallIds.includes(
            String(hall?._id || "")
          );

          return (
            <article key={hall._id} className={styles.cartCard}>
              <div className={styles.imageWrap}>
                {imageUrl ? (
                  <img src={imageUrl} alt={hall.hallName || "Venue"} />
                ) : (
                  <div className={styles.imageFallback}>No image</div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.category}>
                      {getVenueCategoryLabel(hall.category) || "Venue"}
                    </p>
                    <h2>{hall.hallName || "Venue"}</h2>
                  </div>

                  <div className={styles.cardTopActions}>
                    <p className={styles.price}>{formatPrice(hall)}</p>
                    <button
                      type="button"
                      className={
                        isSelectedForComparison
                          ? styles.compareToggleActive
                          : styles.compareToggleButton
                      }
                      onClick={() => handleCompareToggle(hall._id)}
                    >
                      {isSelectedForComparison ? "Selected" : "Add to Compare"}
                    </button>
                  </div>
                </div>

                <p className={styles.address}>{formatAddress(hall.address)}</p>

                <div className={styles.meta}>
                  <span>Guests: {formatNumber(hall.capacity)}</span>
                  <span>Parking: {formatNumber(hall.parkingCapacity)}</span>
                  <span>Rooms: {formatNumber(hall.rooms)}</span>
                </div>

                <div className={styles.actions}>
                  <Link href={venueLink} className={styles.secondaryAction}>
                    View Details
                  </Link>
                  <Link
                    href={`/booking/${hall._id}`}
                    className={styles.primaryAction}
                  >
                    Book Now
                  </Link>
                  <button
                    type="button"
                    className={styles.removeAction}
                    onClick={() => handleRemove(hall._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
