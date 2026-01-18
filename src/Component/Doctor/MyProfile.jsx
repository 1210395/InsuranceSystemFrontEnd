// src/Component/Doctor/MyProfiles.jsx
import React, { useEffect, useState, useCallback } from "react";
import { api, apiClient, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import { sanitizeString } from "../../utils/sanitize";

function MyProfiles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const _isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { language, isRTL } = useLanguage();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Document Preview Dialog
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState({ url: "", name: "" });

  // 🔹 Helper function to preview file in modal
  const handleOpenFile = useCallback(async (filename, documentName) => {
    if (!filename) return;

    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: t("pleaseLoginFirst", language), severity: "error" });
      return;
    }

    try {
      // Extract just the filename from the path
      let filenameOnly = filename;
      if (filename.includes("\\")) {
        filenameOnly = filename.split("\\").pop();
      }
      if (filename.includes("/")) {
        filenameOnly = filenameOnly.split("/").pop();
      }

      // Request file from backend with auth token - use apiClient to get full response with headers
      const response = await apiClient.get(
        API_ENDPOINTS.SEARCH_PROFILES.FILE(encodeURIComponent(filenameOnly)),
        { responseType: 'blob' }
      );

      // Create a blob URL - response.data contains the blob when using apiClient directly
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // Show in dialog
      setSelectedDocument({
        url: url,
        name: documentName,
        contentType: contentType
      });
      setDocumentDialogOpen(true);
    } catch (err) {
      console.error("Error opening file:", err);
      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setSnackbar({ open: true, message: `Failed to open ${documentName}: ${errorMessage}`, severity: "error" });
    }
  }, []);

  // 🔹 Fetch Profiles
  const fetchProfiles = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: t("pleaseLoginFirst", language), severity: "error" });
      setLoading(false);
      return;
    }

    try {
      // api.get() returns response.data directly, no need to access .data again
      const data = await api.get(API_ENDPOINTS.SEARCH_PROFILES.MY);
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("API Error:", err);
      setProfiles([]); // Ensure profiles is always an array
      const errorMessage = err.response?.data?.message || err.message || t("failedToLoadProfiles", language);
      setSnackbar({ open: true, message: errorMessage, severity: "warning" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // 🔹 Delete profile
  const handleDelete = async (id) => {
    if (!id) {
      setSnackbar({ open: true, message: t("invalidProfileId", language), severity: "error" });
      return;
    }

    if (!window.confirm(t("confirmDeleteProfile", language))) return;

    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: t("pleaseLoginFirst", language), severity: "error" });
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.SEARCH_PROFILES.BY_ID(id));
      setSnackbar({ open: true, message: t("profileDeletedSuccess", language), severity: "success" });
      fetchProfiles();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("failedToDeleteProfile", language);
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // 🔹 Open edit dialog
  const handleEditOpen = (profile) => {
    setSelectedProfile(profile);
    setEditDialogOpen(true);
  };

  // 🔹 Handle form change
  const handleEditChange = (e) => {
    if (!selectedProfile) return;
    setSelectedProfile({ ...selectedProfile, [e.target.name]: e.target.value });
  };

  // 🔹 Use current location
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSelectedProfile((prev) => ({
            ...prev,
            locationLat: pos.coords.latitude,
            locationLng: pos.coords.longitude,
          }));
          setSnackbar({
            open: true,
            message: t("locationDetectedSuccess", language),
            severity: "info",
          });
        },
        () => {
          setSnackbar({
            open: true,
            message: t("pleaseAllowLocationAccess", language),
            severity: "warning",
          });
        }
      );
    } else {
      setSnackbar({
        open: true,
        message: t("geolocationNotSupported", language),
        severity: "error",
      });
    }
  };

  // 🔹 Submit edit
  const handleEditSubmit = async () => {
    if (!selectedProfile) {
      setSnackbar({ open: true, message: t("noProfileSelected", language), severity: "error" });
      return;
    }

    if (!selectedProfile.id) {
      setSnackbar({ open: true, message: t("invalidProfileId", language), severity: "error" });
      return;
    }

    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: t("pleaseLoginFirst", language), severity: "error" });
      return;
    }

    try {
      const formData = new FormData();

      // Add profile data as JSON - only include fields that are not empty
      const profileData = {
        id: selectedProfile.id,
      };

      // Only add fields if they have values
      if (selectedProfile.name) profileData.name = selectedProfile.name;
      if (selectedProfile.type) profileData.type = selectedProfile.type;
      if (selectedProfile.address) profileData.address = selectedProfile.address;
      if (selectedProfile.contactInfo) profileData.contactInfo = selectedProfile.contactInfo;
      if (selectedProfile.description) profileData.description = selectedProfile.description;
      if (selectedProfile.ownerName) profileData.ownerName = selectedProfile.ownerName;
      if (selectedProfile.status) profileData.status = selectedProfile.status;
      if (selectedProfile.rejectionReason) profileData.rejectionReason = selectedProfile.rejectionReason;
      if (selectedProfile.locationLat != null && selectedProfile.locationLat !== "") profileData.locationLat = selectedProfile.locationLat;
      if (selectedProfile.locationLng != null && selectedProfile.locationLng !== "") profileData.locationLng = selectedProfile.locationLng;

      // Include existing file paths (keep them if not replaced)
      if (selectedProfile.medicalLicense && typeof selectedProfile.medicalLicense === 'string') {
        profileData.medicalLicense = selectedProfile.medicalLicense;
      }
      if (selectedProfile.universityDegree && typeof selectedProfile.universityDegree === 'string') {
        profileData.universityDegree = selectedProfile.universityDegree;
      }
      if (selectedProfile.clinicRegistration && typeof selectedProfile.clinicRegistration === 'string') {
        profileData.clinicRegistration = selectedProfile.clinicRegistration;
      }
      if (selectedProfile.idOrPassportCopy && typeof selectedProfile.idOrPassportCopy === 'string') {
        profileData.idOrPassportCopy = selectedProfile.idOrPassportCopy;
      }

      formData.append("data", new Blob([JSON.stringify(profileData)], { type: "application/json" }));

      // Add files only if they were changed (File objects only, not strings or base64)
      if (selectedProfile.medicalLicense instanceof File) {
        formData.append("medicalLicense", selectedProfile.medicalLicense);
      }
      if (selectedProfile.universityDegree instanceof File) {
        formData.append("universityDegree", selectedProfile.universityDegree);
      }
      if (selectedProfile.clinicRegistration instanceof File) {
        formData.append("clinicRegistration", selectedProfile.clinicRegistration);
      }
      if (selectedProfile.idOrPassportCopy instanceof File) {
        formData.append("idOrPassportCopy", selectedProfile.idOrPassportCopy);
      }

      await api.put(
        API_ENDPOINTS.SEARCH_PROFILES.EDIT(selectedProfile.id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setSnackbar({ open: true, message: t("profileUpdatedSuccess", language), severity: "success" });
      setEditDialogOpen(false);
      fetchProfiles();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("failedToUpdateProfile", language);
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    }
  };

  // 🔹 Status Chip
  const getStatusChip = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          color: "success",
          label: t("approved", language),
          bgcolor: "#E8F5E9",
          textColor: "#2E7D32",
          icon: "✅",
        };
      case "PENDING":
        return {
          color: "warning",
          label: t("pending", language),
          bgcolor: "#FFF3E0",
          textColor: "#E65100",
          icon: "⏳",
        };
      case "REJECTED":
        return {
          color: "error",
          label: t("rejected", language),
          bgcolor: "#FFEBEE",
          textColor: "#C62828",
          icon: "❌",
        };
      default:
        return {
          color: "default",
          label: status,
          bgcolor: "#F5F5F5",
          textColor: "#757575",
          icon: "❓",
        };
    }
  };

  // 🔹 Type Chip
  const getTypeChip = (type) => {
    switch (type) {
      case "CLINIC":
        return <Chip label={`🏥 ${t("clinic", language)}`} sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: "600" }} />;
      case "DOCTOR":
        return <Chip label={`👨‍⚕️ ${t("doctor", language)}`} sx={{ bgcolor: "#F3E5F5", color: "#7B1FA2", fontWeight: "600" }} />;
      default:
        return <Chip label={type} />;
    }
  };

  // ✅ ترتيب حسب التاريخ (الأحدث أولاً)
  const sortedProfiles = [...(Array.isArray(profiles) ? profiles : [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // ✅ تصفية حسب البحث
  const filteredProfiles = sortedProfiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  if (!profiles || profiles.length === 0) {
    return (
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ textAlign: "center", py: 8, color: "#4A5D4A" }}>
        <Typography variant="h5" fontWeight="bold">
          {t("noProfiles", language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ py: { xs: 2, md: 3 }, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "100%", mx: "auto", px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: { xs: 2, md: 4 },
            borderRadius: { xs: 2, md: 4 },
            background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
            color: "white",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={{ xs: 1.5, md: 2 }} mb={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: { xs: 44, md: 56 },
                height: { xs: 44, md: 56 },
                display: { xs: "none", sm: "flex" },
              }}
            >
              <BusinessIcon sx={{ fontSize: { xs: 26, md: 32 } }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                {t("myProfiles", language)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" }, display: { xs: "none", sm: "block" } }}>
                {t("manageClinicDoctorProfiles", language)}
              </Typography>
            </Box>
          </Stack>

          {/* Stats Summary */}
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: { xs: 1, md: 2 } }}>
            <Grid item xs={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
                  {profiles.length}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" } }}>{t("totalProfiles", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
                  {profiles.filter((p) => p.status?.toLowerCase() === "approved").length}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" } }}>{t("approved", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}>
                  {profiles.filter((p) => p.status?.toLowerCase() === "pending").length}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" } }}>{t("pending", language)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            mb: { xs: 2, md: 4 },
            borderRadius: { xs: 2, md: 3 },
            border: "1px solid #E8EDE0",
          }}
        >
          <TextField
            fullWidth
            placeholder={isMobile ? t("searchPlaceholderMobile", language) : t("searchByNameAddressContact", language)}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#00897b", fontSize: { xs: 20, md: 24 } }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: { xs: 1.5, md: 2 },
                fontSize: { xs: "0.875rem", md: "1rem" },
              },
            }}
          />
        </Paper>

        {/* Results Count */}
        <Typography variant="body1" sx={{ mb: { xs: 2, md: 3 }, color: "#4A5D4A", fontSize: { xs: "0.85rem", md: "1rem" } }}>
          {t("showingResults", language)} <strong>{filteredProfiles.length}</strong> {filteredProfiles.length !== 1 ? t("profiles", language) : t("profile", language)}
        </Typography>

        {/* Grid of Cards - Responsive */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {filteredProfiles.map((p) => {
            const status = getStatusChip(p.status);

            return (
              <Card
                key={p.id}
                elevation={0}
                sx={{
                  borderRadius: { xs: 2, md: 3 },
                  height: "100%",
                  minHeight: { xs: "auto", md: 500 },
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #E8EDE0",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: "white",
                  "&:hover": {
                    transform: { xs: "none", md: "translateY(-8px)" },
                    boxShadow: { xs: "0 4px 20px rgba(0, 137, 123, 0.15)", md: "0 20px 50px rgba(0, 137, 123, 0.25)" },
                    borderColor: "#00897b",
                  },
                }}
              >
                {/* Card Header with Status */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${status.bgcolor} 0%, ${status.bgcolor}dd 100%)`,
                    p: { xs: 1.5, md: 2.5 },
                    borderBottom: `4px solid ${status.textColor}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, md: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: status.textColor,
                          width: { xs: 40, md: 48 },
                          height: { xs: 40, md: 48 },
                          fontWeight: 700,
                          fontSize: { xs: "1rem", md: "1.2rem" }
                        }}
                      >
                        {p.type === "DOCTOR" ? "D" : "C"}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            color: status.textColor,
                            fontSize: { xs: "0.85rem", md: "1rem" },
                            mb: 0.3
                          }}
                        >
                          {p.type === "DOCTOR" ? t("doctorProfileType", language) : t("clinicProfileType", language)}
                        </Typography>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: status.textColor,
                            color: "white",
                            fontWeight: "700",
                            fontSize: { xs: "0.6rem", md: "0.7rem" },
                          }}
                          icon={
                            <Box component="span" sx={{ fontSize: { xs: "9px", md: "11px" } }}>
                              {status.icon}
                            </Box>
                          }
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 }, display: "flex", flexDirection: "column" }}>
                  {/* Profile Name */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#E0F2F1",
                      border: "2px solid #26A69A",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#B2DFDB",
                        boxShadow: "0 4px 12px rgba(38, 166, 154, 0.2)"
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#00897b",
                        width: 45,
                        height: 45,
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {p.name ? p.name.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#00897b",
                          fontWeight: "700",
                          fontSize: "0.7rem",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          display: "block",
                          mb: 0.5
                        }}
                      >
                        {t("name", language)}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          color: "#00695c",
                          fontSize: "1.1rem",
                          lineHeight: 1.2
                        }}
                      >
                        {p.name || t("unnamedProfile", language)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Type Badge */}
                  <Box sx={{ mb: 1.5 }}>
                    {getTypeChip(p.type)}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Details */}
                  <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                    {/* Address */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#d32f2f",
                          fontWeight: "700",
                          fontSize: "0.6rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <LocationOnIcon
                          sx={{
                            fontSize: 13,
                            mr: 0.4,
                            verticalAlign: "middle",
                          }}
                        />
                        {t("addressLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#475569",
                          fontSize: "0.85rem",
                          mt: 0.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.address || "-"}
                      </Typography>
                    </Box>

                    {/* Contact */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#059669",
                          fontWeight: "700",
                          fontSize: "0.6rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <PhoneIcon
                          sx={{
                            fontSize: 13,
                            mr: 0.4,
                            verticalAlign: "middle",
                          }}
                        />
                        {t("contactInfoLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#475569",
                          fontSize: "0.85rem",
                          mt: 0.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.contactInfo || "-"}
                      </Typography>
                    </Box>

                    {/* Description */}
                    {p.description && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6a1b9a",
                            fontWeight: "700",
                            fontSize: "0.6rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          <DescriptionIcon
                            sx={{
                              fontSize: 13,
                              mr: 0.4,
                              verticalAlign: "middle",
                            }}
                          />
                          {t("descriptionLabel", language)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "500",
                            color: "#475569",
                            fontSize: "0.8rem",
                            mt: 0.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Rejection Reason */}
                  {p.rejectionReason && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#c62828",
                          fontWeight: "700",
                          fontSize: "0.6rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("rejectionReasonLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#c62828",
                          fontSize: "0.9rem",
                          mt: 0.3,
                          p: 1.5,
                          bgcolor: "#FFEBEE",
                          borderRadius: 1,
                          borderLeft: "3px solid #c62828",
                        }}
                      >
                        {sanitizeString(p.rejectionReason)}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1.5 }} />

                  {/* View on Map Button */}
                  {p.locationLat && p.locationLng && (
                    <Box 
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        p: 1.5,
                        background: "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
                        border: "1px solid #26A69A",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(38, 166, 154, 0.3)",
                          transform: "translateY(-2px)"
                        }
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        href={`https://www.google.com/maps?q=${p.locationLat},${p.locationLng}`}
                        target="_blank"
                        fullWidth
                        sx={{
                          background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
                          color: "white",
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          py: 1,
                          borderRadius: 1.5,
                          boxShadow: "0 2px 8px rgba(0, 137, 123, 0.3)",
                          "&:hover": { 
                            background: "linear-gradient(135deg, #00695c 0%, #00897b 100%)",
                            boxShadow: "0 4px 16px rgba(0, 137, 123, 0.4)",
                            transform: "translateY(-1px)"
                          }
                        }}
                      >
                        {t("viewOnMap", language)}
                      </Button>
                    </Box>
                  )}

                  {/* Documents Section */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "700",
                        color: "#1e293b",
                        mb: 1,
                        fontSize: "0.85rem",
                      }}
                    >
                      {t("uploadedDocuments", language)}
                    </Typography>
                    <Stack spacing={0.8}>
                      {/* Medical License */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: p.medicalLicense ? "#E8F5E9" : "#FFF3E0",
                          border: p.medicalLicense ? "1px solid #4CAF50" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: p.medicalLicense ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": p.medicalLicense ? { boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            {t("medicalLicenseDocLabel", language)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {p.medicalLicense ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {p.medicalLicense && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.medicalLicense, t("medicalLicense", language))}
                            sx={{ fontSize: "0.7rem", py: 0.4, px: 1.2, bgcolor: "#4CAF50", "&:hover": { bgcolor: "#45a049" } }}
                          >
                            {t("open", language)}
                          </Button>
                        )}
                      </Box>

                      {/* University Degree */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: p.universityDegree ? "#E3F2FD" : "#FFF3E0",
                          border: p.universityDegree ? "1px solid #2196F3" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: p.universityDegree ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": p.universityDegree ? { boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            {t("universityDegreeDocLabel", language)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {p.universityDegree ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {p.universityDegree && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.universityDegree, t("universityDegree", language))}
                            sx={{ fontSize: "0.7rem", py: 0.4, px: 1.2, bgcolor: "#2196F3", "&:hover": { bgcolor: "#0b7dda" } }}
                          >
                            {t("open", language)}
                          </Button>
                        )}
                      </Box>

                      {/* ID/Passport Copy */}
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 1.5,
                          bgcolor: p.idOrPassportCopy ? "#F3E5F5" : "#FFF3E0",
                          border: p.idOrPassportCopy ? "1px solid #9C27B0" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: p.idOrPassportCopy ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": p.idOrPassportCopy ? { boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            {t("idPassportCopyDocLabel", language)}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {p.idOrPassportCopy ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {p.idOrPassportCopy && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.idOrPassportCopy, t("idOrPassportCopy", language))}
                            sx={{ fontSize: "0.7rem", py: 0.4, px: 1.2, bgcolor: "#9C27B0", "&:hover": { bgcolor: "#7b1fa2" } }}
                          >
                            {t("open", language)}
                          </Button>
                        )}
                      </Box>

                      {/* Clinic Registration (Optional) */}
                      {p.clinicRegistration && (
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            bgcolor: "#FFF3E0",
                            border: "2px dashed #FF9800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            minHeight: 52,
                            "&:hover": { boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)", bgcolor: "#FFE0B2" },
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: "600", color: "#E65100", fontSize: "0.75rem" }}>
                              {t("clinicRegistrationDocLabel", language)}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                              {t("uploaded", language)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.clinicRegistration, t("clinicRegistration", language))}
                            sx={{ fontSize: "0.7rem", py: 0.4, px: 1.2, bgcolor: "#FF9800", "&:hover": { bgcolor: "#F57C00" } }}
                          >
                            {t("open", language)}
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Action Buttons */}
                  <Stack spacing={1} sx={{ mt: "auto", pt: 1 }}>
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEditOpen(p)}
                        startIcon={<EditIcon sx={{ fontSize: 13 }} />}
                        fullWidth
                        sx={{
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 0.6,
                          px: 1.5,
                          background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #006f65 0%, #004d47 100%)",
                          }
                        }}
                      >
                        {t("edit", language)}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(p.id)}
                        startIcon={<DeleteIcon sx={{ fontSize: 13 }} />}
                        sx={{
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "0.7rem",
                          py: 0.6,
                          px: 1.5,
                        }}
                      >
                        {t("delete", language)}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)", color: "white", fontWeight: 700 }}>{t("editProfile", language)}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedProfile && (
            <Stack spacing={2.5}>
              {/* Summary of Current Data */}
              <Paper sx={{ p: 2, bgcolor: "#E8F5E9", border: "1px solid #4CAF50", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#2E7D32", mb: 1 }}>
                  {t("currentInformation", language)}
                </Typography>
                <Grid container spacing={1}>
                  {selectedProfile.name && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#4A5D4A", fontSize: "0.75rem" }}>
                        <strong>{t("name", language)}:</strong> {selectedProfile.name}
                      </Typography>
                    </Grid>
                  )}
                  {selectedProfile.address && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#4A5D4A", fontSize: "0.75rem" }}>
                        <strong>{t("addressLabel", language)}:</strong> {selectedProfile.address}
                      </Typography>
                    </Grid>
                  )}
                  {selectedProfile.contactInfo && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#4A5D4A", fontSize: "0.75rem" }}>
                        <strong>{t("contactDisplayLabel", language)}:</strong> {selectedProfile.contactInfo}
                      </Typography>
                    </Grid>
                  )}
                  {selectedProfile.type && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#4A5D4A", fontSize: "0.75rem" }}>
                        <strong>{t("type", language)}:</strong> {selectedProfile.type === "CLINIC" ? `🏥 ${t("clinic", language)}` : `👨‍⚕️ ${t("doctor", language)}`}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              <Divider />

              <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#00897b", mt: 2 }}>
                ✏️ {t("editFieldsBelow", language)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#4A5D4A", fontSize: "0.85rem", fontStyle: "italic" }}>
                {t("editFieldsBelowDesc", language)}
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>{t("profileTypeLabel", language)}</InputLabel>
                <Select
                  name="type"
                  value={selectedProfile.type || "CLINIC"}
                  onChange={handleEditChange}
                  label={t("profileTypeLabel", language)}
                >
                  <MenuItem value="CLINIC">🏥 {t("clinic", language)}</MenuItem>
                  <MenuItem value="DOCTOR">👨‍⚕️ {t("doctorOffice", language)}</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label={`🏥 ${t("nameLabel", language)}`}
                name="name"
                value={selectedProfile.name || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterProfileName", language)}
              />

              <TextField
                label={`📍 ${t("addressLabel", language)}`}
                name="address"
                value={selectedProfile.address || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterAddress", language)}
              />

              <TextField
                label={`📞 ${t("contactInfoLabel", language)}`}
                name="contactInfo"
                value={selectedProfile.contactInfo || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterContactInfo", language)}
              />

              <TextField
                label={`📝 ${t("descriptionLabel", language)}`}
                name="description"
                value={selectedProfile.description || ""}
                onChange={handleEditChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                placeholder={t("enterDescription", language)}
              />

              <TextField
                label={`🌍 ${t("latitudeLabel", language)}`}
                name="locationLat"
                type="number"
                value={selectedProfile.locationLat || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., 24.7136"
              />

              <TextField
                label={`🌍 ${t("longitudeLabel", language)}`}
                name="locationLng"
                type="number"
                value={selectedProfile.locationLng || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., 46.6753"
              />

              <Button
                variant="outlined"
                color="info"
                onClick={handleUseMyLocation}
                sx={{ textTransform: "none", fontSize: "0.9rem" }}
              >
                📍 {t("useMyCurrentLocation", language)}
              </Button>
              
              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#00897b" }}>📄 {t("uploadDocumentsTitle", language)}</Typography>
              <Typography variant="caption" sx={{ color: "#5d6b5d", fontSize: "0.8rem", display: "block", mb: 2 }}>
                ✨ {t("uploadDocumentsDesc", language)}
              </Typography>
              
              {/* Medical License Upload */}
              <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                    🏥 {t("medicalLicenseLabel", language)}
                  </Typography>
                  {selectedProfile.medicalLicense && typeof selectedProfile.medicalLicense === 'string' && (
                    <Chip label={`✅ ${t("alreadyUploaded", language)}`} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.medicalLicense instanceof File && (
                    <Chip label={`📦 ${t("newFileSelected", language)}`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  sx={{ textTransform: "none", fontSize: "0.8rem", py: 1 }}
                >
                  {t("chooseFile", language)}
                  <input
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedProfile({ ...selectedProfile, medicalLicense: e.target.files[0] });
                      }
                    }}
                  />
                </Button>
              </Box>

              {/* University Degree Upload */}
              <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                    🎓 {t("universityDegreeLabel", language)}
                  </Typography>
                  {selectedProfile.universityDegree && typeof selectedProfile.universityDegree === 'string' && (
                    <Chip label={`✅ ${t("alreadyUploaded", language)}`} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.universityDegree instanceof File && (
                    <Chip label={`📦 ${t("newFileSelected", language)}`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  sx={{ textTransform: "none", fontSize: "0.8rem", py: 1 }}
                >
                  {t("chooseFile", language)}
                  <input
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedProfile({ ...selectedProfile, universityDegree: e.target.files[0] });
                      }
                    }}
                  />
                </Button>
              </Box>

              {/* ID/Passport Copy Upload */}
              <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                    📋 {t("idPassportCopyLabel", language)}
                  </Typography>
                  {selectedProfile.idOrPassportCopy && typeof selectedProfile.idOrPassportCopy === 'string' && (
                    <Chip label={`✅ ${t("alreadyUploaded", language)}`} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.idOrPassportCopy instanceof File && (
                    <Chip label={`📦 ${t("newFileSelected", language)}`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  sx={{ textTransform: "none", fontSize: "0.8rem", py: 1 }}
                >
                  {t("chooseFile", language)}
                  <input
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedProfile({ ...selectedProfile, idOrPassportCopy: e.target.files[0] });
                      }
                    }}
                  />
                </Button>
              </Box>

              {/* Clinic Registration Upload (Optional) - Only show if already uploaded */}
              {selectedProfile.clinicRegistration && (
                <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                      🏢 {t("clinicRegistrationLabel", language)}
                    </Typography>
                    {selectedProfile.clinicRegistration && typeof selectedProfile.clinicRegistration === 'string' && (
                      <Chip label={`✅ ${t("alreadyUploaded", language)}`} size="small" color="success" variant="outlined" />
                    )}
                    {selectedProfile.clinicRegistration instanceof File && (
                      <Chip label={`📦 ${t("newFileSelected", language)}`} size="small" color="primary" variant="outlined" />
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    size="small"
                    sx={{ textTransform: "none", fontSize: "0.8rem", py: 1 }}
                  >
                    {t("chooseFile", language)}
                    <input
                      hidden
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedProfile({ ...selectedProfile, clinicRegistration: e.target.files[0] });
                        }
                      }}
                    />
                  </Button>
                </Box>
              )}
              
              {selectedProfile.status === "REJECTED" && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#c62828", mt: 2 }}>
                    ❌ {t("rejectionReasonTitle", language)}
                  </Typography>
                  <TextField
                    label={t("reasonForRejection", language)}
                    name="rejectionReason"
                    value={selectedProfile.rejectionReason || ""}
                    onChange={handleEditChange}
                    fullWidth
                    multiline
                    rows={2}
                    disabled
                    variant="outlined"
                  />
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t("cancel", language)}</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="success">
            {t("saveChanges", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      {/* Document Preview Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => {
          setDocumentDialogOpen(false);
          if (selectedDocument.url) {
            window.URL.revokeObjectURL(selectedDocument.url);
          }
        }}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.3rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
          }}
        >
          <Box>
            📄 {selectedDocument.name}
          </Box>
          <Button
            onClick={() => {
              setDocumentDialogOpen(false);
              if (selectedDocument.url) {
                window.URL.revokeObjectURL(selectedDocument.url);
              }
            }}
            sx={{
              color: "white",
              minWidth: "auto",
              fontSize: "1.5rem",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" }
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent
          sx={{
            minHeight: 500,
            p: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          {selectedDocument.url && (
            selectedDocument.contentType?.includes("pdf") ? (
              <Box
                component="iframe"
                src={selectedDocument.url}
                sx={{
                  width: "100%",
                  height: 600,
                  border: "none",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            ) : (
              <Box
                component="img"
                src={selectedDocument.url}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 600,
                  objectFit: "contain",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MyProfiles;
