"use client";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import { Marker, useMap } from "react-leaflet";

const venuePinIcon = divIcon({
  className: "custom-venue-pin-wrapper",
  html: '<span class="custom-venue-pin"></span>',
  iconSize: [26, 38],
  iconAnchor: [13, 38],
});

export default function VenueMapMarker({ position, setGeoLocation }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof position?.lat === "number" &&
      typeof position?.lng === "number"
    ) {
      map.setView(position, 15, { animate: true });
    }
  }, [map, position]);

  return (
    <Marker
      position={position}
      icon={venuePinIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          setGeoLocation(e.target.getLatLng());
        },
      }}
    />
  );
}
