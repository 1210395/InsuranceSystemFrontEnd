import React, { useState } from "react";
import { api } from "../../utils/apiService";
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
  Grid,
  Paper,
  InputAdornment,
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

function AddSearchProfileLabWorker({ refresh }) {
  const { language, isRTL } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    type: "LAB",
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
      setFiles({ ...files, [fieldName]: file });
      setFileNames({ ...fileNames, [fieldName]: file.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const errors = [];

      if (!form.name || form.name.trim() === "") {
        errors.push(t("laboratoryNameRequired", language));
      }

      if (!form.contactInfo || form.contactInfo.trim() === "") {
        errors.push(t("contactInfoRequired", language));
      }

      // Validate required documents
      if (!files.medicalLicense) {
        errors.push(t("medicalLicenseRequired", language));
      }

      if (!files.universityDegree) {
        errors.push(t("universityDegreeRequired", language));
      }

      if (!files.idOrPassportCopy) {
        errors.push(t("idPassportCopyRequired", language));
      }

      // If there are errors, show them
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: `${t("pleaseCompleteFollowing", language)}:\n\n${errors.join("\n")}`,
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

      const response = await api.post(API_ENDPOINTS.SEARCH_PROFILES.CREATE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: t("labProfileCreatedSuccess", language),
          severity: "success",
        });

        // Reset form
        setForm({
          name: "",
          type: "LAB",
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
      }
    } catch (err) {
      console.error("Error creating lab worker search profile:", err);

      let errorMessage = t("failedToCreateProfile", language);

      if (err.response?.status === 400) {
        errorMessage = t("invalidDataCheckInputs", language);
      } else if (err.response?.status === 403) {
        errorMessage = t("noPermissionToCreateProfiles", language);
      } else if (err.response?.status === 409) {
        errorMessage = t("profileWithNameAlreadyExists", language);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
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
    setForm((prev) => ({
      ...prev,
      locationLat: lat,
      locationLng: lng,
    }));
    setSnackbar({
      open: true,
      message: t("locationSelectedSuccess", language),
      severity: "success",
    });
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#E8EDE0" },
      "&:hover fieldset": { borderColor: "#556B2F" },
      "&.Mui-focused fieldset": {
        borderColor: "#556B2F",
        boxShadow: "0 0 0 2px rgba(85,107,47,0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      color: "#556B2F",
    },
  };

  return (
    <>
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: 700, mx: "auto", px: 2 }}>
          {/* Header Section */}
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
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                  {t("addLabProfile", language)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {t("createLabProfileDesc", language)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Form Card */}
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(85,107,47,0.15)",
              border: "1px solid #E8EDE0",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Basic Information */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: 2,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("basicInformation", language)}
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label={t("laboratoryName", language)}
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t("enterLabName", language)}
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

                      <TextField
                        label={t("address", language)}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder={t("enterAddress", language)}
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
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Location */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#556B2F",
                        mb: 2,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("location", language)}
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          py: 1.3,
                          borderRadius: 2,
                          fontWeight: 600,
                          background: "linear-gradient(90deg, #556B2F, #7B8B5E)",
                          boxShadow: "0 4px 12px rgba(85,107,47,0.2)",
                          "&:hover": {
                            background: "linear-gradient(90deg, #3D4F23, #556B2F)",
                            boxShadow: "0 6px 16px rgba(85,107,47,0.3)",
                          },
                        }}
                        startIcon={<MapIcon />}
                        onClick={() => setMapOpen(true)}
                      >
                        {t("openMapSelectLocation", language)}
                      </Button>
                      {form.locationLat && form.locationLng && (
                        <Box sx={{ p: 2, backgroundColor: "#E8F5E9", borderRadius: 2, border: "1px solid #4CAF50" }}>
                          <Typography variant="body2" sx={{ color: "#2E7D32", fontWeight: 600 }}>
                            {t("locationSelected", language)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#558B2F", display: "block" }}>
                            Lat: {form.locationLat.toFixed(6)} | Lng: {form.locationLng.toFixed(6)}
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
                      placeholder={t("describeLabSpecialties", language)}
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
                        mb: 2,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("requiredDocuments", language)}
                    </Typography>
                    <Stack spacing={2}>
                      {/* Medical License Upload */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F" }}>
                            📄 Lab License - رخصة مزاولة فني المختبر
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#666" }}>
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
                              borderColor: files.medicalLicense ? "#4CAF50" : "#556B2F",
                              borderWidth: 2,
                              py: 1.5,
                              backgroundColor: files.medicalLicense ? "rgba(76, 175, 80, 0.05)" : "transparent",
                              color: files.medicalLicense ? "#4CAF50" : "#556B2F",
                              fontWeight: 600,
                              transition: "all 0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(85, 107, 47, 0.1)",
                                borderColor: "#556B2F",
                              },
                            }}
                            startIcon={<CloudUploadIcon />}
                          >
                            {fileNames.medicalLicense ? `✅ ${fileNames.medicalLicense}` : "📄 Medical License *"}
                          </Button>
                        </label>
                        <Typography variant="caption" sx={{ color: "#666", mt: 0.5, display: "block" }}>
                          {t("licenseToPracticeFormats", language)}
                        </Typography>
                      </Box>

                      {/* University Degree Upload */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F" }}>
                            🎓 University Degree - الشهادة الجامعية
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#666" }}>
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
                              borderColor: files.universityDegree ? "#4CAF50" : "#556B2F",
                              borderWidth: 2,
                              py: 1.5,
                              backgroundColor: files.universityDegree ? "rgba(76, 175, 80, 0.05)" : "transparent",
                              color: files.universityDegree ? "#4CAF50" : "#556B2F",
                              fontWeight: 600,
                              transition: "all 0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(85, 107, 47, 0.1)",
                                borderColor: "#556B2F",
                              },
                            }}
                            startIcon={<CloudUploadIcon />}
                          >
                            {fileNames.universityDegree ? `✅ ${fileNames.universityDegree}` : "🎓 University Degree *"}
                          </Button>
                        </label>
                        <Typography variant="caption" sx={{ color: "#666", mt: 0.5, display: "block" }}>
                          {t("universityDegreeCertFormats", language)}
                        </Typography>
                      </Box>

                      {/* ID or Passport Copy Upload */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F" }}>
                            🪪 ID/Passport Copy - نسخة الهوية
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#666" }}>
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
                              borderColor: files.idOrPassportCopy ? "#4CAF50" : "#556B2F",
                              borderWidth: 2,
                              py: 1.5,
                              backgroundColor: files.idOrPassportCopy ? "rgba(76, 175, 80, 0.05)" : "transparent",
                              color: files.idOrPassportCopy ? "#4CAF50" : "#556B2F",
                              fontWeight: 600,
                              transition: "all 0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(85, 107, 47, 0.1)",
                                borderColor: "#556B2F",
                              },
                            }}
                            startIcon={<CloudUploadIcon />}
                          >
                            {fileNames.idOrPassportCopy ? `✅ ${fileNames.idOrPassportCopy}` : "🪪 ID/Passport Copy *"}
                          </Button>
                        </label>
                        <Typography variant="caption" sx={{ color: "#666", mt: 0.5, display: "block" }}>
                          {t("idPassportCopyFormats", language)}
                        </Typography>
                      </Box>

                      {/* Clinic Registration Upload (Optional) */}
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#556B2F" }}>
                            🏢 Laboratory Registration - تسجيل المختبر
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#666" }}>
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
                              borderColor: files.clinicRegistration ? "#4CAF50" : "#556B2F",
                              borderWidth: 2,
                              py: 1.5,
                              backgroundColor: files.clinicRegistration ? "rgba(76, 175, 80, 0.05)" : "transparent",
                              color: files.clinicRegistration ? "#4CAF50" : "#556B2F",
                              fontWeight: 600,
                              transition: "all 0.3s",
                              "&:hover": {
                                backgroundColor: "rgba(85, 107, 47, 0.1)",
                                borderColor: "#556B2F",
                              },
                            }}
                            startIcon={<CloudUploadIcon />}
                          >
                            {fileNames.clinicRegistration ? `✅ ${fileNames.clinicRegistration}` : "🏢 Laboratory Registration (Optional)"}
                          </Button>
                        </label>
                        <Typography variant="caption" sx={{ color: "#666", mt: 0.5, display: "block" }}>
                          {t("labRegistrationCertFormats", language)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !files.medicalLicense || !files.universityDegree || !files.idOrPassportCopy}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: "1rem",
                      background: "linear-gradient(90deg, #556B2F, #7B8B5E)",
                      boxShadow: "0 6px 20px rgba(85,107,47,0.3)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #3D4F23, #556B2F)",
                        boxShadow: "0 8px 25px rgba(85,107,47,0.4)",
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
                    <Box sx={{ mt: 2, p: 2, backgroundColor: "#FFF3E0", borderRadius: 2, border: "1px solid #FFB74D" }}>
                      <Typography variant="body2" sx={{ color: "#E65100", fontWeight: 600, mb: 1 }}>
                        {t("requiredDocumentsMissing", language)}
                      </Typography>
                      <Stack spacing={0.5}>
                        {!files.medicalLicense && (
                          <Typography variant="caption" sx={{ color: "#D84315" }}>
                            • 📄 Lab License - رخصة مزاولة فني المختبر
                          </Typography>
                        )}
                        {!files.universityDegree && (
                          <Typography variant="caption" sx={{ color: "#D84315" }}>
                            • 🎓 University Degree - الشهادة الجامعية
                          </Typography>
                        )}
                        {!files.idOrPassportCopy && (
                          <Typography variant="caption" sx={{ color: "#D84315" }}>
                            • 🪪 ID/Passport Copy - نسخة الهوية
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Info Text */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    {t("profilePendingApproval", language)}
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default AddSearchProfileLabWorker;
