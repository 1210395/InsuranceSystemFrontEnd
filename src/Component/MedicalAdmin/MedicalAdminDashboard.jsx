// src/Component/MedicalAdmin/MedicalAdminDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import Sidebar from "../MedicalAdmin/MedicalAdminSidebar";
import Header from "../MedicalAdmin/MedicalAdminHeader";
import HealthcareProvidersMapOnly from "../Shared/HealthcareProvidersMapOnly";
import HealthcareProvidersFilter from "../Shared/HealthcareProvidersFilter";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import logger from "../../utils/logger";

const MedicalAdminDashboard = () => {
  const { language, isRTL } = useLanguage();
  const [stats, setStats] = useState({
    doctors: 0,
    labs: 0,
    radiologists: 0,
    pharmacists: 0,
    total: 0,
    providersCount: 0,
    topDoctorName: "",
    claimCount: 0,
  });
  const [providers, setProviders] = useState([]);
  const [providerFilter, setProviderFilter] = useState("ALL");

  // ✅ Fetch all dashboard stats (single endpoint)
  const fetchDashboard = useCallback(async () => {
    try {
      // api.get() returns data directly, not wrapped in .data
      const data = await api.get("/api/medical-admin/dashboard");
      if (data) {
        setStats({
          doctors: data.doctors || 0,
          labs: data.labs || 0,
          radiologists: data.radiologists || 0,
          pharmacists: data.pharmacists || 0,
          total: data.total || 0,
          providersCount: data.providersCount || 0,
          topDoctorName: data.topDoctorName || "",
          claimCount: data.claimCount || 0,
        });
      }
    } catch (err) {
      logger.error("Failed to load dashboard data:", err);
    }
  }, []);

  // ✅ Fetch Healthcare Providers
  const fetchProviders = useCallback(async () => {
    try {
      // api.get() returns data directly, not wrapped in .data
      const data = await api.get(API_ENDPOINTS.SEARCH_PROFILES.APPROVED);
      const withLocations = (data || []).filter(
        (p) => p.locationLat && p.locationLng
      );
      setProviders(withLocations);
    } catch (err) {
      logger.error("Failed to load providers:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchProviders();
  }, [fetchDashboard, fetchProviders]);

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          background: "#FAF8F5",
          minHeight: "100vh",
          ml: isRTL ? 0 : "240px",
          mr: isRTL ? "240px" : 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        {/* Filter */}
        <Box sx={{ px: 4, mt: 3 }}>
          <HealthcareProvidersFilter 
            providers={providers}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
          />
        </Box>

        {/* 📊 Dashboard Stats */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t("medicalAdminDashboard", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("welcomeMedicalAdminDashboard", language)}
          </Typography>

          <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
            {/* 🥇 Top Doctor */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 5,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 55, mb: 1 }} />
                <Typography variant="h6">{t("topDoctor", language)}</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                  {stats.topDoctorName || t("noData", language)}
                </Typography>
                <Typography variant="body2">
                  {t("claims", language)}: {stats.claimCount}
                </Typography>
              </Paper>
            </Grid>

            {/* 👨‍⚕️ Providers Count */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 5,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #8B9A46 0%, #A8B56B 100%)",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
              >
                <GroupsIcon sx={{ fontSize: 55, mb: 1 }} />
                <Typography variant="h6">{t("totalProviders", language)}</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {stats.providersCount}
                </Typography>
              </Paper>
            </Grid>

            {/* 💊 Pharmacists */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 5,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #C9A646 0%, #DDB85C 100%)",
                  color: "#fff",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
              >
                <LocalPharmacyIcon sx={{ fontSize: 55, mb: 1 }} />
                <Typography variant="h6">{t("pharmacists", language)}</Typography>
                <Typography variant="h3" fontWeight="bold">
                  {stats.pharmacists}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* 🗺️ Map */}
        <Box sx={{ px: 4, mb: 4 }}>
          <HealthcareProvidersMapOnly 
            filteredProviders={providers.filter(p => 
              providerFilter === "ALL" || p.type === providerFilter
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MedicalAdminDashboard;
