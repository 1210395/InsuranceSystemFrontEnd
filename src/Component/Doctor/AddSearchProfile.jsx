import React, { useState } from "react";
import { api, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MapIcon from "@mui/icons-material/Map";
import { MapPicker } from "../Shared/MapPicker";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

// Maximum file size: 5MB
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed file types for document uploads
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

// Coordinate validation helpers
const isValidLatitude = (lat) => {
  const numLat = parseFloat(lat);
  return !isNaN(numLat) && numLat >= -90 && numLat <= 90;
};

const isValidLongitude = (lng) => {
  const numLng = parseFloat(lng);
  return !isNaN(numLng) && numLng >= -180 && numLng <= 180;
};

function AddSearchProfileDoctor({ refresh }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { language } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    type: "CLINIC",
    address: "",
    locationLat: "",
    locationLng: "",
    contactInfo: "",
    description: "",
  });

  const [files, setFiles] = useState({
    medicalLicense: null,
    universityDegree: null,
    clinicRegistration: null,
    idOrPassportCopy: null,
  });

  const [fileNames, setFileNames] = useState({
    medicalLicense: "",
    universityDegree: "",
    clinicRegistration: "",
    idOrPassportCopy: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mapOpen, setMapOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
                          ALLOWED_EXTENSIONS.includes(fileExtension);

      if (!isValidType) {
        setSnackbar({
          open: true,
          message: `File "${file.name}" has an invalid type. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG.`,
          severity: "error",
        });
        // Reset the input
        e.target.value = "";
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setSnackbar({
          open: true,
          message: `File "${file.name}" exceeds the maximum size of ${MAX_FILE_SIZE_MB}MB. Please choose a smaller file.`,
          severity: "error",
        });
        // Reset the input
        e.target.value = "";
        return;
      }
      setFiles({ ...files, [fieldName]: file });
      setFileNames({ ...fileNames, [fieldName]: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    if (!token) {
      setSnackbar({
        open: true,
        message: "Please login first",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      // Validate required fields
      const errors = [];

      if (!form.name || form.name.trim() === "") {
        errors.push("Clinic/Doctor name is required");
      }

      if (!form.contactInfo || form.contactInfo.trim() === "") {
        errors.push("Contact information is required");
      }

      // Validate required documents
      if (!files.medicalLicense) {
        errors.push("Medical License is required (رخصة مزاولة المهنة)");
      }

      if (!files.universityDegree) {
        errors.push("University Degree is required (الشهادة الجامعية)");
      }

      if (!files.idOrPassportCopy) {
        errors.push("ID/Passport Copy is required (نسخة الهوية)");
      }

      // Validate coordinates if provided
      if (form.locationLat && !isValidLatitude(form.locationLat)) {
        errors.push("Latitude must be between -90 and 90 degrees");
      }

      if (form.locationLng && !isValidLongitude(form.locationLng)) {
        errors.push("Longitude must be between -180 and 180 degrees");
      }

      // If there are errors, show them
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: `Please complete the following: ${errors.join("; ")}`,
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // Create the DTO object
      const dto = {
        name: form.name.trim(),
        type: form.type,
        address: form.address || "",
        locationLat: form.locationLat ? parseFloat(form.locationLat) : null,
        locationLng: form.locationLng ? parseFloat(form.locationLng) : null,
        contactInfo: form.contactInfo.trim(),
        description: form.description || "",
      };

      // Create FormData with the correct structure expected by backend
      const formData = new FormData();

      // Add DTO as JSON in "data" part
      formData.append("data", new Blob([JSON.stringify(dto)], { type: "application/json" }));

      // Add required files (REQUIRED)
      formData.append("medicalLicense", files.medicalLicense);
      formData.append("universityDegree", files.universityDegree);
      formData.append("idOrPassportCopy", files.idOrPassportCopy);

      // Add optional file (OPTIONAL - only if selected)
      if (files.clinicRegistration) {
        formData.append("clinicRegistration", files.clinicRegistration);
      }

      // api.post returns response.data directly (not the full axios response)
      await api.post(API_ENDPOINTS.SEARCH_PROFILES.CREATE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // If we reach here, the request was successful (no exception thrown)
      setSnackbar({
        open: true,
        message: "Your profile was created successfully! (Pending Approval). You will be notified once it's reviewed.",
        severity: "success",
      });

      // Reset form
      setForm({
        name: "",
        type: "CLINIC",
        address: "",
        locationLat: "",
        locationLng: "",
        contactInfo: "",
        description: "",
      });

      // Reset files
      setFiles({
        medicalLicense: null,
        universityDegree: null,
        clinicRegistration: null,
        idOrPassportCopy: null,
      });

      setFileNames({
        medicalLicense: "",
        universityDegree: "",
        clinicRegistration: "",
        idOrPassportCopy: "",
      });

      if (refresh) refresh();
    } catch (err) {
      console.error("Error creating doctor search profile:", err);

      let errorMessage = "Failed to create profile. Please try again.";

      if (err.response?.status === 400) {
        errorMessage = "Invalid data. Please check your inputs and try again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to create profiles.";
      } else if (err.response?.status === 409) {
        errorMessage = "A profile with this name already exists.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Failed to create profile: ${err.message}`;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    // Validate coordinates before setting
    if (!isValidLatitude(lat)) {
      setSnackbar({
        open: true,
        message: "Invalid latitude. Must be between -90 and 90 degrees.",
        severity: "error",
      });
      return;
    }

    if (!isValidLongitude(lng)) {
      setSnackbar({
        open: true,
        message: "Invalid longitude. Must be between -180 and 180 degrees.",
        severity: "error",
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
    }));
    setSnackbar({
      open: true,
      message: "Location selected successfully!",
      severity: "success",
    });
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#E8EDE0" },
      "&:hover fieldset": { borderColor: "#7B8B5E" },
      "&.Mui-focused fieldset": {
        borderColor: "#556B2F",
        boxShadow: "0 0 0 2px rgba(85, 107, 47, 0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      color: "#556B2F",
    },
  };

  return (
    <>
      <Box sx={{ py: { xs: 2, sm: 3 }, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 } }}>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              mb: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: "linear-gradient(135deg, #556B2F 0%, #3D4F23 100%)",
              color: "white",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                }}
              >
                <BusinessIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              <Box>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight="700"
                  sx={{ mb: 0.5 }}
                >
                  {t("addDoctorProfile", language)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  {t("addDoctorProfileDesc", language)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Form Card */}
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3, md: 4 },
              boxShadow: "0 8px 24px rgba(85, 107, 47, 0.15)",
              border: "1px solid #E8EDE0",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {/* Type Selection */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: 1.5,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("selectProfileType", language)}
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>{t("profileTypeLabel", language)}</InputLabel>
                      <Select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        label={t("profileTypeLabel", language)}
                        sx={{
                          borderRadius: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      >
                        <MenuItem value="CLINIC">🏥 {t("clinic", language)}</MenuItem>
                        <MenuItem value="DOCTOR">👨‍⚕️ {t("doctorOffice", language)}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Divider />

                  {/* Basic Information */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: { xs: 1.5, sm: 2 },
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("basicInformation", language)}
                    </Typography>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                      <Grid item xs={12}>
                        <TextField
                          label={form.type === "CLINIC" ? t("clinicNameLabel", language) : t("doctorOfficeNameLabel", language)}
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder={form.type === "CLINIC" ? t("enterClinicName", language) : t("enterDoctorOfficeName", language)}
                          required
                          fullWidth
                          sx={fieldSx}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon sx={{ color: "#556B2F", mr: 1 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={t("address", language)}
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder={t("enterYourAddress", language)}
                          fullWidth
                          sx={fieldSx}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: "#556B2F", mr: 1 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={t("contactInfo", language)}
                          name="contactInfo"
                          value={form.contactInfo}
                          onChange={handleChange}
                          placeholder={t("phoneOrEmail", language)}
                          fullWidth
                          sx={fieldSx}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: "#556B2F", mr: 1 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Location */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: { xs: 1.5, sm: 2 },
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("location", language)}
                    </Typography>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          py: { xs: 1.5, sm: 1.3 },
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                          boxShadow: "0 4px 12px rgba(85, 107, 47, 0.2)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
                            boxShadow: "0 6px 16px rgba(85, 107, 47, 0.3)",
                          },
                        }}
                        startIcon={<MapIcon />}
                        onClick={() => setMapOpen(true)}
                      >
                        {t("openMapSelectLocation", language)}
                      </Button>
                      {form.locationLat && form.locationLng && (
                        <Box sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: "#E8EDE0", borderRadius: 2, border: "1px solid #556B2F" }}>
                          <Typography variant="body2" sx={{ color: "#3D4F23", fontWeight: 600 }}>
                            {t("locationSelected", language)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#5A6B5A", display: "block" }}>
                            Lat: {parseFloat(form.locationLat).toFixed(6)} | Lng: {parseFloat(form.locationLng).toFixed(6)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Description */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: 1.5,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("description", language)}
                    </Typography>
                    <TextField
                      label={t("additionalInformation", language)}
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder={t("describeServices", language)}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ mt: 1 }}>
                            <DescriptionIcon sx={{ color: "#556B2F", mr: 1 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Divider />

                  {/* Document Fields */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: { xs: 1.5, sm: 2 },
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("requiredDocumentsLabel", language)}
                    </Typography>
                    <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                      {/* Medical License Upload */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1, gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                              {t("medicalLicense", language)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#4A5D4A" }}>
                              {t("required", language)} *
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            id="medicalLicense"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "medicalLicense")}
                            style={{ display: "none" }}
                            required
                          />
                          <label htmlFor="medicalLicense" style={{ width: "100%" }}>
                            <Button
                              component="span"
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              sx={{
                                borderRadius: 2,
                                borderColor: files.medicalLicense ? "#3D4F23" : "#7B8B5E",
                                borderWidth: 2,
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                backgroundColor: files.medicalLicense ? "rgba(85, 107, 47, 0.08)" : "transparent",
                                color: files.medicalLicense ? "#3D4F23" : "#556B2F",
                                fontWeight: 600,
                                transition: "all 0.3s",
                                "&:hover": {
                                  backgroundColor: "rgba(85, 107, 47, 0.1)",
                                  borderColor: "#556B2F",
                                },
                              }}
                              startIcon={<CloudUploadIcon />}
                            >
                              {fileNames.medicalLicense ? fileNames.medicalLicense : `${t("uploadLicense", language)} *`}
                            </Button>
                          </label>
                          <Typography variant="caption" sx={{ color: "#4A5D4A", mt: 0.5, display: "block", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {t("licenseToPractice", language)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* University Degree Upload */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1, gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                              {t("universityDegree", language)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#4A5D4A" }}>
                              {t("required", language)} *
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            id="universityDegree"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "universityDegree")}
                            style={{ display: "none" }}
                            required
                          />
                          <label htmlFor="universityDegree" style={{ width: "100%" }}>
                            <Button
                              component="span"
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              sx={{
                                borderRadius: 2,
                                borderColor: files.universityDegree ? "#3D4F23" : "#7B8B5E",
                                borderWidth: 2,
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                backgroundColor: files.universityDegree ? "rgba(85, 107, 47, 0.08)" : "transparent",
                                color: files.universityDegree ? "#3D4F23" : "#556B2F",
                                fontWeight: 600,
                                transition: "all 0.3s",
                                "&:hover": {
                                  backgroundColor: "rgba(85, 107, 47, 0.1)",
                                  borderColor: "#556B2F",
                                },
                              }}
                              startIcon={<CloudUploadIcon />}
                            >
                              {fileNames.universityDegree ? fileNames.universityDegree : `${t("uploadDegree", language)} *`}
                            </Button>
                          </label>
                          <Typography variant="caption" sx={{ color: "#4A5D4A", mt: 0.5, display: "block", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {t("universityCertificate", language)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* ID or Passport Copy Upload */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1, gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                              {t("idOrPassportCopy", language)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#4A5D4A" }}>
                              {t("required", language)} *
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            id="idOrPassportCopy"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "idOrPassportCopy")}
                            style={{ display: "none" }}
                            required
                          />
                          <label htmlFor="idOrPassportCopy" style={{ width: "100%" }}>
                            <Button
                              component="span"
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              sx={{
                                borderRadius: 2,
                                borderColor: files.idOrPassportCopy ? "#3D4F23" : "#7B8B5E",
                                borderWidth: 2,
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                backgroundColor: files.idOrPassportCopy ? "rgba(85, 107, 47, 0.08)" : "transparent",
                                color: files.idOrPassportCopy ? "#3D4F23" : "#556B2F",
                                fontWeight: 600,
                                transition: "all 0.3s",
                                "&:hover": {
                                  backgroundColor: "rgba(85, 107, 47, 0.1)",
                                  borderColor: "#556B2F",
                                },
                              }}
                              startIcon={<CloudUploadIcon />}
                            >
                              {fileNames.idOrPassportCopy ? fileNames.idOrPassportCopy : `${t("uploadId", language)} *`}
                            </Button>
                          </label>
                          <Typography variant="caption" sx={{ color: "#4A5D4A", mt: 0.5, display: "block", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {t("idPassportCopy", language)}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Clinic Registration Upload (Optional) */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 1, gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                              {t("clinicRegistration", language)}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#4A5D4A" }}>
                              {t("optional", language)}
                            </Typography>
                          </Box>
                          <input
                            type="file"
                            id="clinicRegistration"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, "clinicRegistration")}
                            style={{ display: "none" }}
                          />
                          <label htmlFor="clinicRegistration" style={{ width: "100%" }}>
                            <Button
                              component="span"
                              fullWidth
                              variant="outlined"
                              color="inherit"
                              sx={{
                                borderRadius: 2,
                                borderColor: files.clinicRegistration ? "#3D4F23" : "#7B8B5E",
                                borderWidth: 2,
                                py: { xs: 1.2, sm: 1.5 },
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                backgroundColor: files.clinicRegistration ? "rgba(85, 107, 47, 0.08)" : "transparent",
                                color: files.clinicRegistration ? "#3D4F23" : "#556B2F",
                                fontWeight: 600,
                                transition: "all 0.3s",
                                "&:hover": {
                                  backgroundColor: "rgba(85, 107, 47, 0.1)",
                                  borderColor: "#556B2F",
                                },
                              }}
                              startIcon={<CloudUploadIcon />}
                            >
                              {fileNames.clinicRegistration ? fileNames.clinicRegistration : t("uploadRegistration", language)}
                            </Button>
                          </label>
                          <Typography variant="caption" sx={{ color: "#4A5D4A", mt: 0.5, display: "block", fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                            {t("clinicRegCertificate", language)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !files.medicalLicense || !files.universityDegree || !files.idOrPassportCopy}
                    fullWidth
                    sx={{
                      py: { xs: 1.5, sm: 1.5 },
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                      boxShadow: "0 6px 20px rgba(85, 107, 47, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
                        boxShadow: "0 8px 25px rgba(85, 107, 47, 0.4)",
                      },
                      "&:disabled": {
                        background: "linear-gradient(90deg, #b0bec5, #90a4ae)",
                        cursor: "not-allowed",
                      },
                    }}
                    startIcon={<SaveIcon />}
                  >
                    {loading ? t("saving", language) : t("saveProfile", language)}
                  </Button>

                  {/* Helper Text for Required Documents */}
                  {(!files.medicalLicense || !files.universityDegree || !files.idOrPassportCopy) && (
                    <Box sx={{ mt: { xs: 1.5, sm: 2 }, p: { xs: 1.5, sm: 2 }, backgroundColor: "#F5F5DC", borderRadius: 2, border: "1px solid #8B9A46" }}>
                      <Typography variant="body2" sx={{ color: "#3D4F23", fontWeight: 600, mb: 1, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        {t("requiredDocumentsMissing", language)}
                      </Typography>
                      <Stack spacing={0.5}>
                        {!files.medicalLicense && (
                          <Typography variant="caption" sx={{ color: "#5A6B5A", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                            - {t("medicalLicense", language)}
                          </Typography>
                        )}
                        {!files.universityDegree && (
                          <Typography variant="caption" sx={{ color: "#5A6B5A", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                            - {t("universityDegree", language)}
                          </Typography>
                        )}
                        {!files.idOrPassportCopy && (
                          <Typography variant="caption" sx={{ color: "#5A6B5A", fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                            - {t("idOrPassportCopy", language)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Info Text */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#4A5D4A",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    ℹ️ {t("profilePendingApproval", language)}
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar - longer duration for errors to allow reading */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "error" ? 6000 : 4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Map Picker Dialog */}
      <MapPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}

export default AddSearchProfileDoctor;
