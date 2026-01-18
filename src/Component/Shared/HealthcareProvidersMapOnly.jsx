// src/Component/Shared/HealthcareProvidersMapOnly.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  Box,
  Paper,
  Typography,
  Button,
} from "@mui/material";

// ✅ Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Professional custom markers for different provider types
const createCustomIcon = (color, iconType) => {
  const icons = {
    CLINIC: '🏥',
    DOCTOR: '👨‍⚕️',
    PHARMACY: '💊',
    LAB: '🔬',
    RADIOLOGY: '🩻',
  };
  
  return L.divIcon({
    className: 'custom-marker-professional',
    html: `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3), 0 0 0 3px ${color}22;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <div style="
            font-size: 18px;
            transform: rotate(45deg);
          ">${icons[iconType] || '📍'}</div>
        </div>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 10px solid ${color};
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
        "></div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

const HealthcareProvidersMapOnly = memo(({ filteredProviders }) => {
  // ✅ Get marker icon based on provider type - memoized
  const getMarkerIcon = useMemo(() => (type) => {
    const colors = {
      CLINIC: "#556B2F",
      DOCTOR: "#556B2F",
      PHARMACY: "#7B8B5E",
      LAB: "#8B9A46",
      RADIOLOGY: "#3D4F23",
    };
    return createCustomIcon(colors[type] || "#556B2F", type);
  }, []);

  // Default center (Palestine - Center of West Bank) - memoized
  const defaultCenter = [32.0, 35.2];
  const mapCenter = useMemo(() =>
    filteredProviders.length > 0
      ? [filteredProviders[0].locationLat, filteredProviders[0].locationLng]
      : defaultCenter,
    [filteredProviders]
  );

  return (
    <Box sx={{ px: 4, mb: 5 }}>
      {/* ✅ Map Legend - Professional Design */}
      <Paper
        elevation={6}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #FAF8F5 0%, #e9ecef 100%)",
          border: "2px solid #dee2e6",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            mb: 2.5,
            color: "#556B2F",
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.1rem",
          }}
        >
          🗺️ Map Legend
        </Typography>
        <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", justifyContent: "space-around" }}>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: "rgba(85, 107, 47, 0.08)",
              border: "1px solid rgba(85, 107, 47, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(85, 107, 47, 0.2)",
              }
            }}
          >
            <Box sx={{
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              🏥
            </Box>
            <Typography variant="body2" sx={{ color: "#556B2F", fontWeight: 700, fontSize: "0.95rem" }}>
              Clinics
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: "rgba(85, 107, 47, 0.08)",
              border: "1px solid rgba(85, 107, 47, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(85, 107, 47, 0.2)",
              }
            }}
          >
            <Box sx={{
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              👨‍⚕️
            </Box>
            <Typography variant="body2" sx={{ color: "#556B2F", fontWeight: 700, fontSize: "0.95rem" }}>
              Doctors
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: "rgba(123, 139, 94, 0.08)",
              border: "1px solid rgba(123, 139, 94, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(123, 139, 94, 0.2)",
              }
            }}
          >
            <Box sx={{
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              💊
            </Box>
            <Typography variant="body2" sx={{ color: "#7B8B5E", fontWeight: 700, fontSize: "0.95rem" }}>
              Pharmacies
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: "rgba(139, 154, 70, 0.08)",
              border: "1px solid rgba(139, 154, 70, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(139, 154, 70, 0.2)",
              }
            }}
          >
            <Box sx={{
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              🔬
            </Box>
            <Typography variant="body2" sx={{ color: "#8B9A46", fontWeight: 700, fontSize: "0.95rem" }}>
              Laboratories
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: "rgba(61, 79, 35, 0.08)",
              border: "1px solid rgba(61, 79, 35, 0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(61, 79, 35, 0.2)",
              }
            }}
          >
            <Box sx={{
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            }}>
              🩻
            </Box>
            <Typography variant="body2" sx={{ color: "#3D4F23", fontWeight: 700, fontSize: "0.95rem" }}>
              Radiology
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ✅ Map */}
      <Paper
        elevation={6}
        sx={{
          borderRadius: "0 0 16px 16px",
          overflow: "hidden",
          height: 600,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <MapContainer
          center={mapCenter}
          zoom={8}
          minZoom={7.5}
          maxZoom={18}
          style={{ height: "100%", width: "100%" }}
          bounds={[
            [31.35, 34.88], // Southwest (Hebron area - no sea)
            [32.58, 35.57]  // Northeast (Jenin area)
          ]}
          maxBounds={[
            [31.2, 34.8],   // Tight boundary - West Bank only
            [32.7, 35.65]   // Tight boundary - includes north
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {filteredProviders.map((provider) => (
            <Marker
              key={provider.id}
              position={[provider.locationLat, provider.locationLng]}
              icon={getMarkerIcon(provider.type)}
            >
              <Popup maxWidth={320} className="custom-popup">
                <Box 
                  sx={{ 
                    p: 2.5, 
                    minWidth: 280,
                    background: "linear-gradient(135deg, #ffffff 0%, #FAF8F5 100%)",
                    borderRadius: 2,
                  }}
                >
                  {/* Header with Icon */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      fontSize: "32px",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                    }}>
                      {provider.type === "CLINIC" && "🏥"}
                      {provider.type === "DOCTOR" && "👨‍⚕️"}
                      {provider.type === "PHARMACY" && "💊"}
                      {provider.type === "LAB" && "🔬"}
                      {provider.type === "RADIOLOGY" && "🩻"}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          color: "#556B2F",
                          fontSize: "1.1rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {provider.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "#6c757d",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {provider.type}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Details */}
                  <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#495057", fontWeight: 600, minWidth: "60px" }}>
                        📍 Address:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#212529", flex: 1 }}>
                        {provider.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#495057", fontWeight: 600, minWidth: "60px" }}>
                        📞 Contact:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#212529", flex: 1 }}>
                        {provider.contactInfo}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#495057", fontWeight: 600, minWidth: "60px" }}>
                        👤 Owner:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#212529", flex: 1 }}>
                        {provider.ownerName}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  {provider.description && (
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        mb: 2,
                        borderRadius: 2,
                        background: "rgba(85, 107, 47, 0.05)",
                        border: "1px solid rgba(85, 107, 47, 0.1)",
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#495057",
                          fontStyle: "italic",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                        }}
                      >
                        💬 {provider.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Get Directions Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="medium"
                    sx={{
                      py: 1.2,
                      background: "linear-gradient(90deg, #556B2F 0%, #7B8B5E 100%)",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      textTransform: "none",
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(85, 107, 47, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #3D4F23, #556B2F)",
                        boxShadow: "0 6px 16px rgba(85, 107, 47, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${provider.locationLat},${provider.locationLng}`,
                        "_blank"
                      )
                    }
                  >
                    🧭 Get Directions
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>
    </Box>
  );
});

HealthcareProvidersMapOnly.propTypes = {
  filteredProviders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      type: PropTypes.string,
      address: PropTypes.string,
      contactInfo: PropTypes.string,
      ownerName: PropTypes.string,
      description: PropTypes.string,
      locationLat: PropTypes.number,
      locationLng: PropTypes.number,
    })
  ).isRequired,
};

export default HealthcareProvidersMapOnly;

