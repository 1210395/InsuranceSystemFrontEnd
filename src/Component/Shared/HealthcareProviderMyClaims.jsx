import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  Stack,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
} from "@mui/material";
import { api, getToken } from "../../utils/apiService";
import { API_BASE_URL, API_ENDPOINTS, CURRENCY } from "../../config/api";
import { CLAIM_STATUS, getStatusColor, getStatusLabel, getStatusConfig } from "../../config/claimStateMachine";
import { ROLES, normalizeRole } from "../../config/roles";
import { formatDate, safeJsonParse } from "../../utils/helpers";
import { sanitizeString } from "../../utils/sanitize";
import { useLanguage } from "../../context/LanguageContext";
import logger from "../../utils/logger";
import { t } from "../../config/translations";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import DownloadIcon from "@mui/icons-material/Download";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

const HealthcareProviderMyClaims = ({ userRole = "DOCTOR", refreshTrigger = null }) => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Normalize userRole for consistent comparison
  const normalizedRole = useMemo(() => normalizeRole(userRole), [userRole]);

  const handleOpenImage = useCallback((imagePath) => {
    if (!imagePath) return;

    let path = imagePath;

    // If Array, take first element
    if (Array.isArray(imagePath)) {
      path = imagePath[0];
    }

    if (!path) return;

    const fullUrl = path.startsWith("http")
      ? path
      : `${API_BASE_URL}${path}`;

    setSelectedImage(fullUrl);
    setOpenImage(true);
  }, []);



  const handleCloseImage = useCallback(() => {
    setOpenImage(false);
    setSelectedImage(null);
  }, []);

  // Fetch claims function using centralized API service
  const fetchClaims = useCallback(async () => {
    const authToken = getToken();

    if (!authToken) {
      logger.error("No token found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MY_CLAIMS);
      setClaims(res || []);
    } catch (err) {
      logger.error("Error fetching claims:", err);
      setClaims([]); // Set empty array on error to avoid showing stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentToken = getToken();
    if (currentToken) {
      fetchClaims();
    } else {
      logger.error("No token found");
      setLoading(false);
    }
  }, [fetchClaims]);

  // Refresh claims when refreshTrigger changes (e.g., after creating a new claim)
  useEffect(() => {
    if (refreshTrigger !== null && refreshTrigger !== undefined) {
      const currentToken = getToken();
      if (currentToken) {
        fetchClaims();
      }
    }
  }, [refreshTrigger, fetchClaims]);

  // Use centralized status functions from claimStateMachine
  const getClaimStatusColor = useCallback((status) => {
    return getStatusColor(status);
  }, []);

  const getClaimStatusLabel = useCallback((status) => {
    return getStatusLabel(status, true); // short label
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case CLAIM_STATUS.APPROVED_FINAL:
        return <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case CLAIM_STATUS.REJECTED_FINAL:
      case CLAIM_STATUS.REJECTED_MEDICAL:
        return <ErrorIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case CLAIM_STATUS.PENDING_MEDICAL:
      case CLAIM_STATUS.RETURNED_FOR_REVIEW:
      case CLAIM_STATUS.APPROVED_MEDICAL:
      case CLAIM_STATUS.PENDING_COORDINATION:
        return <HourglassTopIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      default:
        return null;
    }
  }, []);


  const getRoleConfig = useMemo(() => {
    const configs = {
      [ROLES.DOCTOR]: {
        title: t("doctorClaims", language),
        icon: "👨‍⚕️",
        color: "#556B2F",
        bgColor: "#F5F5DC",
      },
      [ROLES.PHARMACIST]: {
        title: t("pharmacistClaims", language),
        icon: "💊",
        color: "#7B8B5E",
        bgColor: "#F5F5DC",
      },
      [ROLES.LAB_TECH]: {
        title: t("labTechnicianClaims", language),
        icon: "🧪",
        color: "#8B9A46",
        bgColor: "#F5F5DC",
      },
      [ROLES.RADIOLOGIST]: {
        title: t("radiologistClaims", language),
        icon: "🔍",
        color: "#3D4F23",
        bgColor: "#F5F5DC",
      },
      [ROLES.INSURANCE_CLIENT]: {
        title: t("clientClaims", language),
        icon: "👤",
        color: "#556B2F",
        bgColor: "#F5F5DC",
      },
    };
    return configs[normalizedRole] || configs[ROLES.DOCTOR];
  }, [normalizedRole, language]);

  const getRoleSpecificInfo = useCallback((claim) => {
    return safeJsonParse(claim.roleSpecificData, {});
  }, []);

  // Format description for better readability (especially for client claims)
  const formatDescription = (description, isClient = false) => {
    if (!description) return null;
    
    if (!isClient) {
      // For non-client claims, return as is
      return description;
    }

    // Parse client claim description which can have multiple formats
    const parts = {
      description: '',
      provider: '',
      doctor: '',
      warning: ''
    };

    // First try splitting by newlines
    const lines = description.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length > 1) {
      // Multi-line format
      lines.forEach(line => {
        if (line.match(/^Description\s*:/i)) {
          parts.description = line.replace(/^Description\s*:/i, '').trim();
        } else if (line.match(/Provider\/Center\s*[:\u061B]/i)) {
          parts.provider = line.replace(/Provider\/Center\s*[:\u061B]\s*/i, '').trim();
        } else if (line.match(/Doctor\s*[:\u061B]/i)) {
          parts.doctor = line.replace(/Doctor\s*[:\u061B]\s*/i, '').trim();
        } else if (line.includes('Out of Network') || line.includes('خارج الشبكة')) {
          parts.warning = line.replace(/⚠️\s*/g, '').trim();
        }
      });
    } else {
      // Single line format - need to parse carefully
      const fullText = description.trim();
      
      // Extract description (everything before Provider/Center or first meaningful separator)
      const descEnd = fullText.search(/Provider\/Center|اسم\s*المركز|Doctor\s*[:\u061B]|الطبيب/i);
      if (descEnd > 0) {
        parts.description = fullText.substring(0, descEnd)
          .replace(/^Description\s*:\s*/i, '')
          .trim();
      } else {
        // No separator found, take everything until Out of Network
        const outOfNetworkIndex = fullText.search(/Out of Network|خارج الشبكة/i);
        if (outOfNetworkIndex > 0) {
          parts.description = fullText.substring(0, outOfNetworkIndex)
            .replace(/^Description\s*:\s*/i, '')
            .trim();
        }
      }

      // Extract Provider/Center
      const providerMatch = fullText.match(/Provider\/Center\s*[:\u061B]\s*([^D\n]*?)(?:\s*Doctor\s*[:\u061B]|$)/i) ||
                           fullText.match(/اسم\s*[:\u061B]?\s*\(?Provider\/Center\)?\s*اسم\s*المركز\s*([^الطبيب\n]*?)(?:\s*الطبيب|$)/i);
      if (providerMatch) {
        parts.provider = providerMatch[1].trim();
      }

      // Extract Doctor
      const doctorMatch = fullText.match(/Doctor\s*[:\u061B]\s*([^O\n]*?)(?:\s*Out|$)/i) ||
                         fullText.match(/الطبيب\s*[:\u061B]\s*([^خارج\n]*?)(?:\s*خارج|$)/i);
      if (doctorMatch) {
        parts.doctor = doctorMatch[1].trim();
      }

      // Extract warning
      const warningMatch = fullText.match(/(Out of Network[^]*?)$/i) ||
                          fullText.match(/(خارج الشبكة[^]*?)$/i);
      if (warningMatch) {
        parts.warning = warningMatch[1].trim();
      }
    }

    // Fallback: if description is empty but we have text, use first part
    if (!parts.description) {
      const firstPart = description.split(/Provider\/Center|اسم\s*المركز|Doctor\s*[:\u061B]|الطبيب/i)[0];
      parts.description = firstPart.replace(/^Description\s*:\s*/i, '').trim();
    }

    // Clean up extracted values - remove extra spaces and colons
    parts.description = parts.description.replace(/[:\u061B]\s*$/, '').trim();
    parts.provider = parts.provider.replace(/[:\u061B]\s*$/, '').trim();
    parts.doctor = parts.doctor.replace(/[:\u061B]\s*$/, '').trim();
    
    // Clean warning text
    if (parts.warning) {
      parts.warning = parts.warning.replace(/^⚠️\s*/, '').trim();
      if (parts.warning.includes('Client submitted claim')) {
        parts.warning = 'Out of Network - Client submitted claim for services outside the insurance network';
      } else if (parts.warning.includes('تم إرسال المطالبة')) {
        parts.warning = 'خارج الشبكة - تم إرسال المطالبة من قبل العميل لخدمات خارج شبكة التأمين';
      }
    }

    return parts;
  };

  // Use centralized formatDate from helpers - now using formatDate imported from helpers
  const formatClaimDate = useCallback((dateString) => {
    return formatDate(dateString, 'short');
  }, []);

  const roleConfig = getRoleConfig;

  const filteredClaims = claims
    .filter((claim) => {
      const roleData = getRoleSpecificInfo(claim);
      const matchSearch =
        claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(roleData).toLowerCase().includes(searchTerm.toLowerCase());

      const matchFilter = filterStatus === "ALL" || claim.status === filterStatus;

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      // ترتيب من الأحدث للأقدم
      const dateA = new Date(a.serviceDate);
      const dateB = new Date(b.serviceDate);
      return dateB - dateA;
    });

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: { xs: 2, md: 4 }, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${roleConfig.color} 0%, ${roleConfig.color}dd 100%)`,
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 64,
              height: 64,
              fontSize: 32,
            }}
          >
            {roleConfig.icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
              {roleConfig.title}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t("viewManageSubmittedClaims", language)}
            </Typography>
          </Box>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={2.4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {claims.length}
              </Typography>
              <Typography variant="body2">{t("total", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {claims.filter((c) => c.status === CLAIM_STATUS.PENDING_MEDICAL).length}
              </Typography>
              <Typography variant="body2">{t("pendingMedicalStatus", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {claims.filter((c) => c.status === CLAIM_STATUS.APPROVED_FINAL).length}
              </Typography>
              <Typography variant="body2">{t("approved", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {claims.filter((c) => c.status === CLAIM_STATUS.REJECTED_FINAL).length}
              </Typography>
              <Typography variant="body2">{t("rejected", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
              </Typography>
              <Typography variant="body2">{t("adminReview", language)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter & Search Section */}
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8EDE0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Search Bar */}
            <TextField
              placeholder={t("searchClaimsPlaceholder", language)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#FAF8F5",
                },
              }}
            />

            {/* Filter Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                {t("filterByStatusLabel", language)}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
  { status: "ALL", label: t("all", language), count: claims.length },
  {
    status: CLAIM_STATUS.PENDING_MEDICAL,
    label: t("pendingMedicalStatus", language),
    count: claims.filter(c => c.status === CLAIM_STATUS.PENDING_MEDICAL).length
  },
  {
    status: CLAIM_STATUS.RETURNED_FOR_REVIEW,
    label: t("returnedForReview", language),
    count: claims.filter(c => c.status === CLAIM_STATUS.RETURNED_FOR_REVIEW).length
  },
  {
    status: CLAIM_STATUS.APPROVED_FINAL,
    label: t("approved", language),
    count: claims.filter(c => c.status === CLAIM_STATUS.APPROVED_FINAL).length
  },
  {
    status: CLAIM_STATUS.REJECTED_FINAL,
    label: t("rejected", language),
    count: claims.filter(c => c.status === CLAIM_STATUS.REJECTED_FINAL).length
  },
].map(({ status, label, count }) => (
                  <Chip
                    key={status}
                    label={`${label} (${count})`}
                    onClick={() => setFilterStatus(status)}
                    variant={filterStatus === status ? "filled" : "outlined"}
                    color={
                      status === "ALL"
                        ? filterStatus === "ALL" ? "primary" : "default"
                        : status === CLAIM_STATUS.APPROVED_FINAL ? "success"
                        : status === CLAIM_STATUS.REJECTED_FINAL ? "error"
                        : status === CLAIM_STATUS.RETURNED_FOR_REVIEW ? "info"
                        : "warning"
                    }

                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        {t("showingClaims", language)} <strong>{filteredClaims.length}</strong> {filteredClaims.length !== 1 ? t("claimPlural", language) : t("claimSingular", language)}
      </Typography>

      {/* Claims Grid - Card Layout */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredClaims.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: 4,
            fontSize: "1rem",
            "& .MuiAlert-icon": { fontSize: 28 },
          }}
        >
          {claims.length === 0 ? t("noClaimsSubmitted", language) : t("noClaimsMatch", language)}
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {filteredClaims.map((claim, index) => {
            const roleData = getRoleSpecificInfo(claim);
            const isChronicPrescription = roleData?.isChronic === true; // ✅ للوصفات المزمنة
            const statusConfig = getStatusConfig(claim.status);

            // ✅ Debug: Log isChronic for each claim
            if (userRole === "PHARMACIST") {
              logger.log(`Claim ${index + 1} (ID: ${claim.id}) - isChronicPrescription:`, isChronicPrescription, "roleData.isChronic:", roleData?.isChronic, "roleData:", roleData);
            }

            return (
              <Card
                key={claim.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  minHeight: 420,
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: `6px solid ${statusConfig.borderColor}`,
                  borderTop: "1px solid #E8EDE0",
                  borderRight: "1px solid #E8EDE0",
                  borderBottom: "1px solid #E8EDE0",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  backgroundColor: `${statusConfig.bgColor}30`,
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${statusConfig.borderColor}40`,
                    borderLeftColor: statusConfig.borderColor,
                  },
                }}
              >
                {/* Card Header with Claim Number and Icon Background */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${roleConfig.color} 0%, ${roleConfig.color}dd 100%)`,
                    p: 1.5,
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Icon Background */}
                  <Box
                    sx={{
                      position: "absolute",
                      right: -10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "3.5rem",
                      opacity: 0.15,
                    }}
                  >
                    {roleConfig.icon}
                  </Box>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ position: "relative", zIndex: 1 }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        color: "white",
                      }}
                    >
                      {t("claimLabel", language)} {index + 1}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(claim.status)}
                      label={getClaimStatusLabel(claim.status)}
                      color={getClaimStatusColor(claim.status)}
                      variant="filled"
                      size="small"
                      sx={{
                        fontWeight: "700",
                        fontSize: "0.65rem",
                        height: 24,
                      }}
                    />
                  </Stack>
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.8,
                  }}
                >
                  {/* Patient/Client Information - Different display for clients vs providers */}
                  {normalizedRole !== ROLES.INSURANCE_CLIENT ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: "#F5F5DC",
                        border: "1px solid #7B8B5E",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "#E8E8D0",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon sx={{ fontSize: 16, color: roleConfig.color }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "700",
                              color: roleConfig.color,
                              fontSize: "0.58rem",
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                            }}
                          >
                            Patient Information
                          </Typography>
                        </Stack>
                        
                        {/* Family Member Info (if claim is for family member) */}
                        {claim.familyMemberName && (
                          <Box sx={{ pl: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem", mb: 0.5 }}>
                              {claim.familyMemberName}
                              {claim.familyMemberRelation && ` (${claim.familyMemberRelation})`}
                            </Typography>
                            <Stack direction="row" spacing={1.5} flexWrap="wrap">
                              {claim.familyMemberAge && (
                                <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                  Age: {typeof claim.familyMemberAge === 'number' ? `${claim.familyMemberAge} years` : claim.familyMemberAge}
                                </Typography>
                              )}
                              {claim.familyMemberGender && (
                                <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                  Gender: {claim.familyMemberGender}
                                </Typography>
                              )}
                            </Stack>

                            {/* Main Client Info (shown when claim is for family member) */}
                            {claim.clientName && (
                              <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #7B8B5E" }}>
                                <Typography variant="caption" sx={{ fontWeight: "600", color: "#556B2F", fontSize: "0.65rem", textTransform: "uppercase" }}>
                                  Main Client
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "600", color: "#3D4F23", fontSize: "0.8rem", mt: 0.3 }}>
                                  {claim.clientName}
                                </Typography>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                  {claim.clientAge && (
                                    <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                      Age: {typeof claim.clientAge === 'number' ? `${claim.clientAge} years` : claim.clientAge}
                                    </Typography>
                                  )}
                                  {claim.clientGender && (
                                    <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                      Gender: {claim.clientGender}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </Box>
                        )}
                        
                        {/* Client Info (if claim is for client directly, not family member) */}
                        {!claim.familyMemberName && claim.clientName && (
                          <Box sx={{ pl: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem", mb: 0.5 }}>
                              {claim.clientName}
                            </Typography>
                            <Stack direction="row" spacing={1.5} flexWrap="wrap">
                              {claim.clientAge && (
                                <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                  Age: {typeof claim.clientAge === 'number' ? `${claim.clientAge} years` : claim.clientAge}
                                </Typography>
                              )}
                              {claim.clientGender && (
                                <Typography variant="caption" sx={{ color: "#556B2F", fontSize: "0.7rem" }}>
                                  Gender: {claim.clientGender}
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  ) : (
                    // Client-specific display: Show if claim is for themselves or family member
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: claim.familyMemberName ? "#F5F5DC" : "#F5F5DC",
                        border: claim.familyMemberName ? "1px solid #8B9A46" : "1px solid #7B8B5E",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: claim.familyMemberName ? "#E8E8D0" : "#E8E8D0",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {claim.familyMemberName ? (
                            <FamilyRestroomIcon sx={{ fontSize: 16, color: "#8B9A46" }} />
                          ) : (
                            <PersonIcon sx={{ fontSize: 16, color: "#556B2F" }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "700",
                              color: claim.familyMemberName ? "#8B9A46" : "#556B2F",
                              fontSize: "0.58rem",
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                            }}
                          >
                            {claim.familyMemberName ? "Family Member Claim" : "My Claim"}
                          </Typography>
                        </Stack>
                        
                        {/* Family Member Info (if claim is for family member) */}
                        {claim.familyMemberName ? (
                          <Box sx={{ pl: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem", mb: 0.5 }}>
                              {claim.familyMemberName}
                              {claim.familyMemberRelation && ` (${claim.familyMemberRelation})`}
                            </Typography>
                            {/* Age, Gender, and Insurance Number hidden for clients */}
                          </Box>
                        ) : (
                          // Claim for themselves
                          <Box sx={{ pl: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem", mb: 0.5 }}>
                              {claim.clientName || "Myself"}
                            </Typography>
                            {/* Age, Gender, and Employee ID hidden for clients */}
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Description - Formatted for clients */}
                  {claim.description && (() => {
                    const isClient = normalizedRole === ROLES.INSURANCE_CLIENT;
                    const formatted = formatDescription(claim.description, isClient);
                    // ✅ Use roleData.isChronic directly to ensure correct value for each claim
                    const isChronicPrescription = roleData?.isChronic === true; // ✅ للوصفات المزمنة
                    
                    
                    if (isClient && formatted && typeof formatted === 'object') {
                      // Display formatted description for clients with better organization
                      return (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.8,
                            borderRadius: 1.5,
                            bgcolor: "#FAF8F5",
                            border: "1px solid #e5e7eb",
                            minHeight: 60,
                          }}
                        >
                          <Stack spacing={1.5}>
                            {formatted.description && (
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: "700",
                                    color: "#475569",
                                    fontSize: "0.6rem",
                                    letterSpacing: "0.5px",
                                    textTransform: "uppercase",
                                    display: "block",
                                    mb: 0.8,
                                  }}
                                >
                                  Description
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#1e293b",
                                    fontSize: "0.8rem",
                                    lineHeight: 1.7,
                                    fontWeight: "500",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {sanitizeString(formatted.description)}
                                </Typography>
                              </Box>
                            )}
                            
                            {(formatted.provider || formatted.doctor) && (
                              <Box
                                sx={{
                                  pt: 1.2,
                                  borderTop: "1px solid #e5e7eb",
                                }}
                              >
                                <Stack spacing={1.2}>
                                  {formatted.provider && (
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: "700",
                                          color: "#475569",
                                          fontSize: "0.6rem",
                                          letterSpacing: "0.5px",
                                          textTransform: "uppercase",
                                          display: "block",
                                          mb: 0.5,
                                        }}
                                      >
                                        Provider/Center
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#1e293b",
                                          fontSize: "0.8rem",
                                          fontWeight: "600",
                                          dir: "auto",
                                        }}
                                      >
                                        {sanitizeString(formatted.provider)}
                                      </Typography>
                                    </Box>
                                  )}
                                  {formatted.doctor && (
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: "700",
                                          color: "#475569",
                                          fontSize: "0.6rem",
                                          letterSpacing: "0.5px",
                                          textTransform: "uppercase",
                                          display: "block",
                                          mb: 0.5,
                                        }}
                                      >
                                        {isChronicPrescription ? "Medical Admin" : "Doctor"}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#1e293b",
                                          fontSize: "0.8rem",
                                          fontWeight: "600",
                                          dir: "auto",
                                        }}
                                      >
                                        {sanitizeString(formatted.doctor)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}
                            
                          </Stack>
                        </Paper>
                      );
                    } else {
                      // Default display for non-client claims
                      return (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.3,
                            borderRadius: 1.5,
                            bgcolor: "#FAF8F5",
                            border: "1px dashed #d1d5db",
                            minHeight: 60,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "700",
                              color: "#64748b",
                              fontSize: "0.58rem",
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            Description
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#334155",
                              fontSize: "0.72rem",
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {sanitizeString(claim.description)}
                          </Typography>
                        </Paper>
                      );
                    }
                  })()}

                  {roleData.providerName && (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      borderRadius: 1.5,
      bgcolor: "#f0f9ff",
      border: "1px solid #bae6fd",
    }}
  >
    <Stack spacing={0.5}>
      <Typography variant="caption" fontWeight="700" fontSize="0.6rem">
        Provider / Center
      </Typography>
      <Typography variant="body2" fontWeight="600">
        {sanitizeString(roleData.providerName)}
      </Typography>
    </Stack>
  </Paper>
)}

{roleData.doctorName && (() => {
  // Parse roleSpecificData to check if chronic prescription
  const parsedData = safeJsonParse(claim.roleSpecificData, {});
  const isChronic = parsedData?.isChronic === true || parsedData?.isChronic === "true";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.2,
        borderRadius: 1.5,
        bgcolor: "#f0fdf4",
        border: "1px solid #bbf7d0",
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="caption" fontWeight="700" fontSize="0.6rem">
          {isChronic ? "Medical Admin" : "Doctor"}
        </Typography>
        <Typography variant="body2" fontWeight="600">
          {sanitizeString(roleData.doctorName)}
        </Typography>
      </Stack>
    </Paper>
  );
})()}

                  {/* Medicines List - For Pharmacist Claims */}
                  {normalizedRole === ROLES.PHARMACIST && roleData?.items && Array.isArray(roleData.items) && roleData.items.length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: "#fef3c7",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "700",
                              color: "#92400e",
                              fontSize: "0.65rem",
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                            }}
                          >
                            Medicines ({roleData.items.length})
                          </Typography>
                          {isChronicPrescription && (
                            <Chip
                              label="CHRONIC DISEASE"
                              size="small"
                              sx={{
                                bgcolor: "#dc2626",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "0.6rem",
                                height: 18,
                              }}
                            />
                          )}
                        </Stack>
                        <Box
                          component="ul"
                          sx={{
                            m: 0,
                            pl: 2,
                            listStyle: "none",
                          }}
                        >
                          {roleData.items.map((item, idx) => {
                            const getQuantityUnit = (form) => {
                              if (!form) return "unit(s)";
                              const formLower = String(form).toLowerCase();
                              if (formLower.includes("tablet") || formLower.includes("capsule")) return "pill(s)";
                              if (formLower.includes("syrup")) return "bottle(s)";
                              if (formLower.includes("injection")) return "injection(s)";
                              if (formLower.includes("cream") || formLower.includes("ointment")) return "tube(s)";
                              if (formLower.includes("drop")) return "bottle(s)";
                              return "unit(s)";
                            };

                            return (
                              <Box
                                key={`${item?.name || "item"}-${idx}`}
                                sx={{
                                  mb: 1,
                                  pb: 1,
                                  borderBottom: idx < roleData.items.length - 1 ? "1px solid #fde68a" : "none",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "600",
                                    fontSize: "0.85rem",
                                    color: "#1e293b",
                                    mb: 0.5,
                                  }}
                                >
                                  {item?.name || "Medicine"}
                                </Typography>
                                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                                  {item?.form && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#64748b",
                                      }}
                                    >
                                      <b>Form:</b> {item.form}
                                    </Typography>
                                  )}
                                  {item?.calculatedQuantity != null && item.calculatedQuantity > 0 && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: isChronicPrescription ? "#dc2626" : "#64748b",
                                        fontWeight: isChronicPrescription ? "600" : "400",
                                      }}
                                    >
                                      <b>Quantity:</b> {item.calculatedQuantity} {getQuantityUnit(item?.form)}
                                    </Typography>
                                  )}
                                  {!isChronicPrescription && item?.dosage != null && item?.dosage !== undefined && 
                                   !String(item?.form || "").toLowerCase().includes("cream") && 
                                   !String(item?.form || "").toLowerCase().includes("ointment") && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#64748b",
                                      }}
                                    >
                                      <b>Dosage:</b> {item.dosage} {String(item?.form || "").toLowerCase().includes("injection") ? "injection(s)" : String(item?.form || "").toLowerCase().includes("syrup") ? "ml" : String(item?.form || "").toLowerCase().includes("drop") ? "drop(s)" : "pill(s)"}
                                    </Typography>
                                  )}
                                  {!isChronicPrescription && item?.timesPerDay != null && item?.timesPerDay !== undefined && 
                                   !String(item?.form || "").toLowerCase().includes("injection") && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#64748b",
                                      }}
                                    >
                                      <b>Times/Day:</b> {item.timesPerDay}
                                    </Typography>
                                  )}
                                  {!isChronicPrescription && item?.duration != null && item?.duration !== undefined && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#64748b",
                                      }}
                                    >
                                      <b>Duration:</b> {item.duration} day(s)
                                    </Typography>
                                  )}
                                  {item?.price != null && item.price > 0 && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.7rem",
                                        color: "#8B9A46",
                                        fontWeight: "600",
                                      }}
                                    >
                                      <b>Price:</b> {parseFloat(item.price).toFixed(2)} {CURRENCY.SYMBOL}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            );
                          })}
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Amount & Date */}
                  <Grid container spacing={1}>
                    {/* Amount */}
                    <Grid item xs={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: "#F5F5DC",
                          border: "1px solid #A8B56B",
                          transition: "all 0.3s ease",
                          minHeight: 65,
                          "&:hover": {
                            bgcolor: "#E8E8D0",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MonetizationOnIcon sx={{ fontSize: 16, color: "#8B9A46" }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "700",
                                color: "#8B9A46",
                                fontSize: "0.55rem",
                                letterSpacing: "0.3px",
                                textTransform: "uppercase",
                              }}
                            >
                              Amount
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "700",
                                color: "#8B9A46",
                                fontSize: "0.8rem",
                              }}
                            >
                              {parseFloat(claim.amount || 0).toFixed(2)} {CURRENCY.SYMBOL}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Date */}
                    <Grid item xs={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: "#FAF8F5",
                          border: "1px solid #7B8B5E",
                          transition: "all 0.3s ease",
                          minHeight: 65,
                          "&:hover": {
                            bgcolor: "#E8E8D0",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "#7B8B5E" }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "700",
                                color: "#7B8B5E",
                                fontSize: "0.55rem",
                                letterSpacing: "0.3px",
                                textTransform: "uppercase",
                              }}
                            >
                              Date
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "600",
                                color: "#1e293b",
                                fontSize: "0.8rem",
                              }}
                            >
                              {formatClaimDate(claim.serviceDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* View Document Button */}
                  <Box sx={{ mt: "auto" }}>
{(Array.isArray(claim.invoiceImagePath)
  ? claim.invoiceImagePath.length > 0
  : !!claim.invoiceImagePath) ? (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<InsertDriveFileIcon />}
                        onClick={() => handleOpenImage(claim.invoiceImagePath)}
                        sx={{
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: "600",
                          borderRadius: 2,
                          backgroundColor: roleConfig.color,
                          "&:hover": {
                            backgroundColor: roleConfig.color,
                            opacity: 0.9,
                            transform: "translateY(-2px)",
                            boxShadow: `0 4px 12px ${roleConfig.color}40`,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        View Document
                      </Button>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "#f5f5f5",
                          border: "1px dashed #d1d5db",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: "0.75rem" }}>
                          No document attached
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Image Viewer Dialog */}
      <Dialog
        open={openImage}
        onClose={handleCloseImage}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="700">
            Document Viewer
          </Typography>
          <IconButton
            onClick={handleCloseImage}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                py: 2,
              }}
            >
              <img
                src={selectedImage}
                alt="Document"
                style={{
                  maxWidth: "100%",
                  maxHeight: "600px",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.src = "";
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

HealthcareProviderMyClaims.propTypes = {
  userRole: PropTypes.string,
  refreshTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default HealthcareProviderMyClaims;

