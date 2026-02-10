"use client";

import { useMapEvents } from "react-leaflet";

export default function LocationPicker({ setGeoLocation }) {
  useMapEvents({
    click(e) {
      setGeoLocation(e.latlng);
    },
  });

  return null;
}
