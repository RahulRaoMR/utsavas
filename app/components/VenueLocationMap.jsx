"use client";

import { useEffect } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { INDIA_MAP_CENTER, normalizeLocation } from "../../lib/hallLocation";

const venuePinIcon = divIcon({
  className: "custom-venue-pin-wrapper",
  html: '<span class="custom-venue-pin"></span>',
  iconSize: [26, 38],
  iconAnchor: [13, 38],
});

function MapInteractions({
  fallbackCenter,
  fallbackZoom,
  onChange,
  position,
  selectedZoom,
}) {
  const map = useMap();

  useMapEvents({
    click(event) {
      onChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  useEffect(() => {
    const nextCenter =
      normalizeLocation(position) ||
      normalizeLocation(fallbackCenter) ||
      INDIA_MAP_CENTER;

    map.setView(
      [nextCenter.lat, nextCenter.lng],
      normalizeLocation(position) ? selectedZoom : fallbackZoom,
      { animate: true }
    );
  }, [
    fallbackCenter,
    fallbackZoom,
    map,
    position,
    selectedZoom,
  ]);

  return null;
}

export default function VenueLocationMap({
  fallbackCenter = INDIA_MAP_CENTER,
  fallbackZoom = 5,
  onChange,
  position,
  selectedZoom = 15,
}) {
  const selectedLocation = normalizeLocation(position);
  const initialCenter =
    normalizeLocation(position) ||
    normalizeLocation(fallbackCenter) ||
    INDIA_MAP_CENTER;

  return (
    <div
      className="venue-location-map-shell"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={selectedLocation ? selectedZoom : fallbackZoom}
        scrollWheelZoom
        className="venue-location-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInteractions
          fallbackCenter={fallbackCenter}
          fallbackZoom={fallbackZoom}
          onChange={onChange}
          position={position}
          selectedZoom={selectedZoom}
        />

        {selectedLocation ? (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={venuePinIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const nextPoint = event.target.getLatLng();
                onChange({
                  lat: nextPoint.lat,
                  lng: nextPoint.lng,
                });
              },
            }}
          />
        ) : null}
      </MapContainer>

      <div
        className="venue-location-map-stamp"
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "12px",
          bottom: "10px",
          zIndex: 800,
          padding: "4px 8px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.92)",
          color: "#4b5a46",
          fontSize: "12px",
          lineHeight: 1,
          boxShadow: "0 4px 14px rgba(48, 64, 47, 0.14)",
          pointerEvents: "none",
        }}
      >
        Map data 2026
      </div>
    </div>
  );
}
