
import React, { useState } from "react";
import { api, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

// Phone number validation helper - supports various formats
const isValidPhoneNumber = (phone) => {
  if (!phone || phone.trim() === "") return false;
  // Remove spaces, dashes, and parentheses for validation
  const cleanedPhone = phone.replace(/[\s\-()]/g, "");
  // Matches: +970, 970, 05X, or international formats
  // Allows 9-15 digits with optional + prefix
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  return phoneRegex.test(cleanedPhone);
};

const AddEmergency = ({ onAdded }) => {
  const { language, isRTL } = useLanguage();
  const [searchType, setSearchType] = useState("employeeId");
  const [newRequest, setNewRequest] = useState({
    employeeId: "",
    nationalId: "",
    clientName: "",
    description: "",
    location: "",
    contactPhone: "",
    incidentDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [patientInfoLoaded, setPatientInfoLoaded] = useState(false);
  const [mainClientInfo, setMainClientInfo] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : "";
    } catch (error) {
      console.error("Error calculating age:", error);
      return "";
    }
  };

  const handleEmployeeIdLookup = async () => {
    if (!newRequest.employeeId.trim()) {
      setSnackbar({
        open: true,
        message: t("pleaseEnterEmployeeId", language),
        severity: "warning",
      });
      return;
    }

    if (!getToken()) {
      setSnackbar({
        open: true,
        message: t("pleaseLoginFirst", language),
        severity: "error",
      });
      return;
    }

    setLookupLoading(true);
    try {
      // api.get returns response.data directly
      const clientData = await api.get(API_ENDPOINTS.CLIENTS.SEARCH_BY_EMPLOYEE_ID(newRequest.employeeId));

      if (clientData && !clientData.error) {
        // Valid INSURANCE_CLIENT - load the data
        setMainClientInfo({
          id: clientData.id,
          fullName: clientData.fullName,
          employeeId: clientData.employeeId,
          phone: clientData.phone,
          department: clientData.department,
          faculty: clientData.faculty,
          dateOfBirth: clientData.dateOfBirth,
          gender: clientData.gender,
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: clientData.fullName || "",
        }));
        setSelectedFamilyMember(null); // Reset family member selection

        // Fetch family members for this client
        try {
          // api.get returns response.data directly
          const familyData = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.BY_CLIENT(clientData.id));
          if (familyData && Array.isArray(familyData)) {
            // Filter only APPROVED family members
            const approvedMembers = familyData.filter(
              (member) => member.status === "APPROVED"
            );
            setFamilyMembers(approvedMembers);
          } else {
            setFamilyMembers([]);
          }
        } catch (familyErr) {
          console.log("Family members endpoint not available:", familyErr);
          setFamilyMembers([]);
        }

        setPatientInfoLoaded(true);
        setSnackbar({
          open: true,
          message: t("patientInfoLoadedSuccess", language),
          severity: "success",
        });
      } else if (clientData?.error === "INVALID_ROLE") {
        // Not an INSURANCE_CLIENT
        setPatientInfoLoaded(false);
        setSnackbar({
          open: true,
          message: t("employeeIdNotInsuranceClient", language),
          severity: "error",
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: "",
        }));
        setMainClientInfo(null);
        setFamilyMembers([]);
        setSelectedFamilyMember(null);
      } else {
        // Unexpected response structure
        setPatientInfoLoaded(false);
        setSnackbar({
          open: true,
          message: t("unableToRetrievePatientInfo", language),
          severity: "error",
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: "",
        }));
        setMainClientInfo(null);
        setFamilyMembers([]);
        setSelectedFamilyMember(null);
      }
    } catch (err) {
      console.error("Error looking up employee:", err);
      setPatientInfoLoaded(false);

      // Determine appropriate error message based on error type
      let errorMessage = t("errorLookingUp", language);

      if (err.response?.status === 403 || err.response?.data?.error === "INVALID_ROLE") {
        errorMessage = t("employeeIdNotInsuranceClient", language);
      } else if (err.response?.status === 404) {
        errorMessage = t("employeeIdNotFound", language);
      } else if (err.response?.status === 401) {
        errorMessage = t("sessionExpired", language);
      } else if (err.message) {
        errorMessage = `${t("error", language)}: ${err.message}`;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });

      setNewRequest(prev => ({
        ...prev,
        clientName: "",
      }));
      setMainClientInfo(null);
      setFamilyMembers([]);
      setSelectedFamilyMember(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleNationalIdLookup = async () => {
    if (!newRequest.nationalId.trim()) {
      setSnackbar({
        open: true,
        message: t("pleaseEnterNationalId", language),
        severity: "warning",
      });
      return;
    }

    if (!getToken()) {
      setSnackbar({
        open: true,
        message: t("pleaseLoginFirst", language),
        severity: "error",
      });
      return;
    }

    setLookupLoading(true);
    try {
      // api.get returns response.data directly
      const clientData = await api.get(API_ENDPOINTS.CLIENTS.SEARCH_BY_NATIONAL_ID(newRequest.nationalId));

      if (clientData && !clientData.error) {
        // Valid INSURANCE_CLIENT - load the data
        setMainClientInfo({
          id: clientData.id,
          fullName: clientData.fullName,
          employeeId: clientData.employeeId,
          nationalId: clientData.nationalId,
          phone: clientData.phone,
          department: clientData.department,
          faculty: clientData.faculty,
          dateOfBirth: clientData.dateOfBirth,
          gender: clientData.gender,
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: clientData.fullName || "",
        }));
        setSelectedFamilyMember(null); // Reset family member selection

        // Fetch family members for this client
        try {
          // api.get returns response.data directly
          const familyData = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.BY_CLIENT(clientData.id));
          if (familyData && Array.isArray(familyData)) {
            // Filter only APPROVED family members
            const approvedMembers = familyData.filter(
              (member) => member.status === "APPROVED"
            );
            setFamilyMembers(approvedMembers);
          } else {
            setFamilyMembers([]);
          }
        } catch (familyErr) {
          console.log("Family members endpoint not available:", familyErr);
          setFamilyMembers([]);
        }

        setPatientInfoLoaded(true);
        setSnackbar({
          open: true,
          message: t("patientInfoLoadedSuccess", language),
          severity: "success",
        });
      } else if (clientData?.error === "INVALID_ROLE") {
        // Not an INSURANCE_CLIENT
        setPatientInfoLoaded(false);
        setSnackbar({
          open: true,
          message: t("nationalIdNotInsuranceClient", language),
          severity: "error",
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: "",
        }));
        setMainClientInfo(null);
        setFamilyMembers([]);
        setSelectedFamilyMember(null);
      } else {
        // Unexpected response structure
        setPatientInfoLoaded(false);
        setSnackbar({
          open: true,
          message: t("unableToRetrievePatientInfo", language),
          severity: "error",
        });
        setNewRequest(prev => ({
          ...prev,
          clientName: "",
        }));
        setMainClientInfo(null);
        setFamilyMembers([]);
        setSelectedFamilyMember(null);
      }
    } catch (err) {
      console.error("Error looking up national ID:", err);
      setPatientInfoLoaded(false);

      // Determine appropriate error message based on error type
      let errorMessage = t("errorLookingUp", language);

      if (err.response?.status === 403 || err.response?.data?.error === "INVALID_ROLE") {
        errorMessage = t("nationalIdNotInsuranceClient", language);
      } else if (err.response?.status === 404) {
        errorMessage = t("nationalIdNotFound", language);
      } else if (err.response?.status === 401) {
        errorMessage = t("sessionExpired", language);
      } else if (err.message) {
        errorMessage = `${t("error", language)}: ${err.message}`;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });

      setNewRequest(prev => ({
        ...prev,
        clientName: "",
      }));
      setMainClientInfo(null);
      setFamilyMembers([]);
      setSelectedFamilyMember(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Helper functions for search type toggle
  const handleSearchTypeChange = (event, newSearchType) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
      // Clear the search fields when switching types
      setNewRequest((prev) => ({
        ...prev,
        employeeId: "",
        nationalId: "",
      }));
      // Reset patient info when switching search type
      setPatientInfoLoaded(false);
      setMainClientInfo(null);
      setFamilyMembers([]);
      setSelectedFamilyMember(null);
    }
  };

  const getSearchValue = () => {
    return searchType === "employeeId" ? newRequest.employeeId : (newRequest.nationalId || "");
  };

  const setSearchValue = (value) => {
    if (searchType === "employeeId") {
      setNewRequest(prev => ({ ...prev, employeeId: value }));
    } else {
      setNewRequest(prev => ({ ...prev, nationalId: value }));
    }
  };

  const handleSearch = () => {
    if (searchType === "employeeId") {
      handleEmployeeIdLookup();
    } else {
      handleNationalIdLookup();
    }
  };

  const handleMemberSelection = (value) => {
    if (value === "main") {
      // Select main client
      setSelectedFamilyMember(null);
      if (mainClientInfo) {
        setNewRequest(prev => ({
          ...prev,
          clientName: mainClientInfo.fullName,
        }));
      }
    } else {
      // Select family member
      const familyMember = familyMembers.find(fm => fm.id === value);
      if (familyMember) {
        setSelectedFamilyMember(familyMember);
        setNewRequest(prev => ({
          ...prev,
          clientName: familyMember.fullName,
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackendError = (err) => {
    console.log("Full Error Details:");
    console.log("Status:", err.response?.status);
    console.log("err.response?.data:", err.response?.data);

    let errorMsg = "";
    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        errorMsg = err.response.data;
      } else if (err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.response.data.error) {
        errorMsg = err.response.data.error;
      } else {
        errorMsg = JSON.stringify(err.response.data);
      }
    } else if (err.message) {
      errorMsg = err.message;
    }

    console.log("Extracted Message:", errorMsg);

    if (errorMsg === "CLIENT_NOT_FOUND") {
      return t("clientNotFound", language);
    }
    if (errorMsg === "DOCTOR_NOT_FOUND") {
      return t("doctorNotFound", language);
    }
    if (errorMsg.includes("not found")) {
      return errorMsg;
    }

    if (err.response?.status === 401) {
      return t("sessionExpired", language);
    }
    if (err.response?.status === 403) {
      return t("noPermissionEmergency", language);
    }
    if (err.response?.status === 400) {
      return `${t("invalidRequest", language)}: ${errorMsg}`;
    }

    return `${t("anErrorOccurred", language)}: ${errorMsg || t("tryAgain", language)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const errors = [];

      if (!patientInfoLoaded || !mainClientInfo) {
        errors.push(t("pleaseVerifyPatientFirst", language));
      }

      if (!newRequest.clientName || newRequest.clientName.trim() === "") {
        errors.push(t("patientNameRequired", language));
      }

      if (!newRequest.description || newRequest.description.trim() === "") {
        errors.push(t("descriptionRequired", language));
      }

      if (!newRequest.location || newRequest.location.trim() === "") {
        errors.push(t("locationRequired", language));
      }

      if (!newRequest.contactPhone || newRequest.contactPhone.trim() === "") {
        errors.push(t("contactPhoneRequired", language));
      } else if (!isValidPhoneNumber(newRequest.contactPhone)) {
        errors.push(t("validPhoneRequired", language));
      }

      if (!newRequest.incidentDate) {
        errors.push(t("incidentDateRequired", language));
      }

      // If there are validation errors, show them and stop
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: `${t("pleaseFixFollowing", language)}\n${errors.join("\n")}`,
          severity: "error",
        });
        setLoading(false);
        return;
      }

      // Prepare request data with memberId or familyMemberId
      // Ensure we have a valid client ID
      if (!mainClientInfo?.id) {
        setSnackbar({
          open: true,
          message: t("patientInfoMissing", language),
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const requestData = {
        ...newRequest,
        memberId: selectedFamilyMember ? selectedFamilyMember.id : mainClientInfo.id,
        familyMemberId: selectedFamilyMember ? selectedFamilyMember.id : null,
        isFamilyMember: !!selectedFamilyMember,
      };

      // api.post returns response.data directly
      const responseData = await api.post(API_ENDPOINTS.EMERGENCIES.CREATE, requestData);

      setSnackbar({
        open: true,
        message: t("emergencySubmittedSuccess", language),
        severity: "success",
      });

      if (onAdded) onAdded(responseData);

      setNewRequest({
        employeeId: "",
        nationalId: "",
        clientName: "",
        description: "",
        location: "",
        contactPhone: "",
        incidentDate: "",
        notes: "",
      });
      setMainClientInfo(null);
      setFamilyMembers([]);
      setSelectedFamilyMember(null);
      setPatientInfoLoaded(false);
    } catch (err) {
      console.error("Error submitting emergency:", err);
      const errorMessage = handleBackendError(err);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#FECACA" },
      "&:hover fieldset": { borderColor: "#F87171" },
      "&.Mui-focused fieldset": {
        borderColor: "#DC2626",
        boxShadow: "0 0 0 2px rgba(220, 38, 38, 0.12)",
      },
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      color: "#991B1B",
    },
  };

  return (
    <>
      <Box
        dir={isRTL ? "rtl" : "ltr"}
        sx={{
          background: "linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 100%)",
          border: "1px solid rgba(220, 38, 38, 0.35)",
          borderRadius: { xs: 2, sm: 3 },
          px: { xs: 1.5, sm: 2.4, md: 3.2 },
          py: { xs: 2, sm: 2.5, md: 3.3 },
          boxShadow: "0 24px 52px rgba(220, 38, 38, 0.12)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Avatar
              sx={{
                bgcolor: "rgba(220, 38, 38, 0.15)",
                color: "#DC2626",
                width: 48,
                height: 48,
              }}
            >
              <LocalHospitalIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#991B1B">
                {t("logEmergencyIntervention", language)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#B91C1C" }}>
                {t("captureEmergencyDetails", language)}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              icon={<WarningAmberIcon fontSize="small" />}
              label={t("urgent", language)}
              size="small"
              sx={{
                backgroundColor: "rgba(220, 38, 38, 0.15)",
                color: "#DC2626",
                fontWeight: 700,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                },
              }}
            />
          </Stack>

          <Divider sx={{ borderColor: "rgba(220, 38, 38, 0.25)" }} />

          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
            {/* Search Type Toggle */}
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={searchType}
                exclusive
                onChange={handleSearchTypeChange}
                size="small"
                sx={{
                  mb: 1,
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    borderColor: "#FECACA",
                    color: "#991B1B",
                    "&:hover": {
                      backgroundColor: "rgba(220, 38, 38, 0.08)",
                    },
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                      color: "#fff",
                      "&:hover": {
                        background: "linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="employeeId">
                  <BadgeIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 18 }} />
                  {t("employeeId", language)}
                </ToggleButton>
                <ToggleButton value="nationalId">
                  <CreditCardIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 18 }} />
                  {t("nationalId", language)}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Dynamic Search Field */}
            <Grid item xs={12} sm={9} md={10}>
              <TextField
                label={searchType === "employeeId" ? `🆔 ${t("employeeId", language)}` : `🪪 ${t("nationalId", language)}`}
                value={getSearchValue()}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !lookupLoading && getSearchValue().trim()) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder={searchType === "employeeId" ? t("enterEmployeeId", language) : t("enterNationalId", language)}
                fullWidth
                required
                sx={fieldSx}
                disabled={lookupLoading}
              />
            </Grid>

            {/* Check Button */}
            <Grid item xs={12} sm={3} md={2} sx={{ display: "flex", alignItems: { xs: "stretch", sm: "flex-end" } }}>
              <Button
                onClick={handleSearch}
                variant="contained"
                fullWidth
                disabled={lookupLoading || !getSearchValue()}
                sx={{
                  background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  padding: { xs: "10px 12px", sm: "12px 16px" },
                  borderRadius: 2.5,
                  minHeight: { xs: 44, sm: "auto" },
                  "&:hover": {
                    background: "linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)",
                    boxShadow: "0 8px 16px rgba(220, 38, 38, 0.3)",
                  },
                  "&:disabled": {
                    background: "#FECACA",
                    color: "#991B1B",
                  },
                }}
              >
                {lookupLoading ? t("checking", language) : `✓ ${t("check", language)}`}
              </Button>
            </Grid>

            {/* Member Selection Dropdown */}
            {patientInfoLoaded && mainClientInfo && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t("selectPatient", language)}</InputLabel>
                  <Select
                    value={selectedFamilyMember ? selectedFamilyMember.id : "main"}
                    onChange={(e) => handleMemberSelection(e.target.value)}
                    label={t("selectPatient", language)}
                    sx={{
                      borderRadius: 2.5,
                      backgroundColor: "#fff",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FECACA",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F87171",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#DC2626",
                      },
                    }}
                  >
                    <MenuItem value="main">
                      <Box>
                        <Typography fontWeight={600}>{mainClientInfo.fullName}</Typography>
                        <Typography variant="caption" sx={{ color: "#991B1B" }}>
                          {t("mainClient", language)}
                        </Typography>
                      </Box>
                    </MenuItem>
                    {familyMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        <Box>
                          <Typography fontWeight={600}>{member.fullName}</Typography>
                          <Typography variant="caption" sx={{ color: "#991B1B" }}>
                            {member.relation}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Patient Information Display - Beautiful Box */}
            {patientInfoLoaded && newRequest.clientName && (
              <Grid item xs={12}>
                <Box sx={{
                  background: "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
                  border: "2px solid #DC2626",
                  borderRadius: { xs: "12px", sm: "16px" },
                  padding: { xs: "16px", sm: "20px", md: "24px" },
                  boxShadow: "0 10px 30px rgba(220, 38, 38, 0.15)",
                }}>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    {/* Full Name - Always shown */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                          👤 {t("fullNameDisplay", language)}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                          {newRequest.clientName}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Main Client Information */}
                    {!selectedFamilyMember && mainClientInfo && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                              🆔 {t("employeeIdDisplay", language)}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                              {mainClientInfo.employeeId}
                            </Typography>
                          </Box>
                        </Grid>
                        {mainClientInfo.dateOfBirth && (
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                📅 {t("ageDisplay", language)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                                {calculateAge(mainClientInfo.dateOfBirth)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {mainClientInfo.gender && (
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                ⚧️ {t("genderDisplay", language)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                                {mainClientInfo.gender}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}

                    {/* Family Member Information */}
                    {selectedFamilyMember && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                              🏥 {t("insuranceNumberDisplay", language)}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                              {selectedFamilyMember.insuranceNumber || "N/A"}
                            </Typography>
                          </Box>
                        </Grid>
                        {selectedFamilyMember.dateOfBirth && (
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                📅 {t("ageDisplay", language)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                                {calculateAge(selectedFamilyMember.dateOfBirth)}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {selectedFamilyMember.gender && (
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                ⚧️ {t("genderDisplay", language)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                                {selectedFamilyMember.gender}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {selectedFamilyMember.relation && (
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography variant="overline" sx={{ color: "#DC2626", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                                👨‍👩‍👧 {t("relationDisplay", language)}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                                {selectedFamilyMember.relation}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </Box>
              </Grid>
            )}

            {patientInfoLoaded && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label={t("descriptionLabel", language)}
                    name="description"
                    value={newRequest.description}
                    onChange={handleChange}
                    required
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t("describeEmergencyEvent", language)}
                    sx={fieldSx}
                  />
                </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label={t("location", language)}
                name="location"
                value={newRequest.location}
                onChange={handleChange}
                required
                fullWidth
                placeholder={t("enterLocation", language)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label={t("contactPhone", language)}
                name="contactPhone"
                value={newRequest.contactPhone}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g. +970 5X XXX XXXX"
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label={t("incidentDate", language)}
                type="date"
                name="incidentDate"
                value={newRequest.incidentDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label={t("notes", language)}
                name="notes"
                value={newRequest.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder={t("additionalNotes", language)}
                sx={fieldSx}
                />
              </Grid>
            </>
            )}
          </Grid>

          {patientInfoLoaded && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              sx={{ mt: { xs: 1, sm: 0 } }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#B91C1C",
                  textAlign: { xs: "center", sm: isRTL ? "right" : "left" },
                  order: { xs: 2, sm: 1 },
                  fontWeight: 500,
                }}
              >
                {t("submittingTriggers", language)}
              </Typography>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1.5, sm: 1.3 },
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                  boxShadow: "0 16px 36px rgba(220, 38, 38, 0.25)",
                  order: { xs: 1, sm: 2 },
                  maxWidth: { xs: "100%", sm: "auto" },
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: "linear-gradient(135deg, #B91C1C 0%, #991B1B 100%)",
                  },
                  "&:disabled": {
                    background: "#FECACA",
                    color: "#991B1B",
                  },
                }}
              >
                {loading ? t("submitting", language) : `🚨 ${t("submitEmergency", language)}`}
              </Button>
            </Stack>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%", fontSize: "1rem", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddEmergency;
