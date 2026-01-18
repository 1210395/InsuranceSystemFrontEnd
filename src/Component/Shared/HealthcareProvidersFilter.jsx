// src/Component/Shared/HealthcareProvidersFilter.jsx
import React, { useMemo, memo } from "react";
import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";

const HealthcareProvidersFilter = memo(({ providers, providerFilter, setProviderFilter }) => {
  // Memoize provider counts to avoid recalculating on every render
  const counts = useMemo(() => ({
    all: providers.length,
    clinic: providers.filter(p => p.type === "CLINIC").length,
    doctor: providers.filter(p => p.type === "DOCTOR").length,
    pharmacy: providers.filter(p => p.type === "PHARMACY").length,
    lab: providers.filter(p => p.type === "LAB").length,
    radiology: providers.filter(p => p.type === "RADIOLOGY").length,
  }), [providers]);

  return (
    <Box
      sx={{
        px: 3,
        py: 4,
        background: "linear-gradient(90deg, #556B2F 0%, #7B8B5E 100%)",
        display: "flex",
        justifyContent: "center",
        width: "100%",
        borderRadius: "16px",
        mb: 4,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          variant={providerFilter === "ALL" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("ALL")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "ALL" ? "white" : "transparent",
            color: providerFilter === "ALL" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "ALL" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "ALL" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          🏢 All Providers ({counts.all})
        </Button>
        <Button
          variant={providerFilter === "CLINIC" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("CLINIC")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "CLINIC" ? "white" : "transparent",
            color: providerFilter === "CLINIC" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "CLINIC" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "CLINIC" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          🏥 Clinics ({counts.clinic})
        </Button>
        <Button
          variant={providerFilter === "DOCTOR" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("DOCTOR")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "DOCTOR" ? "white" : "transparent",
            color: providerFilter === "DOCTOR" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "DOCTOR" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "DOCTOR" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          👨‍⚕️ Doctors ({counts.doctor})
        </Button>
        <Button
          variant={providerFilter === "PHARMACY" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("PHARMACY")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "PHARMACY" ? "white" : "transparent",
            color: providerFilter === "PHARMACY" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "PHARMACY" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "PHARMACY" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          💊 Pharmacies ({counts.pharmacy})
        </Button>
        <Button
          variant={providerFilter === "LAB" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("LAB")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "LAB" ? "white" : "transparent",
            color: providerFilter === "LAB" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "LAB" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "LAB" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          🔬 Laboratories ({counts.lab})
        </Button>
        <Button
          variant={providerFilter === "RADIOLOGY" ? "contained" : "outlined"}
          onClick={() => setProviderFilter("RADIOLOGY")}
          sx={{
            px: 3,
            py: 1.2,
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            background: providerFilter === "RADIOLOGY" ? "white" : "transparent",
            color: providerFilter === "RADIOLOGY" ? "#556B2F" : "white",
            borderColor: "white",
            "&:hover": {
              background: providerFilter === "RADIOLOGY" ? "#f5f5f5" : "rgba(255, 255, 255, 0.15)",
              borderColor: "white",
            },
            boxShadow: providerFilter === "RADIOLOGY" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
          }}
        >
          🩻 Radiology ({counts.radiology})
        </Button>
      </Box>
    </Box>
  );
});

HealthcareProvidersFilter.propTypes = {
  providers: PropTypes.array.isRequired,
  providerFilter: PropTypes.string.isRequired,
  setProviderFilter: PropTypes.func.isRequired,
};

export default HealthcareProvidersFilter;








