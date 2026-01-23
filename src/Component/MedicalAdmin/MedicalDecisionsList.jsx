// src/Component/MedicalAdmin/MedicalFinalDecisions.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Snackbar,
  Alert,
} from "@mui/material";

import Header from "../MedicalAdmin/MedicalAdminHeader";
import Sidebar from "../MedicalAdmin/MedicalAdminSidebar";

import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PersonIcon from "@mui/icons-material/Person";

import { api } from "../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import logger from "../../utils/logger";
import { t } from "../../config/translations";
import { sanitizeString } from "../../utils/sanitize";

const MedicalFinalDecisions = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
const [_badgesCleared, setBadgesCleared] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [selectedTab, setSelectedTab] = useState(0);

  // TAB CONFIG
  const claimTabs = [
    { label: t("doctorClaims", language), role: "DOCTOR", icon: <LocalHospitalIcon /> },
    { label: t("pharmacyClaims", language), role: "PHARMACIST", icon: <MedicationIcon /> },
    { label: t("labClaims", language), role: "LAB_TECH", icon: <BiotechIcon /> },
    {
      label: t("radiologyClaims", language),
      role: "RADIOLOGIST",
      icon: <MonitorHeartIcon />,
    },
    {
      label: t("clientClaims", language),
      role: "INSURANCE_CLIENT",
      icon: <PersonIcon />,
    },
  ];

  useEffect(() => {
  const fetchClaims = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.FINAL_DECISIONS);
      const claimsData = res || [];

      const sorted = claimsData.sort(
        (a, b) =>
          new Date(b.approvedAt || b.rejectedAt || b.submittedAt) -
          new Date(a.approvedAt || a.rejectedAt || a.submittedAt)
      );

      setClaims(sorted);

      // ⭐⭐ أهم سطر — تصفير البادجات بعد تحميل الصفحة
      setBadgesCleared(true);

    } catch (err) {
      logger.error("Failed to load final decisions:", err);
      setSnackbar({
        open: true,
        message: t("failedLoadClaims", language),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchClaims();
}, []);


  // TIME FORMATTER
  const timeSince = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };

  const parseRoleSpecificData = (roleSpecificData) => {
    if (!roleSpecificData) return null;
    if (typeof roleSpecificData === "object") return roleSpecificData;
    if (typeof roleSpecificData !== "string") return null;
    try {
      return JSON.parse(roleSpecificData);
    } catch {
      return null;
    }
  };

 const getStatusChip = (status) => {
  switch (status) {
    case "APPROVED_FINAL":
      return { color: "success", label: `${t("approvedFinal", language)} ✔` };

    case "REJECTED_FINAL":
      return { color: "error", label: `${t("rejectedFinal", language)} ✖` };

    case "PENDING_MEDICAL":
      return { color: "info", label: `${t("pendingMedicalReview", language)} 🩺` };

    case "RETURNED_FOR_REVIEW":
      return { color: "warning", label: `${t("returnedForReview", language)} 🔄` };

    default:
      return { color: "default", label: status };
  }
};


  // FILTER CLAIMS
  const filteredClaims = claims
    .filter((c) => c.providerRole === claimTabs[selectedTab].role)
    .filter((claim) => {
      const matchesSearch =
        claim.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#FAF8F5",
          minHeight: "100vh",
          ml: isRTL ? 0 : "240px",
          mr: isRTL ? "240px" : 0,
        }}
      >
        <Header />

        <Box sx={{ p: 4 }}>
          {/* PAGE TITLE */}
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#3D4F23", mb: 1 }}>
            <AssignmentIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 35 }} />
            {t("finalMedicalDecisions", language)}
          </Typography>

          <Typography sx={{ color: "#6B7280", mb: 4 }}>
            {t("viewApprovedRejectedClaims", language)}
          </Typography>

          {/* TABS */}
          <Tabs
            value={selectedTab}
            onChange={(e, v) => setSelectedTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 3,
              "& .MuiTab-root": { fontWeight: "bold", textTransform: "none", minHeight: 50 },
            }}
          >
            {claimTabs.map((t, index) => (
              <Tab
                key={index}
                icon={
                 <Badge
  badgeContent={claims.filter((c) => c.providerRole === t.role).length}
  sx={{
    "& .MuiBadge-badge": {
      backgroundColor: "#556B2F",
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: "0.75rem",
      minWidth: "20px",
      height: "20px",
    },
  }}
>
  {t.icon}
</Badge>

                }
                iconPosition="start"
                label={t.label}
              />
            ))}
          </Tabs>

          {/* FILTER BAR */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              gap: 2,
              alignItems: "center",
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <TextField
              label={t("searchByPatientName", language)}
              size="small"
              sx={{ minWidth: 250 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{t("status", language)}</InputLabel>
              <Select
                value={statusFilter}
                label={t("status", language)}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">{t("all", language)}</MenuItem>
               <MenuItem value="APPROVED_FINAL">{t("approved", language)}</MenuItem>
<MenuItem value="REJECTED_FINAL">{t("rejected", language)}</MenuItem>
<MenuItem value="PENDING_MEDICAL">{t("pendingMedical", language)}</MenuItem>
<MenuItem value="RETURNED_FOR_REVIEW">{t("returnedForReview", language)}</MenuItem>

              </Select>
            </FormControl>
          </Paper>

          {/* RESULTS */}
          {loading ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : filteredClaims.length === 0 ? (
            <Typography sx={{ textAlign: "center", mt: 5, color: "#777" }}>
              {t("noClaimsFound", language)}
            </Typography>
          ) : (
            filteredClaims.map((claim) => {
              const statusInfo = getStatusChip(claim.status);
              const roleData = parseRoleSpecificData(claim.roleSpecificData);
              const pharmacyItems =
                claim.providerRole === "PHARMACIST" ? roleData?.items : null;
              const isChronicPrescription = roleData?.isChronic === true; // ✅ للوصفات المزمنة
              const labTestName =
                claim.providerRole === "LAB_TECH" ? roleData?.testName : null;
              const radiologyTestName =
                claim.providerRole === "RADIOLOGIST" ? roleData?.testName : null;

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: "#FFFFFF",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                    borderLeft: `8px solid ${
                      statusInfo.color === "success"
                        ? "#556B2F"
                        : statusInfo.color === "info"
                        ? "#7B8B5E"
                        : statusInfo.color === "warning"
                        ? "#A8B56B"
                        : "#E53935"
                    }`,
                  }}
                >
                  <Grid container spacing={3}>
                    {/* MEDICAL DETAILS */}
                    <Grid item xs={12} md={6}>
                      <Typography fontWeight="bold" sx={{ color: "#3D4F23", mb: 1 }}>
                        {t("medicalDetails", language)}
                      </Typography>

                      <Stack spacing={1.2}>
                        <Typography>
                          <b>{t("diagnosis", language)}:</b> {claim.diagnosis || t("notAvailable", language)}
                        </Typography>
                        <Typography>
                          <b>{t("treatment", language)}:</b> {claim.treatmentDetails || t("notAvailable", language)}
                        </Typography>
                        
                        {/* Provider Information */}
                        <Box sx={{ mb: 1.5 }}>
<Typography
  component="div"
  sx={{
    fontWeight: "bold",
    mb: 1,
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
                            <ScienceIcon fontSize="small" />
                            {t("providerInformation", language)}
                            {claim.providerRole === "INSURANCE_CLIENT" && (
                              <Chip
                                label={t("outsideInsuranceNetwork", language)}
                                size="small"
                                color="warning"
                                sx={{
                                  ml: 1,
                                  fontWeight: "bold",
                                  fontSize: "0.7rem",
                                  height: 22,
                                }}
                              />
                            )}
                          </Typography>
                          <Box sx={{ ml: 3, pl: 2, borderLeft: claim.providerRole === "INSURANCE_CLIENT" ? "2px solid #FFA500" : "2px solid #556B2F" }}>
                            {claim.providerRole === "INSURANCE_CLIENT" ? (
                              // Client claim - show provider and doctor name from outside network
                              <>
                                <Typography>
                                  <b>Provider Name:</b> {claim.providerName || "N/A"}
                                </Typography>
                                {claim.doctorName && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Doctor Name:</b> {claim.doctorName}
                                  </Typography>
                                )}
                                <Typography sx={{ mt: 0.5, fontStyle: "italic", color: "#f59e0b" }}>
                                  <b>Note:</b> This claim is from a provider outside the insurance network
                                </Typography>
                              </>
                            ) : (
                              // Regular provider claim
                              <>
                                <Typography>
                                  <b>Name:</b> {claim.providerName || "N/A"}
                                </Typography>
                                {claim.providerRole && (
                                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography component="span">
                                      <b>Role:</b>
                                    </Typography>
                                    <Chip
                                      label={claim.providerRole}
                                      size="small"
                                      color="primary"
                                      sx={{
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        height: 20,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  </Box>
                                )}
                                <Typography sx={{ mt: 0.5 }}>
                                  <b>Employee ID:</b> {claim.providerEmployeeId || "N/A"}
                                </Typography>
                                {claim.providerNationalId && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>National ID:</b> {claim.providerNationalId}
                                  </Typography>
                                )}
                                {claim.providerRole === "DOCTOR" && claim.providerSpecialization && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Specialization:</b> {claim.providerSpecialization}
                                  </Typography>
                                )}
                                {claim.providerRole === "PHARMACIST" && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Pharmacy Code:</b> {claim.providerPharmacyCode ? claim.providerPharmacyCode : "N/A"}
                                  </Typography>
                                )}
                                {claim.providerRole === "LAB_TECH" && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Lab Code:</b> {claim.providerLabCode ? claim.providerLabCode : "N/A"}
                                  </Typography>
                                )}
                                {claim.providerRole === "RADIOLOGIST" && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Radiology Code:</b> {claim.providerRadiologyCode ? claim.providerRadiologyCode : "N/A"}
                                  </Typography>
                                )}
                              </>
                            )}
                          </Box>
                        </Box>

                        {/* Description Section */}
                        {(claim.description || 
                          (pharmacyItems && pharmacyItems.length > 0) ||
                          labTestName ||
                          radiologyTestName) && (
                          <Box sx={{ mt: 1 }}>
                            <Box
                              component="div"
                              sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: 2,
                                whiteSpace: "pre-wrap",
                                fontSize: "0.95rem",
                                color: "#333",
                                border: claim.providerRole === "INSURANCE_CLIENT"
                                  ? "1px solid #FFA500"
                                  : "none",
                                bgcolor: claim.providerRole === "INSURANCE_CLIENT"
                                  ? "#FFF8E1"
                                  : "#E8EDE0",
                              }}
                            >
                              {/* Description */}
                              {claim.description && (
                                <Typography component="div" sx={{ mb: (labTestName || radiologyTestName || (pharmacyItems && pharmacyItems.length > 0)) ? 0 : 0 }}>
                                  {claim.providerRole === "INSURANCE_CLIENT" ? (
                                    sanitizeString(claim.description)
                                  ) : (
                                    <>
                                      <b>Description:</b> {sanitizeString(claim.description)}
                                    </>
                                  )}
                                </Typography>
                              )}

                              {/* Divider before additional information */}
                              {claim.description && (labTestName || radiologyTestName || (pharmacyItems && pharmacyItems.length > 0)) && (
                                <Divider sx={{ my: 1.5 }} />
                              )}

                              {/* Lab Test Name */}
                              {labTestName && (
                                <Typography component="div" sx={{ mb: radiologyTestName || (pharmacyItems && pharmacyItems.length > 0) ? 1.5 : 0 }}>
                                  <b>Test Name:</b> {labTestName}
                                </Typography>
                              )}

                              {/* Radiology Test Name */}
                              {radiologyTestName && (
                                <Typography component="div" sx={{ mb: (pharmacyItems && pharmacyItems.length > 0) ? 1.5 : 0 }}>
                                  <b>Test Name:</b> {radiologyTestName}
                                </Typography>
                              )}

                              {/* Pharmacist Medicines with Dosage */}
                              {claim.providerRole === "PHARMACIST" &&
                                Array.isArray(pharmacyItems) &&
                                pharmacyItems.length > 0 && (
                                  <Box>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                      <Typography sx={{ fontWeight: "bold" }}>
                                        Medicines:
                                      </Typography>
                                      {/* ✅ عرض علامة Chronic Disease للمدير الطبي */}
                                      {isChronicPrescription && (
                                        <Chip
                                          label="CHRONIC DISEASE"
                                          size="small"
                                          sx={{
                                            bgcolor: "#dc2626",
                                            color: "white",
                                            fontWeight: "700",
                                            fontSize: "0.7rem",
                                            height: 22,
                                            border: "2px solid #991b1b",
                                          }}
                                          icon={
                                            <Box component="span" sx={{ fontSize: "10px", ml: 0.5 }}>
                                              ⚠️
                                            </Box>
                                          }
                                        />
                                      )}
                                    </Stack>
                                    <Box
                                      component="ul"
                                      sx={{
                                        m: 0,
                                        pl: 2.5,
                                        whiteSpace: "normal",
                                        listStyle: "none",
                                      }}
                                    >
                                      {pharmacyItems.map((item, idx) => {
                                        const getQuantityUnit = (form) => {
                                          if (!form) return "";
                                          const formLower = form.toLowerCase();
                                          if (formLower.includes("tablet") || formLower.includes("capsule")) return "tablets";
                                          if (formLower.includes("syrup")) return "bottles";
                                          if (formLower.includes("injection")) return "injections";
                                          if (formLower.includes("cream") || formLower.includes("ointment")) return "tubes";
                                          if (formLower.includes("drop")) return "bottles";
                                          return "units";
                                        };

                                        return (
                                          <li key={`${item?.name || "item"}-${idx}`} style={{ marginBottom: "0.75rem" }}>
                                            <Typography sx={{ fontWeight: "600", fontSize: "0.95rem" }}>
                                              {item?.name || "Medicine"}
                                            </Typography>
                                            <Box sx={{ ml: 2, mt: 0.5 }}>
                                              {item?.form && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                  <b>Form:</b> {item.form}
                                                </Typography>
                                              )}
                                              {/* ✅ للوصفات المزمنة: لا نعرض dosage و timesPerDay */}
                                              {!isChronicPrescription && item?.dosage !== null && item?.dosage !== undefined && 
                                               !item?.form?.toLowerCase().includes("cream") && 
                                               !item?.form?.toLowerCase().includes("ointment") && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                  <b>Dosage:</b> {item.dosage} {item?.form?.toLowerCase().includes("injection") ? "injections" : item?.form?.toLowerCase().includes("syrup") ? "ml" : item?.form?.toLowerCase().includes("drop") ? "drops" : "tablets"}
                                                </Typography>
                                              )}
                                              {!isChronicPrescription && item?.timesPerDay !== null && item?.timesPerDay !== undefined && !item?.form?.toLowerCase().includes("injection") && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                  <b>Times per day:</b> {item.timesPerDay}
                                                </Typography>
                                              )}
                                              {!isChronicPrescription && item?.duration !== null && item?.duration !== undefined && (
                                                <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                  <b>Duration:</b> {item.duration} days
                                                </Typography>
                                              )}
                                              {item?.calculatedQuantity !== null && item?.calculatedQuantity !== undefined && (
                                                <Typography sx={{ fontSize: "0.85rem", color: isChronicPrescription ? "#dc2626" : "#666", fontWeight: isChronicPrescription ? "700" : "400" }}>
                                                  <b>Quantity:</b> {item.calculatedQuantity} {getQuantityUnit(item?.form)}
                                                </Typography>
                                              )}
                                            </Box>
                                          </li>
                                        );
                                      })}
                                    </Box>
                                  </Box>
                                )}
                            </Box>
                          </Box>
                        )}

                        {/* Patient/Client Information */}
                        <Box sx={{ mt: 2 }}>
<Typography
  component="div"
  sx={{
    fontWeight: "bold",
    mb: 1,
    display: "flex",
    alignItems: "center",
    gap: 1,
  }}
>
                            <PersonIcon fontSize="small" />
                            {t("patientClientInformation", language)}
                            {/* Show indicator for client claims */}
                            {claim.providerRole === "INSURANCE_CLIENT" && (
                              <Chip
                                label={claim.familyMemberName ? t("familyMemberClaim", language) : t("clientSelfClaim", language)}
                                size="small"
                                color={claim.familyMemberName ? "warning" : "info"}
                                sx={{
                                  ml: 1,
                                  fontWeight: "bold",
                                  fontSize: "0.7rem",
                                  height: 20,
                                }}
                              />
                            )}
                          </Typography>
                          <Box sx={{ ml: 3, pl: 2, borderLeft: "2px solid #8B9A46" }}>
                            {/* Show role for INSURANCE_CLIENT claims in Patient/Client Information */}
                            {claim.providerRole === "INSURANCE_CLIENT" && (
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Typography component="span" sx={{ fontWeight: "600" }}>
                                    <b>Role:</b>
                                  </Typography>
                                  <Chip
                                    label={claim.providerRole}
                                    size="small"
                                    color="info"
                                    sx={{
                                      fontWeight: "bold",
                                      textTransform: "uppercase",
                                      height: 20,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                </Box>
                              </Box>
                            )}
                            {/* Family Member Info (if claim is for family member) */}
                            {claim.familyMemberName && (
                              <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontWeight: "600", color: "#556B2F", mb: 0.5 }}>
                                  {claim.familyMemberName}
                                  {claim.familyMemberRelation && ` (${claim.familyMemberRelation})`}
                                </Typography>
                                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                  {claim.familyMemberAge && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Age:</b> {claim.familyMemberAge}
                                    </Typography>
                                  )}
                                  {claim.familyMemberGender && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Gender:</b> {claim.familyMemberGender}
                                    </Typography>
                                  )}
                                  {claim.familyMemberInsuranceNumber && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Insurance #:</b> {claim.familyMemberInsuranceNumber}
                                    </Typography>
                                  )}
                                  {claim.familyMemberNationalId && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>National ID:</b> {claim.familyMemberNationalId}
                                    </Typography>
                                  )}
                                </Stack>
                                
                                {/* Main Client Info (shown when claim is for family member) */}
                                {claim.clientName && (
                                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e7ff" }}>
                                    <Typography variant="caption" sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase" }}>
                                      Main Client
                                    </Typography>
                                    <Typography sx={{ fontWeight: "600", mb: 0.5, mt: 0.5 }}>
                                      {claim.clientName}
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                      {claim.clientAge && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Age:</b> {claim.clientAge}
                                        </Typography>
                                      )}
                                      {claim.clientGender && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Gender:</b> {claim.clientGender}
                                        </Typography>
                                      )}
                                      {claim.clientEmployeeId && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Employee ID:</b> {claim.clientEmployeeId}
                                        </Typography>
                                      )}
                                      {!claim.clientEmployeeId && claim.employeeId && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Employee ID:</b> {claim.employeeId}
                                        </Typography>
                                      )}
                                      {claim.clientNationalId && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>National ID:</b> {claim.clientNationalId}
                                        </Typography>
                                      )}
                                      {claim.clientFaculty && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Faculty:</b> {claim.clientFaculty}
                                        </Typography>
                                      )}
                                      {claim.clientDepartment && (
                                        <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                          <b>Department:</b> {claim.clientDepartment}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                )}
                              </Box>
                            )}
                            
                            {/* Client Info (if claim is for client directly, not family member) */}
                            {!claim.familyMemberName && (
                              <Box>
                                <Typography sx={{ fontWeight: "600", mb: 0.5 }}>
                                  {claim.clientName || "N/A"}
                                </Typography>
                                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                  {claim.clientAge && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Age:</b> {claim.clientAge}
                                    </Typography>
                                  )}
                                  {claim.clientGender && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Gender:</b> {claim.clientGender}
                                    </Typography>
                                  )}
                                  {claim.clientEmployeeId && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Employee ID:</b> {claim.clientEmployeeId}
                                    </Typography>
                                  )}
                                  {!claim.clientEmployeeId && claim.employeeId && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Employee ID:</b> {claim.employeeId}
                                    </Typography>
                                  )}
                                  {claim.clientNationalId && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>National ID:</b> {claim.clientNationalId}
                                    </Typography>
                                  )}
                                  {claim.clientFaculty && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Faculty:</b> {claim.clientFaculty}
                                    </Typography>
                                  )}
                                  {claim.clientDepartment && (
                                    <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                                      <b>Department:</b> {claim.clientDepartment}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* BASIC DETAILS */}
                    <Grid item xs={12} md={6}>
                      <Typography fontWeight="bold" sx={{ color: "#3D4F23", mb: 1 }}>
                        {t("basicDetails", language)}
                      </Typography>

                      <Stack spacing={1.2}>
                        <Typography>
                          <EventIcon sx={{ mr: 0.5 }} />
                          <b>Service Date:</b> {claim.serviceDate}
                        </Typography>
                        <Typography>
                          <AccessTimeIcon sx={{ mr: 0.5 }} />
                          <b>Submitted:</b> {timeSince(claim.submittedAt)}
                        </Typography>
                        {/* Amount with Follow-up information */}
                        <Box>
                          <Typography>
                            <b>Amount:</b>{" "}
                            {(claim.isFollowUp || (claim.providerRole === "DOCTOR" && claim.amount === 0)) ? (
                              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <span style={{ color: "#dc2626", fontWeight: "bold" }}>0 شيكل</span>
                                <Chip
                                  label="Follow-up"
                                  size="small"
                                  sx={{
                                    bgcolor: "#fef3c7",
                                    color: "#92400e",
                                    fontWeight: "bold",
                                    fontSize: "0.7rem",
                                    height: 20,
                                    border: "1px solid #f59e0b",
                                  }}
                                />
                              </Box>
                            ) : (
                              <span>{claim.amount?.toFixed(2) || "0"} شيكل</span>
                            )}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* ATTACHMENTS */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => {
                          setSelectedClaim(claim);
                          setOpenFilesModal(true);
                        }}
                      >
                        {t("viewAttachments", language)}
                      </Button>
                    </Grid>

                    {/* STATUS */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />

                      <Stack direction="row" justifyContent="space-between">
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          sx={{ fontSize: "1rem", px: 2 }}
                        />
                      </Stack>

                      {/* REJECTION REASON */}
                      {claim.rejectionReason && (
                        <Typography
                          sx={{
                            mt: 2,
                            color: "error.main",
                            background: "#fdecea",
                            p: 1.2,
                            borderRadius: 1,
                            border: "1px solid #f5c2c0",
                          }}
                        >
                          <b>{t("rejectionReason", language)}:</b> {sanitizeString(claim.rejectionReason)}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              );
            })
          )}
        </Box>
      </Box>

      {/* ATTACHMENT MODAL */}
      <Dialog open={openFilesModal} onClose={() => setOpenFilesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t("attachment", language)}</DialogTitle>
        <DialogContent dividers>
          {selectedClaim?.invoiceImagePath ? (
            selectedClaim.invoiceImagePath.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={selectedClaim.invoiceImagePath}
                width="100%"
                height="500"
                style={{ border: "none", borderRadius: 8 }}
              ></iframe>
            ) : (
              <img
                src={selectedClaim.invoiceImagePath}
                alt="invoice"
                style={{ width: "100%", borderRadius: 10 }}
              />
            )
          ) : (
            <Typography>{t("noAttachmentFound", language)}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilesModal(false)}>{t("close", language)}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicalFinalDecisions;
