import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PolicyIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import axios from "axios";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ClaimsList = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ استدعاء API عند تحميل الصفحة
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/claims/allClaimsByManager",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClaims(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch claims:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
          pt: { xs: "56px", sm: 0 },
          transition: "margin 0.3s ease",
        }}
      >
        <Header />

        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#120460", display: "flex", alignItems: "center" }}
          >
            <AssignmentIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 35, color: "#1E8EAB" }} />
            {t("claimsList", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("reviewAllSubmittedClaims", language)}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {loading ? (
            <CircularProgress sx={{ color: "#120460" }} />
          ) : claims.length === 0 ? (
            <Typography>{t("noClaimsFound", language)}</Typography>
          ) : (
            claims.map((claim) => (
              <Paper
                key={claim.id}
                sx={{ p: 4, borderRadius: 3, boxShadow: 4, mb: 4 }}
              >
                <Grid container spacing={3}>
                  {/* General Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        {t("generalInformationTitle", language)}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, color: "#2E7D32" }} />
                          <Typography variant="body2">
                            <b>{t("memberLabel", language)}</b> {claim.memberName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PolicyIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, color: "#1565C0" }} />
                          <Typography variant="body2">
                            <b>{t("policyLabel", language)}</b> {claim.policyName}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          <b>{t("descriptionLabelColon", language)}</b> {claim.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Medical Details */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        {t("medicalDetails", language)}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          <b>{t("diagnosisLabel", language)}</b> {claim.diagnosis}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("treatmentLabel", language)}</b> {claim.treatmentDetails}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("providerLabel", language)}</b> {claim.providerName}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("doctorLabel", language)}</b> {claim.doctorName}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Financial Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        {t("financialServiceInfo", language)}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MonetizationOnIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, color: "#388E3C" }} />
                          <Typography variant="body2">
                            <b>{t("amountLabel", language)}</b> ${claim.amount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <EventIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, color: "#FF9800" }} />
                          <Typography variant="body2">
                            <b>{t("serviceDateLabel", language)}</b> {claim.serviceDate}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Status & Metadata */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        {t("statusMetadata", language)}
                      </Typography>
                      <Stack spacing={1.5}>
                        <Chip
                          label={claim.status}
                          color={
                            claim.status === "APPROVED"
                              ? "success"
                              : claim.status === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          sx={{ fontWeight: "bold", width: "fit-content" }}
                        />
                        <Typography variant="body2">
                          <b>{t("submittedAtLabel", language)}</b>{" "}
                          {claim.submittedAt
                            ? new Date(claim.submittedAt).toLocaleString()
                            : "—"}
                        </Typography>
                        {claim.approvedAt && (
                          <Typography variant="body2" color="success.main">
                            <b>{t("approvedAtLabel", language)}</b>{" "}
                            {new Date(claim.approvedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectedAt && (
                          <Typography variant="body2" color="error">
                            <b>{t("rejectedAtLabel", language)}</b>{" "}
                            {new Date(claim.rejectedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectionReason && (
                          <Typography variant="body2" color="error">
                            <b>{t("reasonLabel", language)}</b> {claim.rejectionReason}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimsList;
