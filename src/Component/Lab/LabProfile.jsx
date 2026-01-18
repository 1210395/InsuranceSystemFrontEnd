import React, { useEffect, useState, useCallback } from "react";
import { api, getToken } from "../../utils/apiService";
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
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

function LabProfile() {
  const { language, isRTL } = useLanguage();
  const _token = getToken();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Document Preview Dialog
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState({ url: "", name: "" });
  const [documentLoading, setDocumentLoading] = useState(false);
  const [_loadingDocumentName, setLoadingDocumentName] = useState("");

  // 🔹 Helper function to preview file in modal
  const handleOpenFile = async (filename, documentName) => {
    // Validate input
    if (!filename || filename.trim() === "") {
      setSnackbar({
        open: true,
        message: `${t("noFileAvailableFor", language)} ${documentName}`,
        severity: "warning"
      });
      return;
    }

    // Allow opening files normally - close previous one if open, but don't block new requests
    // Close any previously opened document and clean up
    if (documentDialogOpen && selectedDocument.url) {
      window.URL.revokeObjectURL(selectedDocument.url);
      setDocumentDialogOpen(false);
      setSelectedDocument({ url: "", name: "" });
    }

    // Set loading state but don't block - allow retries
    setDocumentLoading(true);
    setLoadingDocumentName(documentName);
    
    try {
      // Log original filename for debugging
      console.log("Original filename received:", filename);
      
      // Extract just the filename from the path
      let filenameOnly = filename.trim();
      
      // Handle Windows paths
      if (filenameOnly.includes("\\")) {
        filenameOnly = filenameOnly.split("\\").pop();
      }
      
      // Handle Unix/Mac paths
      if (filenameOnly.includes("/")) {
        filenameOnly = filenameOnly.split("/").pop();
      }
      
      // Remove query parameters if any
      if (filenameOnly.includes("?")) {
        filenameOnly = filenameOnly.split("?")[0];
      }
      
      // Decode if already URL encoded, then re-encode properly
      try {
        // Try to decode first in case it's already encoded
        if (filenameOnly.includes("%")) {
          const decoded = decodeURIComponent(filenameOnly);
          console.log("Decoded filename:", decoded);
          filenameOnly = decoded;
        }
      } catch {
        // If decoding fails, use as-is
        console.log("Filename not URL encoded, using as-is");
      }
      
      // Final validation
      if (!filenameOnly || filenameOnly === "" || filenameOnly === "." || filenameOnly === "..") {
        throw new Error("Invalid filename");
      }
      
      // Try multiple approaches to get the file
      // The + character in URLs is special - it represents a space
      // We need to handle it carefully
      let response;
      let lastError;
      const attempts = [];
      
      // Helper function to encode filename properly, handling + character
      const encodeFilename = (name) => {
        // encodeURIComponent handles most special chars, but we want to be explicit about +
        return encodeURIComponent(name);
      };
      
      // First try: Use filename exactly as stored, properly encoded
      const originalFilename = filename.trim();
      attempts.push({ name: "original encoded", value: originalFilename });
      try {
        const encoded1 = encodeFilename(originalFilename);
        console.log("Attempt 1: Original filename (encoded):", encoded1);
        response = await api.get(
          API_ENDPOINTS.SEARCH_PROFILES.FILE(encoded1),
          { responseType: 'blob', timeout: 15000 }
        );
        console.log("✅ File retrieved successfully with original filename");
      } catch (err) {
        console.log("❌ Attempt 1 failed:", err.response?.status || err.message);
        lastError = err;

        // Second try: Extracted filename, properly encoded
        attempts.push({ name: "extracted encoded", value: filenameOnly });
        try {
          const encoded2 = encodeFilename(filenameOnly);
          console.log("Attempt 2: Extracted filename (encoded):", encoded2);
          response = await api.get(
            API_ENDPOINTS.SEARCH_PROFILES.FILE(encoded2),
            { responseType: 'blob', timeout: 15000 }
          );
          console.log("✅ File retrieved successfully with extracted filename");
        } catch (err2) {
          console.log("❌ Attempt 2 failed:", err2.response?.status || err2.message);
          lastError = err2;

          // Third try: Replace + with %2B manually (in case encodeURIComponent doesn't work as expected)
          attempts.push({ name: "manual + encoding", value: filenameOnly });
          try {
            // Manually replace + with %2B before encoding
            const manualEncoded = encodeURIComponent(filenameOnly.replace(/\+/g, '%2B'));
            console.log("Attempt 3: Manual + encoding:", manualEncoded);
            response = await api.get(
              API_ENDPOINTS.SEARCH_PROFILES.FILE(manualEncoded),
              { responseType: 'blob', timeout: 15000 }
            );
            console.log("✅ File retrieved successfully with manual encoding");
          } catch (err3) {
            console.log("❌ Attempt 3 failed:", err3.response?.status || err3.message);
            lastError = err3;

            // Fourth try: Try with + replaced by space (in case backend expects space)
            attempts.push({ name: "+ as space", value: filenameOnly });
            try {
              const spaceReplaced = filenameOnly.replace(/\+/g, ' ');
              const encoded4 = encodeURIComponent(spaceReplaced);
              console.log("Attempt 4: + replaced with space:", encoded4);
              response = await api.get(
                API_ENDPOINTS.SEARCH_PROFILES.FILE(encoded4),
                { responseType: 'blob', timeout: 15000 }
              );
              console.log("✅ File retrieved successfully with space replacement");
            } catch (err4) {
              console.log("❌ Attempt 4 failed:", err4.response?.status || err4.message);
              lastError = err4;

              // Fifth try: Use filename as-is without any encoding (last resort)
              attempts.push({ name: "no encoding", value: filenameOnly });
              try {
                console.log("Attempt 5: No encoding (last resort):", filenameOnly);
                response = await api.get(
                  API_ENDPOINTS.SEARCH_PROFILES.FILE(filenameOnly),
                  { responseType: 'blob', timeout: 15000 }
                );
                console.log("✅ File retrieved successfully without encoding");
              } catch (err5) {
                console.log("❌ Attempt 5 failed:", err5.response?.status || err5.message);
                lastError = err5;

                // All attempts failed - throw the last error
                console.error("All attempts failed. Attempted filenames:", attempts);
                throw lastError;
              }
            }
          }
        }
      }
      
      // Validate response
      if (!response || !response.data || response.data.size === 0) {
        throw new Error("Empty file received from server");
      }
      
      // Create a blob URL
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Show in dialog
      setSelectedDocument({ 
        url: url, 
        name: documentName,
        contentType: response.headers['content-type'] || 'application/pdf'
      });
      setDocumentDialogOpen(true);
    } catch (err) {
      console.error("Error opening file:", err);
      console.error("Filename attempted:", filename);
      
      let errorMessage = `❌ Failed to open ${documentName}`;
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 404) {
          errorMessage = `❌ File not found: ${documentName}. The file may have been deleted or the filename is incorrect.\n\nFilename attempted: ${filename}\n\nPlease check:\n1. The file exists on the server\n2. The filename matches what was uploaded\n3. Contact support if the issue persists`;
        } else if (err.response.status === 403) {
          errorMessage = `❌ Access denied: ${documentName}`;
        } else if (err.response.status === 500) {
          errorMessage = `❌ Server error while opening ${documentName}`;
        } else {
          errorMessage = `❌ Error ${err.response.status}: Failed to open ${documentName}`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = `❌ Network error: Could not connect to server to open ${documentName}`;
      } else if (err.message) {
        // Error in request setup
        errorMessage = `❌ Error: ${err.message}`;
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: "error" 
      });
    } finally {
      setDocumentLoading(false);
      setLoadingDocumentName("");
    }
  };
  // 🔹 Fetch Lab Profiles
  const fetchProfiles = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SEARCH_PROFILES.MY);
      console.log("API Response Data:", res.data); // Debug log
      // Log filename details for debugging
      if (res.data && res.data.length > 0) {
        res.data.forEach((profile, index) => {
          console.log(`Profile ${index} filenames:`, {
            medicalLicense: profile.medicalLicense || profile.medicalLicenseFileName,
            universityDegree: profile.universityDegree || profile.universityDegreeFileName,
            idOrPassportCopy: profile.idOrPassportCopy || profile.idOrPassportCopyFileName,
            clinicRegistration: profile.clinicRegistration || profile.clinicRegistrationFileName
          });
        });
      }
      setProfiles(res.data);
    } catch (err) {
      console.error("API Error:", err); // Debug log
      setSnackbar({
        open: true,
        message: t("noLabProfilesFound", language),
        severity: "warning",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Cleanup blob URLs on component unmount
  useEffect(() => {
    return () => {
      if (selectedDocument.url) {
        window.URL.revokeObjectURL(selectedDocument.url);
      }
    };
  }, [selectedDocument.url]);

  // 🔹 Delete profile
  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteLabProfile", language)))
      return;
    try {
      await api.delete(API_ENDPOINTS.SEARCH_PROFILES.BY_ID(id));
      setSnackbar({
        open: true,
        message: t("labProfileDeletedSuccess", language),
        severity: "success",
      });
      fetchProfiles();
    } catch {
      setSnackbar({
        open: true,
        message: t("failedToDeleteLabProfile", language),
        severity: "error",
      });
    }
  };

  // 🔹 Open edit dialog
  const handleEditOpen = (profile) => {
    setSelectedProfile(profile);
    setEditDialogOpen(true);
  };

  // 🔹 Handle form change
  const handleEditChange = (e) => {
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
    try {
      const formData = new FormData();

      // Add profile data as JSON - only include fields that are not empty
      const profileData = {
        id: selectedProfile.id,
      };
      
      // Only add fields if they have values
      if (selectedProfile.name) profileData.name = selectedProfile.name;
      if (selectedProfile.address) profileData.address = selectedProfile.address;
      if (selectedProfile.contactInfo) profileData.contactInfo = selectedProfile.contactInfo;
      if (selectedProfile.description) profileData.description = selectedProfile.description;
      if (selectedProfile.locationLat !== "") profileData.locationLat = selectedProfile.locationLat;
      if (selectedProfile.locationLng !== "") profileData.locationLng = selectedProfile.locationLng;
      
      // Include existing file paths ONLY if they are strings (don't send null/undefined)
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

      // Add files only if they were changed (File objects only, not strings)
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
      setSnackbar({
        open: true,
        message: t("labProfileUpdatedSuccess", language),
        severity: "success",
      });
      setEditDialogOpen(false);
      fetchProfiles();
    } catch (err) {
      console.error("Error updating profile:", err);
      setSnackbar({
        open: true,
        message: `${t("failedToUpdateLabProfile", language)}: ${err.response?.data?.message || err.message}`,
        severity: "error",
      });
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

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  if (!profiles || profiles.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "gray" }}>
        <Typography variant="h5" fontWeight="bold">
          {t("noProfilesFound", language)}
        </Typography>
      </Box>
    );
  }

  const sortedProfiles = [...profiles].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  const filteredProfiles = sortedProfiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "100%", mx: "auto", px: 2 }}>
        {/* 📌 Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 56,
                height: 56,
              }}
            >
              🧪
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                {t("labProfiles", language)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t("manageLabFacilities", language)}
              </Typography>
            </Box>
          </Stack>

          {/* Stats Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h4" fontWeight="700">
                  {profiles.length}
                </Typography>
                <Typography variant="body2">{t("totalProfiles", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h4" fontWeight="700">
                  {profiles.filter((p) => p.status?.toLowerCase() === "approved").length}
                </Typography>
                <Typography variant="body2">{t("approved", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h4" fontWeight="700">
                  {profiles.filter((p) => p.status?.toLowerCase() === "pending").length}
                </Typography>
                <Typography variant="body2">{t("pending", language)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 🔍 Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            border: "1px solid #E8EDE0",
          }}
        >
          <TextField
            fullWidth
            placeholder={t("searchByNameAddressContact", language)}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#556B2F" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Results Count */}
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          {t("showing", language)} <strong>{filteredProfiles.length}</strong> {t("profiles", language)}
        </Typography>

        {/* Grid of Cards - 3 columns */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            "@media (max-width: 1200px)": {
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
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
                  borderRadius: 3,
                  height: "100%",
                  minHeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #E8EDE0",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: "white",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 50px rgba(85, 107, 47, 0.25)",
                    borderColor: "#556B2F",
                  },
                }}
              >
                {/* Card Header with Status */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${status.bgcolor} 0%, ${status.bgcolor}dd 100%)`,
                    p: 2.5,
                    borderBottom: `4px solid ${status.textColor}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: status.textColor,
                          width: 48,
                          height: 48,
                          fontWeight: 700,
                          fontSize: "1.2rem"
                        }}
                      >
                        🧪
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            color: status.textColor,
                            fontSize: "1rem",
                            mb: 0.3
                          }}
                        >
                          {t("labProfile", language)}
                        </Typography>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: status.textColor,
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.7rem",
                          }}
                          icon={
                            <Box component="span" sx={{ fontSize: "11px" }}>
                              {status.icon}
                            </Box>
                          }
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 2.5, display: "flex", flexDirection: "column" }}>
                  {/* Profile Name */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#E8EDE0",
                      border: "2px solid #556B2F",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#F5F5DC",
                        boxShadow: "0 4px 12px rgba(85, 107, 47, 0.2)"
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#556B2F",
                        width: 45,
                        height: 45,
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#556B2F",
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
                          color: "#3D4F23",
                          fontSize: "1.1rem",
                          lineHeight: 1.2
                        }}
                      >
                        {p.name}
                      </Typography>
                    </Box>
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
                        {t("address", language)}
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
                        {t("contactInfo", language)}
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
                          {t("description", language)}
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

                  <Divider sx={{ my: 1.5 }} />

                  {/* View on Map Button */}
                  {p.locationLat && p.locationLng && (
                    <Box
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        p: 1.5,
                        background: "linear-gradient(135deg, #E8EDE0 0%, #F5F5DC 100%)",
                        border: "1px solid #8B9A46",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(85, 107, 47, 0.3)",
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
                          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                          color: "white",
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          py: 1,
                          borderRadius: 1.5,
                          boxShadow: "0 2px 8px rgba(85, 107, 47, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
                            boxShadow: "0 4px 16px rgba(85, 107, 47, 0.4)",
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
                          bgcolor: (p.medicalLicense || p.medicalLicenseFileName) ? "#E8F5E9" : "#FFF3E0",
                          border: (p.medicalLicense || p.medicalLicenseFileName) ? "1px solid #4CAF50" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: (p.medicalLicense || p.medicalLicenseFileName) ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": (p.medicalLicense || p.medicalLicenseFileName) ? { boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            📜 Lab License - رخصة مزاولة فني المختبر
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {(p.medicalLicense || p.medicalLicenseFileName) ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {(p.medicalLicense || p.medicalLicenseFileName) && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.medicalLicense || p.medicalLicenseFileName, "  Lab License - رخصة مزاولة فني المختبر")}
                            sx={{ 
                              fontSize: "0.7rem", 
                              py: 0.4, 
                              px: 1.2, 
                              bgcolor: "#4CAF50", 
                              "&:hover": { bgcolor: "#45a049" },
                              "&:disabled": { bgcolor: "#cccccc", color: "#666666" }
                            }}
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
                          bgcolor: (p.universityDegree || p.universityDegreeFileName) ? "#E3F2FD" : "#FFF3E0",
                          border: (p.universityDegree || p.universityDegreeFileName) ? "1px solid #2196F3" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: (p.universityDegree || p.universityDegreeFileName) ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": (p.universityDegree || p.universityDegreeFileName) ? { boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            📋 University Degree - الشهادة الجامعية
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {(p.universityDegree || p.universityDegreeFileName) ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {(p.universityDegree || p.universityDegreeFileName) && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.universityDegree || p.universityDegreeFileName, "University Degree - الشهادة الجامعية")}
                            sx={{ 
                              fontSize: "0.7rem", 
                              py: 0.4, 
                              px: 1.2, 
                              bgcolor: "#2196F3", 
                              "&:hover": { bgcolor: "#0b7dda" },
                              "&:disabled": { bgcolor: "#cccccc", color: "#666666" }
                            }}
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
                          bgcolor: (p.idOrPassportCopy || p.idOrPassportCopyFileName) ? "#F3E5F5" : "#FFF3E0",
                          border: (p.idOrPassportCopy || p.idOrPassportCopyFileName) ? "1px solid #9C27B0" : "1px solid #FFB74D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: (p.idOrPassportCopy || p.idOrPassportCopyFileName) ? "pointer" : "default",
                          transition: "all 0.2s ease",
                          minHeight: 52,
                          "&:hover": (p.idOrPassportCopy || p.idOrPassportCopyFileName) ? { boxShadow: "0 2px 8px rgba(156, 39, 176, 0.3)" } : {},
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.75rem" }}>
                            🪪 ID/Passport Copy - نسخة هويية
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                            {(p.idOrPassportCopy || p.idOrPassportCopyFileName) ? t("uploaded", language) : t("notProvided", language)}
                          </Typography>
                        </Box>
                        {(p.idOrPassportCopy || p.idOrPassportCopyFileName) && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.idOrPassportCopy || p.idOrPassportCopyFileName, "ID/Passport Copy - نسخة هويية")}
                            sx={{ 
                              fontSize: "0.7rem", 
                              py: 0.4, 
                              px: 1.2, 
                              bgcolor: "#9C27B0", 
                              "&:hover": { bgcolor: "#7b1fa2" },
                              "&:disabled": { bgcolor: "#cccccc", color: "#666666" }
                            }}
                          >
                            {t("open", language)}
                          </Button>
                        )}
                      </Box>

                      {/* Laboratory Registration (Optional) */}
                      {(p.clinicRegistration || p.clinicRegistrationFileName) && (
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
                              🏢 Laboratory Registration - تسجيل المختبر
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", color: "#5d6b5d", fontSize: "0.7rem" }}>
                              {t("uploaded", language)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenFile(p.clinicRegistration || p.clinicRegistrationFileName, "Laboratory Registration - تسجيل المختبر")}
                            sx={{ 
                              fontSize: "0.7rem", 
                              py: 0.4, 
                              px: 1.2, 
                              bgcolor: "#FF9800", 
                              "&:hover": { bgcolor: "#F57C00" },
                              "&:disabled": { bgcolor: "#cccccc", color: "#666666" }
                            }}
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
                          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
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
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)", color: "white", fontWeight: 700 }}>{t("editLabProfile", language)}</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedProfile && (
            <Stack spacing={2.5}>
              {/* Summary of Current Data */}
              <Paper sx={{ p: 2, bgcolor: "#E8EDE0", border: "1px solid #8B9A46", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#556B2F", mb: 1 }}>
                  {t("currentInformation", language)}
                </Typography>
                <Grid container spacing={1}>
                  {selectedProfile.name && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
                        <strong>Name:</strong> {selectedProfile.name}
                      </Typography>
                    </Grid>
                  )}
                  {selectedProfile.address && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
                        <strong>Address:</strong> {selectedProfile.address}
                      </Typography>
                    </Grid>
                  )}
                  {selectedProfile.contactInfo && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
                        <strong>Contact:</strong> {selectedProfile.contactInfo}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              <Divider />
              
              <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#556B2F", mt: 2 }}>
                {t("editFieldsBelow", language)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.85rem", fontStyle: "italic" }}>
                {t("editFieldsHelp", language)}
              </Typography>
              
              <TextField
                label={t("labName", language)}
                name="name"
                value={selectedProfile.name || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterLabName", language)}
              />

              <TextField
                label={t("address", language)}
                name="address"
                value={selectedProfile.address || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterAddress", language)}
              />

              <TextField
                label={t("contactInfo", language)}
                name="contactInfo"
                value={selectedProfile.contactInfo || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder={t("enterContactInfo", language)}
              />

              <TextField
                label={t("description", language)}
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
                label={t("latitude", language)}
                name="locationLat"
                type="number"
                value={selectedProfile.locationLat || ""}
                onChange={handleEditChange}
                fullWidth
                variant="outlined"
                placeholder="e.g., 24.7136"
              />

              <TextField
                label={t("longitude", language)}
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
                {t("useMyCurrentLocation", language)}
              </Button>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: "700", color: "#556B2F" }}>{t("uploadDocuments", language)}</Typography>
              <Typography variant="caption" sx={{ color: "#999", fontSize: "0.8rem", display: "block", mb: 2 }}>
                {t("optionalDocumentsHelp", language)}
              </Typography>
              
              {/* Medical License Upload */}
              <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                    📜 Lab License - رخصة مزاولة فني المختبر
                  </Typography>
                  {selectedProfile.medicalLicense && typeof selectedProfile.medicalLicense === 'string' && (
                    <Chip label={t("alreadyUploaded", language)} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.medicalLicense instanceof File && (
                    <Chip label={t("newFileSelected", language)} size="small" color="primary" variant="outlined" />
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
                    📋 University Degree - الشهادة الجامعية
                  </Typography>
                  {selectedProfile.universityDegree && typeof selectedProfile.universityDegree === 'string' && (
                    <Chip label={t("alreadyUploaded", language)} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.universityDegree instanceof File && (
                    <Chip label={t("newFileSelected", language)} size="small" color="primary" variant="outlined" />
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
                    🪪 ID/Passport Copy - نسخة هويية
                  </Typography>
                  {selectedProfile.idOrPassportCopy && typeof selectedProfile.idOrPassportCopy === 'string' && (
                    <Chip label={t("alreadyUploaded", language)} size="small" color="success" variant="outlined" />
                  )}
                  {selectedProfile.idOrPassportCopy instanceof File && (
                    <Chip label={t("newFileSelected", language)} size="small" color="primary" variant="outlined" />
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

              {/* Laboratory Registration Upload (Optional) - Only show if already uploaded */}
              {selectedProfile.clinicRegistration && (
                <Box sx={{ p: 1.5, border: "1px solid #E8EDE0", borderRadius: 2, bgcolor: "#FAF8F5" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: "600", color: "#4A5D4A", fontSize: "0.8rem" }}>
                      🏢 Laboratory Registration - تسجيل المختبر
                    </Typography>
                    {selectedProfile.clinicRegistration && typeof selectedProfile.clinicRegistration === 'string' && (
                      <Chip label={t("alreadyUploaded", language)} size="small" color="success" variant="outlined" />
                    )}
                    {selectedProfile.clinicRegistration instanceof File && (
                      <Chip label={t("newFileSelected", language)} size="small" color="primary" variant="outlined" />
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

      {/* Document Preview Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => {
          // Clean up blob URL when closing
          if (selectedDocument.url) {
            window.URL.revokeObjectURL(selectedDocument.url);
          }
          setDocumentDialogOpen(false);
          setSelectedDocument({ url: "", name: "" });
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
            background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
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
            {selectedDocument.name || t("documentPreview", language)}
          </Box>
          <Button
            onClick={() => {
              // Clean up blob URL when closing
              if (selectedDocument.url) {
                window.URL.revokeObjectURL(selectedDocument.url);
              }
              setDocumentDialogOpen(false);
              setSelectedDocument({ url: "", name: "" });
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
          {documentLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" color="text.secondary">
                {t("loadingDocument", language)}
              </Typography>
            </Box>
          ) : selectedDocument.url ? (
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
                alt={selectedDocument.name}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 600,
                  objectFit: "contain",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            )
          ) : (
            <Typography variant="body1" color="text.secondary">
              {t("noDocumentToDisplay", language)}
            </Typography>
          )}
        </DialogContent>
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
    </Box>
  );
}

export default LabProfile;
