"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Declare icon variables to be assigned later on the client-side
let floatIcon: L.Icon;
let selectedFloatIcon: L.Icon;

// This code block runs only on the client side, after the component has mounted
if (typeof window !== 'undefined') {
    // Fix for default icon paths
    // This is necessary because Next.js bundles can break the default icon URLs
    delete (L.Icon.Default as any).prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    floatIcon = new L.Icon({
        iconUrl: '/float-icon.svg',
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -25]
    });

    selectedFloatIcon = new L.Icon({
        iconUrl: '/float-icon-selected.svg',
        iconSize: [35, 35],
        iconAnchor: [17, 35],
        popupAnchor: [0, -35]
    });
}

// Custom hook to handle map view changes
const ChangeView = ({ center, zoom, transition }: { center: LatLngExpression; zoom: number; transition: 'fly' | 'instant' }) => {
  const map = useMap();
  useEffect(() => {
    // FIX: Add a check to ensure the map instance is defined before using it.
    if (map) { 
      if (transition === 'instant') {
        map.setView(center, zoom);
      } else {
        map.flyTo(center, zoom, { duration: 2 });
      }
    }
  }, [center, zoom, transition, map]);
  return null;
};

interface MapProps {
  center: LatLngExpression;
  zoom: number;
  selectedFloatId: number | null;
  onFloatSelect: (float: any) => void;
  transition: 'fly' | 'instant';
  floats: any[];
  theme: 'light' | 'dark';
}

export default function Map({ center, zoom, selectedFloatId, onFloatSelect, transition, floats, theme }: MapProps) {
  // We still need this check here for the main component's render logic
  if (typeof window === "undefined") return null;

  const lightTileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkTileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
      <ChangeView center={center} zoom={zoom} transition={transition} />
      
      {/* The key prop is crucial here. It forces React to re-render the TileLayer when the theme changes. */}
      <TileLayer
        key={theme} 
        url={theme === 'dark' ? darkTileUrl : lightTileUrl}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {floats.map((f) => (
          <React.Fragment key={f.id}>
            <Polyline positions={f.trajectory} color="#3b82f6" weight={2} opacity={0.7} />
            <Marker
              icon={selectedFloatId === f.id ? selectedFloatIcon : floatIcon}
              position={f.position}
              eventHandlers={{ click: () => onFloatSelect(f) }}
            >
              <Popup>
                <div className="text-sm">
                    <p className="font-bold text-base">Float #{f.platform_number}</p>
                    <p><strong>Project:</strong> {f.project_name}</p>
                    <p>Click marker to see details.</p>
                </div>
              </Popup>
            </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
}