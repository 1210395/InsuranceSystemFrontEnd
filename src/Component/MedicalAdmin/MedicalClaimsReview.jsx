// src/Component/MedicalAdmin/MedicalClaimsReview.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";

import Header from "../MedicalAdmin/MedicalAdminHeader";
import Sidebar from "../MedicalAdmin/MedicalAdminSidebar";

import ScienceIcon from "@mui/icons-material/Science";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PersonIcon from "@mui/icons-material/Person";

// Import utilities
import api from "../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../config/api";
import { CLAIM_STATUS, isValidTransition } from "../../config/claimStateMachine";
import { ROLES, PROVIDER_ROLES } from "../../config/roles";
import { sanitizeString } from "../../utils/sanitize";
import { timeSince, safeJsonParse } from "../../utils/helpers";
import { useLanguage } from "../../context/LanguageContext";
import logger from "../../utils/logger";
import { t } from "../../config/translations";

const MedicalClaimsReview = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Tabs Configuration
  const claimTabs = useMemo(() => [
    { label: t("doctorClaims", language), role: ROLES.DOCTOR, icon: <LocalHospitalIcon /> },
    { label: t("pharmacyClaims", language), role: ROLES.PHARMACIST, icon: <MedicationIcon /> },
    { label: t("labClaims", language), role: ROLES.LAB_TECH, icon: <BiotechIcon /> },
    { label: t("radiologyClaims", language), role: ROLES.RADIOLOGIST, icon: <MonitorHeartIcon /> },
    { label: t("clientClaims", language), role: ROLES.INSURANCE_CLIENT, icon: <PersonIcon /> },
  ], [language]);

  // Fetch pending medical claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MEDICAL_REVIEW);
        const sortedClaims = (res || []).sort(
          (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
        );
        setClaims(sortedClaims);
      } catch (err) {
        logger.error("Failed to load claims:", err);
        setSnackbar({
          open: true,
          message: t("failedToLoadClaims", language),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Check if claim is returned by coordinator
  const isReturnedByCoordinator = useCallback((claim) => {
    return claim.status === CLAIM_STATUS.RETURNED_FOR_REVIEW;
  }, []);

  // Approve claim with confirmation
  const handleApprove = useCallback(async (id, currentStatus) => {
    // Validate transition
    if (!isValidTransition(currentStatus, CLAIM_STATUS.APPROVED_MEDICAL)) {
      setSnackbar({
        open: true,
        message: `${t("cannotApproveFromStatus", language)} ${currentStatus}`,
        severity: "error",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.patch(API_ENDPOINTS.HEALTHCARE_CLAIMS.APPROVE_MEDICAL(id));
      setClaims((prev) => prev.filter((c) => c.id !== id));
      setSnackbar({
        open: true,
        message: t("medicalApprovalSuccess", language),
        severity: "success",
      });
    } catch (err) {
      logger.error("Approve failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToApproveClaim", language),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  // Open reject dialog
  const handleOpenReject = useCallback((claim) => {
    setSelectedClaim(claim);
    setRejectReason("");
    setOpenRejectDialog(true);
  }, []);

  // Confirm rejection
  const handleConfirmReject = useCallback(async () => {
    const sanitizedReason = sanitizeString(rejectReason);

    if (!sanitizedReason.trim()) {
      setSnackbar({
        open: true,
        message: t("pleaseEnterRejectionReason", language),
        severity: "error",
      });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.patch(
        API_ENDPOINTS.HEALTHCARE_CLAIMS.REJECT_MEDICAL(selectedClaim.id),
        { reason: sanitizedReason }
      );

      setClaims((prev) => prev.filter((c) => c.id !== selectedClaim.id));
      setSnackbar({
        open: true,
        message: t("claimRejectedSuccess", language),
        severity: "warning",
      });
      setOpenRejectDialog(false);
    } catch (err) {
      logger.error("Reject failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToRejectClaim", language),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rejectReason, selectedClaim, isSubmitting]);

  // Parse role-specific data safely
  const parseRoleSpecificData = useCallback((roleSpecificData) => {
    return safeJsonParse(roleSpecificData, null);
  }, []);

  // Format amount with currency
  const formatAmount = useCallback((amount, isFollowUp = false) => {
    if (isFollowUp || amount === 0) {
      return `0 ${CURRENCY.SYMBOL}`;
    }
    return `${(amount || 0).toFixed(2)} ${CURRENCY.SYMBOL}`;
  }, []);

  // Get filtered and sorted claims for current tab
  const filteredClaims = useMemo(() => {
    const currentRole = claimTabs[selectedTab]?.role;
    if (!currentRole) return [];

    return claims
      .filter((c) => c.providerRole === currentRole)
      .sort((a, b) => {
        // Returned claims first
        const aReturned = isReturnedByCoordinator(a);
        const bReturned = isReturnedByCoordinator(b);
        if (aReturned && !bReturned) return -1;
        if (!aReturned && bReturned) return 1;
        // Then by date
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
  }, [claims, selectedTab, claimTabs, isReturnedByCoordinator]);

  // Get claim counts per tab
  const tabCounts = useMemo(() => {
    return claimTabs.map(tab =>
      claims.filter(c => c.providerRole === tab.role).length
    );
  }, [claims, claimTabs]);

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
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#3D4F23",
              mb: 1,
              letterSpacing: 0.5,
            }}
          >
            {t("medicalClaimsReview", language)}
          </Typography>

          <Typography sx={{ color: "#6B7280", mb: 4 }}>
            {t("validateMedicalAccuracy", language)}
          </Typography>

          {/* TABS */}
          <Tabs
            value={selectedTab}
            onChange={(e, v) => setSelectedTab(v)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 4,
              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                minHeight: 50,
              },
            }}
          >
            {claimTabs.map((t, index) => (
              <Tab
                key={index}
                icon={
                  <Badge
                    badgeContent={tabCounts[index]}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#556B2F",
                        color: "#FFFFFF",
                        fontWeight: "bold",
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

          {/* CONTENT */}
          {loading ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : filteredClaims.length === 0 ? (
            <Typography sx={{ mt: 5, textAlign: "center", color: "#6B7280" }}>
              {t("noPendingClaims", language)}
            </Typography>
          ) : (
            filteredClaims.map((claim) => {
              const roleData = parseRoleSpecificData(claim.roleSpecificData);
              const pharmacyItems = claim.providerRole === ROLES.PHARMACIST ? roleData?.items : null;
              const isChronicPrescription = roleData?.isChronic === true;
              const labTestName = claim.providerRole === ROLES.LAB_TECH ? roleData?.testName : null;
              const radiologyTestName = claim.providerRole === ROLES.RADIOLOGIST ? roleData?.testName : null;
              const isReturned = isReturnedByCoordinator(claim);
              const isFollowUp = claim.isFollowUp || (claim.providerRole === ROLES.DOCTOR && claim.amount === 0);

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderLeft: isReturned ? "12px solid #D32F2F" : "8px solid #556B2F",
                    background: isReturned
                      ? "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)"
                      : "#FFFFFF",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    transition: "0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {/* RETURNED WARNING */}
                  {isReturned && (
                    <Chip
                      label={t("returnedForReview", language).toUpperCase()}
                      color="error"
                      sx={{
                        mb: 2,
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        letterSpacing: 0.5,
                      }}
                    />
                  )}

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
                          <Typography sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                            <ScienceIcon fontSize="small" />
                            {t("providerInformation", language)}
                            {claim.providerRole === ROLES.INSURANCE_CLIENT && (
                              <Chip
                                label={t("outsideInsuranceNetwork", language)}
                                size="small"
                                color="warning"
                                sx={{ ml: 1, fontWeight: "bold", fontSize: "0.7rem", height: 22 }}
                              />
                            )}
                          </Typography>
                          <Box sx={{ ml: 3, pl: 2, borderLeft: claim.providerRole === ROLES.INSURANCE_CLIENT ? "2px solid #FFA500" : "2px solid #556B2F" }}>
                            {claim.providerRole === ROLES.INSURANCE_CLIENT ? (
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
                              <>
                                <Typography>
                                  <b>Name:</b> {claim.providerName || "N/A"}
                                </Typography>
                                {claim.providerRole && (
                                  <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Typography component="span"><b>Role:</b></Typography>
                                    <Chip
                                      label={claim.providerRole}
                                      size="small"
                                      color="primary"
                                      sx={{ fontWeight: "bold", textTransform: "uppercase", height: 20, fontSize: "0.7rem" }}
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
                                {claim.providerRole === ROLES.DOCTOR && claim.providerSpecialization && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Specialization:</b> {claim.providerSpecialization}
                                  </Typography>
                                )}
                                {claim.providerRole === ROLES.PHARMACIST && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Pharmacy Code:</b> {claim.providerPharmacyCode || "N/A"}
                                  </Typography>
                                )}
                                {claim.providerRole === ROLES.LAB_TECH && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Lab Code:</b> {claim.providerLabCode || "N/A"}
                                  </Typography>
                                )}
                                {claim.providerRole === ROLES.RADIOLOGIST && (
                                  <Typography sx={{ mt: 0.5 }}>
                                    <b>Radiology Code:</b> {claim.providerRadiologyCode || "N/A"}
                                  </Typography>
                                )}
                              </>
                            )}
                          </Box>
                        </Box>

                        {/* Description and Role-Specific Data */}
                        {(claim.description || pharmacyItems?.length > 0 || labTestName || radiologyTestName) && (
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
                                border: claim.providerRole === ROLES.INSURANCE_CLIENT ? "1px solid #FFA500" : "none",
                                bgcolor: claim.providerRole === ROLES.INSURANCE_CLIENT ? "#FFF8E1" : "#E8EDE0",
                              }}
                            >
                              {/* Coordinator Return Reason */}
                              {isReturned && claim.rejectionReason && (
                                <Box sx={{ mb: 2, p: 2, borderRadius: 2, backgroundColor: "#FEE2E2", border: "2px solid #DC2626" }}>
                                  <Typography sx={{ fontWeight: "bold", color: "#991B1B" }}>
                                    Coordination Admin Note
                                  </Typography>
                                  <Typography sx={{ mt: 1, fontSize: "0.95rem" }}>
                                    {sanitizeString(claim.rejectionReason)}
                                  </Typography>
                                </Box>
                              )}

                              {/* Description */}
                              {claim.description && (
                                <Typography component="div">
                                  {claim.providerRole === ROLES.INSURANCE_CLIENT
                                    ? sanitizeString(claim.description)
                                    : <><b>Description:</b> {sanitizeString(claim.description)}</>}
                                </Typography>
                              )}

                              {claim.description && (labTestName || radiologyTestName || pharmacyItems?.length > 0) && (
                                <Divider sx={{ my: 1.5 }} />
                              )}

                              {/* Lab Test Name */}
                              {labTestName && (
                                <Typography component="div">
                                  <b>Test Name:</b> {labTestName}
                                </Typography>
                              )}

                              {/* Radiology Test Name */}
                              {radiologyTestName && (
                                <Typography component="div">
                                  <b>Test Name:</b> {radiologyTestName}
                                </Typography>
                              )}

                              {/* Pharmacy Items */}
                              {claim.providerRole === ROLES.PHARMACIST && Array.isArray(pharmacyItems) && pharmacyItems.length > 0 && (
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                    <Typography sx={{ fontWeight: "bold" }}>Medicines:</Typography>
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
                                      />
                                    )}
                                  </Stack>
                                  <Box component="ul" sx={{ m: 0, pl: 2.5, listStyle: "none" }}>
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
                                            {!isChronicPrescription && item?.dosage != null && !item?.form?.toLowerCase().includes("cream") && !item?.form?.toLowerCase().includes("ointment") && (
                                              <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                <b>Dosage:</b> {item.dosage} {item?.form?.toLowerCase().includes("injection") ? "injections" : item?.form?.toLowerCase().includes("syrup") ? "ml" : item?.form?.toLowerCase().includes("drop") ? "drops" : "tablets"}
                                              </Typography>
                                            )}
                                            {!isChronicPrescription && item?.timesPerDay != null && !item?.form?.toLowerCase().includes("injection") && (
                                              <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                <b>Times per day:</b> {item.timesPerDay}
                                              </Typography>
                                            )}
                                            {!isChronicPrescription && item?.duration != null && (
                                              <Typography sx={{ fontSize: "0.85rem", color: "#666" }}>
                                                <b>Duration:</b> {item.duration} days
                                              </Typography>
                                            )}
                                            {item?.calculatedQuantity != null && (
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
                          <Typography sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            {t("patientClientInformation", language)}
                            {claim.providerRole === ROLES.INSURANCE_CLIENT && (
                              <Chip
                                label={claim.familyMemberName ? t("familyMemberClaim", language) : t("clientSelfClaim", language)}
                                size="small"
                                color={claim.familyMemberName ? "warning" : "info"}
                                sx={{ ml: 1, fontWeight: "bold", fontSize: "0.7rem", height: 20 }}
                              />
                            )}
                          </Typography>
                          <Box sx={{ ml: 3, pl: 2, borderLeft: "2px solid #8B9A46" }}>
                            {claim.providerRole === ROLES.INSURANCE_CLIENT && (
                              <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Typography component="span" sx={{ fontWeight: "600" }}><b>Role:</b></Typography>
                                  <Chip
                                    label={claim.providerRole}
                                    size="small"
                                    color="info"
                                    sx={{ fontWeight: "bold", textTransform: "uppercase", height: 20, fontSize: "0.7rem" }}
                                  />
                                </Box>
                              </Box>
                            )}

                            {/* Family Member Info */}
                            {claim.familyMemberName && (
                              <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontWeight: "600", color: "#556B2F", mb: 0.5 }}>
                                  {claim.familyMemberName}
                                  {claim.familyMemberRelation && ` (${claim.familyMemberRelation})`}
                                </Typography>
                                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                  {claim.familyMemberAge && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Age:</b> {claim.familyMemberAge}</Typography>}
                                  {claim.familyMemberGender && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Gender:</b> {claim.familyMemberGender}</Typography>}
                                  {claim.familyMemberInsuranceNumber && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Insurance #:</b> {claim.familyMemberInsuranceNumber}</Typography>}
                                  {claim.familyMemberNationalId && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>National ID:</b> {claim.familyMemberNationalId}</Typography>}
                                </Stack>

                                {/* Main Client Info */}
                                {claim.clientName && (
                                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e7ff" }}>
                                    <Typography variant="caption" sx={{ fontWeight: "600", color: "#64748b", fontSize: "0.65rem", textTransform: "uppercase" }}>
                                      Main Client
                                    </Typography>
                                    <Typography sx={{ fontWeight: "600", mb: 0.5, mt: 0.5 }}>{claim.clientName}</Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                      {claim.clientAge && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Age:</b> {claim.clientAge}</Typography>}
                                      {claim.clientGender && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Gender:</b> {claim.clientGender}</Typography>}
                                      {(claim.clientEmployeeId || claim.employeeId) && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Employee ID:</b> {claim.clientEmployeeId || claim.employeeId}</Typography>}
                                      {claim.clientNationalId && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>National ID:</b> {claim.clientNationalId}</Typography>}
                                      {claim.clientFaculty && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Faculty:</b> {claim.clientFaculty}</Typography>}
                                      {claim.clientDepartment && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Department:</b> {claim.clientDepartment}</Typography>}
                                    </Stack>
                                  </Box>
                                )}
                              </Box>
                            )}

                            {/* Direct Client Info */}
                            {!claim.familyMemberName && (
                              <Box>
                                <Typography sx={{ fontWeight: "600", mb: 0.5 }}>{claim.clientName || "N/A"}</Typography>
                                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                                  {claim.clientAge && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Age:</b> {claim.clientAge}</Typography>}
                                  {claim.clientGender && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Gender:</b> {claim.clientGender}</Typography>}
                                  {(claim.clientEmployeeId || claim.employeeId) && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Employee ID:</b> {claim.clientEmployeeId || claim.employeeId}</Typography>}
                                  {claim.clientNationalId && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>National ID:</b> {claim.clientNationalId}</Typography>}
                                  {claim.clientFaculty && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Faculty:</b> {claim.clientFaculty}</Typography>}
                                  {claim.clientDepartment && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Department:</b> {claim.clientDepartment}</Typography>}
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
                          <EventIcon sx={{ mr: 0.5, verticalAlign: "middle" }} />
                          <b>Service Date:</b> {claim.serviceDate}
                        </Typography>
                        <Typography>
                          <AccessTimeIcon sx={{ mr: 0.5, verticalAlign: "middle" }} />
                          <b>Submitted:</b> {timeSince(claim.submittedAt)}
                        </Typography>
                        <Box>
                          <Typography>
                            <b>Amount:</b>{" "}
                            {isFollowUp ? (
                              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <span style={{ color: "#dc2626", fontWeight: "bold" }}>{formatAmount(0, true)}</span>
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
                              <span>{formatAmount(claim.amount)}</span>
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
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        {t("viewAttachments", language)}
                      </Button>
                    </Grid>
                  </Grid>

                  {/* ACTIONS */}
                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color={isReturned ? "warning" : "success"}
                      onClick={() => handleApprove(claim.id, claim.status)}
                      disabled={isSubmitting}
                      sx={{ textTransform: "none", px: 3, borderRadius: 2 }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : isReturned ? (
                        t("reApprove", language)
                      ) : (
                        t("approveMedical", language)
                      )}
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenReject(claim)}
                      disabled={isSubmitting}
                      sx={{ textTransform: "none", px: 3, borderRadius: 2 }}
                    >
                      {t("reject", language)}
                    </Button>
                  </Box>
                </Paper>
              );
            })
          )}
        </Box>
      </Box>

      {/* ATTACHMENTS MODAL */}
      <Dialog
        open={openFilesModal}
        onClose={() => setOpenFilesModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("attachments", language)}</DialogTitle>
        <DialogContent dividers>
          {selectedClaim?.invoiceImagePath ? (
            <Box sx={{ mb: 2 }}>
              {selectedClaim.invoiceImagePath.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={selectedClaim.invoiceImagePath}
                  title="Invoice PDF"
                  width="100%"
                  height="400px"
                  style={{ borderRadius: 8, border: "none" }}
                />
              ) : (
                <img
                  src={selectedClaim.invoiceImagePath}
                  alt="Invoice"
                  style={{ width: "100%", borderRadius: 8, marginBottom: 10 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </Box>
          ) : (
            <Typography>{t("noAttachmentsFound", language)}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilesModal(false)}>{t("close", language)}</Button>
        </DialogActions>
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>{t("rejectClaim", language)}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("reasonForRejection", language)}
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)} disabled={isSubmitting}>
            {t("cancel", language)}
          </Button>
          <Button color="error" onClick={handleConfirmReject} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} /> : t("reject", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MedicalClaimsReview;
