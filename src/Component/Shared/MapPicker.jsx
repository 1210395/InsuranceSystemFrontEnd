import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix marker icons in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        📍 Selected Location<br />
        Lat: {position[0].toFixed(6)}<br />
        Lng: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

export function MapPicker({ open, onClose, onLocationSelect }) {
  const [selectedLat, setSelectedLat] = useState(null);
  const [selectedLng, setSelectedLng] = useState(null);
  const defaultPosition = [31.9454, 35.9284]; // Default to Jordan

  const handleLocationSelect = (lat, lng) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleConfirm = () => {
    if (selectedLat !== null && selectedLng !== null) {
      onLocationSelect(selectedLat, selectedLng);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#00897b" }}>
        🗺️ Select Your Location on Map
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 2 }}>
          Click on the map to select your location
        </Typography>
        <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden", border: "2px solid #00897b" }}>
          <MapContainer center={defaultPosition} zoom={8} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker onLocationSelect={handleLocationSelect} />
          </MapContainer>
        </Box>
        {selectedLat && selectedLng && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: "#E8F5E9", borderRadius: 2, border: "1px solid #4CAF50" }}>
            <Typography variant="body2" sx={{ color: "#2E7D32", fontWeight: 600 }}>
              ✅ Location Selected:
            </Typography>
            <Typography variant="caption" sx={{ color: "#558B2F", display: "block" }}>
              Latitude: {selectedLat.toFixed(6)}
            </Typography>
            <Typography variant="caption" sx={{ color: "#558B2F" }}>
              Longitude: {selectedLng.toFixed(6)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectedLat === null || selectedLng === null}
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #00897b, #00695c)",
            fontWeight: 600,
            "&:disabled": {
              background: "#ccc",
            },
          }}
        >
          ✅ Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}
