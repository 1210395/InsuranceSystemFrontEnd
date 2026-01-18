import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
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
  Paper,
  Grid,
  Avatar,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventIcon from "@mui/icons-material/Event";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import HealingIcon from "@mui/icons-material/Healing";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";

// Import utilities
import api from "../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../config/api";
import { sanitizeString, sanitizeFormData, toLatinDigits } from "../../utils/sanitize";
import { validateAmount, validateDate, validateFile, validateRequired } from "../../utils/validation";
import { getTodayDate, formatFileSize } from "../../utils/helpers";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const AddClaim = ({ onAdded }) => {
  const { language, isRTL } = useLanguage();

  // Form state
  const [newClaim, setNewClaim] = useState({
    description: "",
    diagnosis: "",
    treatmentDetails: "",
    amount: "",
    serviceDate: "",
    providerName: "",
    doctorName: "",
    invoiceImagePath: [],
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Coordinator lookup state
  const [lookup, setLookup] = useState({
    fullName: "",
    employeeId: "",
    nationalId: "",
    phone: "",
  });

  const [clientId, setClientId] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  // Family member selection (for clients only)
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("myself");
  const [clientInfo, setClientInfo] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Refs for cleanup
  const objectUrlsRef = useRef([]);
  const abortControllerRef = useRef(null);

  // Memoized auth values to avoid repeated localStorage access
  const authData = useMemo(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";
    let roles = [];
    try {
      roles = JSON.parse(localStorage.getItem("roles") || "[]");
    } catch {
      roles = [];
    }
    return { token, role, roles };
  }, []);

  const isCoordinator = useMemo(() => {
    const { role, roles } = authData;
    return (
      role === "ROLE_COORDINATION_ADMIN" ||
      role === "COORDINATION_ADMIN" ||
      roles.includes("ROLE_COORDINATION_ADMIN") ||
      roles.includes("COORDINATION_ADMIN")
    );
  }, [authData]);

  const isClient = useMemo(() => {
    const { role, roles } = authData;
    return (
      role === "ROLE_INSURANCE_CLIENT" ||
      role === "INSURANCE_CLIENT" ||
      roles.includes("ROLE_INSURANCE_CLIENT") ||
      roles.includes("INSURANCE_CLIENT")
    );
  }, [authData]);

  // Validate user has permission to submit claims
  const canSubmitClaims = useMemo(() => {
    // User must be either a coordinator or an insurance client
    return isCoordinator || isClient;
  }, [isCoordinator, isClient]);

  // Check if token exists and is valid
  const isAuthenticated = useMemo(() => {
    const { token } = authData;
    if (!token) return false;

    // Basic JWT validation - check if token has 3 parts
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      if (exp && Date.now() >= exp * 1000) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }, [authData]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch family members for clients
  useEffect(() => {
    if (isClient && !isCoordinator) {
      const fetchData = async () => {
        setIsFetchingData(true);
        abortControllerRef.current = new AbortController();

        try {
          // Fetch family members
          const membersRes = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.MY);
          const approvedMembers = (membersRes || []).filter(
            (member) => member.status === "APPROVED"
          );
          setFamilyMembers(approvedMembers);

          // Fetch client's own info
          const clientRes = await api.get(API_ENDPOINTS.AUTH.ME);
          setClientInfo(clientRes);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Error fetching data:", err);
            setFamilyMembers([]);
            setSnackbar({
              open: true,
              message: t("failedToLoadFamilyMembers", language),
              severity: "error",
            });
          }
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchData();
    }
  }, [isClient, isCoordinator]);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "description":
        return validateRequired(value, "Description");
      case "amount": {
        const result = validateAmount(value, { required: true, min: 0.01, max: 100000 });
        return result;
      }
      case "serviceDate": {
        const result = validateDate(value, {
          required: true,
          allowFuture: false,
          maxPastDays: 365
        });
        return result;
      }
      default:
        return { isValid: true, error: "" };
    }
  }, []);

  // Handle input change with sanitization
  const handleInputChange = useCallback((e) => {
    const { name, value, files } = e.target;

    if (name === "invoiceImagePath" && files) {
      const fileArray = Array.from(files);
      const validFiles = [];
      const fileErrors = [];

      fileArray.forEach((file, index) => {
        const validation = validateFile(file, {
          maxSizeMB: 5,
          allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
        });

        if (validation.isValid) {
          validFiles.push(file);
        } else {
          fileErrors.push(`File ${index + 1}: ${validation.error}`);
        }
      });

      if (fileErrors.length > 0) {
        setSnackbar({
          open: true,
          message: fileErrors.join(", "),
          severity: "error",
        });
      }

      if (validFiles.length > 0) {
        setNewClaim((prev) => ({
          ...prev,
          invoiceImagePath: [...prev.invoiceImagePath, ...validFiles],
        }));
      }
      return;
    }

    // Sanitize and convert Arabic digits for numeric fields
    let sanitizedValue = sanitizeString(value);
    if (name === "amount") {
      sanitizedValue = toLatinDigits(sanitizedValue);
    }

    setNewClaim((prev) => ({ ...prev, [name]: sanitizedValue }));

    // Validate field on change
    const validation = validateField(name, sanitizedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: validation.error,
    }));
  }, [validateField]);

  // Remove one image with cleanup
  const handleRemoveImage = useCallback((index) => {
    setNewClaim((prev) => {
      const removedFile = prev.invoiceImagePath[index];
      // Find and revoke the object URL for this file
      const urlIndex = objectUrlsRef.current.findIndex((url) =>
        url.includes(removedFile?.name)
      );
      if (urlIndex > -1) {
        URL.revokeObjectURL(objectUrlsRef.current[urlIndex]);
        objectUrlsRef.current.splice(urlIndex, 1);
      }

      return {
        ...prev,
        invoiceImagePath: prev.invoiceImagePath.filter((_, i) => i !== index),
      };
    });
  }, []);

  // Create object URL with tracking for cleanup
  const createTrackedObjectUrl = useCallback((file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  }, []);

  // Handle coordinator client lookup
  const handleLookupClient = useCallback(async () => {
    if (!lookup.fullName && !lookup.employeeId && !lookup.nationalId && !lookup.phone) {
      setSnackbar({
        open: true,
        message: t("pleaseEnterSearchField", language),
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const sanitizedLookup = sanitizeFormData(lookup);
      const res = await api.post(
        "/api/clients/coordinator/lookup-for-claim",
        sanitizedLookup
      );

      setSelectedClient(res);
      setClientId(res.id);

      setSnackbar({
        open: true,
        message: t("clientFoundSuccess", language),
        severity: "success",
      });
    } catch (err) {
      setSelectedClient(null);
      setClientId("");

      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("clientNotFoundData", language),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [lookup, language]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Required fields validation
    const descValidation = validateRequired(newClaim.description, "Description");
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error;
      isValid = false;
    }

    const amountValidation = validateAmount(newClaim.amount, {
      required: true,
      min: 0.01,
      max: 100000
    });
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
      isValid = false;
    }

    const dateValidation = validateDate(newClaim.serviceDate, {
      required: true,
      allowFuture: false,
      maxPastDays: 365
    });
    if (!dateValidation.isValid) {
      newErrors.serviceDate = dateValidation.error;
      isValid = false;
    }

    // Coordinator must select a client
    if (isCoordinator && !clientId) {
      newErrors.client = t("pleaseSelectClient", language);
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [newClaim, isCoordinator, clientId, language]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: t("pleaseFixErrors", language),
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const formData = new FormData();

      // Sanitize and prepare claim data
      const claimData = {
        description: sanitizeString(newClaim.description),
        diagnosis: sanitizeString(newClaim.diagnosis) || null,
        treatmentDetails: sanitizeString(newClaim.treatmentDetails) || null,
        amount: parseFloat(toLatinDigits(newClaim.amount)),
        serviceDate: newClaim.serviceDate,
      };

      // Handle coordinator-specific data
      if (isCoordinator) {
        claimData.clientId = clientId;
        claimData.roleSpecificData = JSON.stringify({
          providerName: sanitizeString(newClaim.providerName),
          doctorName: sanitizeString(newClaim.doctorName),
        });
      } else if (isClient) {
        // For clients, use selected member ID (either "myself" or family member ID)
        if (selectedMemberId !== "myself") {
          claimData.clientId = selectedMemberId;
        }

        // Include provider and doctor name for client claims (outside network)
        if (newClaim.providerName || newClaim.doctorName) {
          claimData.roleSpecificData = JSON.stringify({
            providerName: sanitizeString(newClaim.providerName) || null,
            doctorName: sanitizeString(newClaim.doctorName) || null,
          });
        }
      }

      formData.append("data", JSON.stringify(claimData));

      // Append document (use first file if multiple files are uploaded)
      if (newClaim.invoiceImagePath.length > 0) {
        formData.append("document", newClaim.invoiceImagePath[0]);
      }

      const url = isCoordinator
        ? API_ENDPOINTS.HEALTHCARE_CLAIMS.BASE + "/admin/create-direct"
        : API_ENDPOINTS.HEALTHCARE_CLAIMS.BASE + "/client/create";

      const res = await api.upload(url, formData);

      if (onAdded) onAdded(res);

      setSnackbar({
        open: true,
        message: t("claimSubmittedSuccess", language),
        severity: "success",
      });

      // Reset form
      setNewClaim({
        description: "",
        diagnosis: "",
        treatmentDetails: "",
        amount: "",
        serviceDate: "",
        providerName: "",
        doctorName: "",
        invoiceImagePath: [],
      });
      setErrors({});
      setSelectedMemberId("myself");

      // Cleanup object URLs
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current = [];

    } catch (err) {
      console.error("Error submitting claim:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("errorSubmittingClaim", language),
        severity: "error",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    validateForm,
    newClaim,
    isCoordinator,
    isClient,
    clientId,
    selectedMemberId,
    onAdded,
  ]);

  // Get today's date for max date validation
  const todayDate = useMemo(() => getTodayDate(), []);

  // Calculate max date for service date (one year ago)
  const minServiceDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  }, []);

  // Access control - redirect or show error if user doesn't have permission
  if (!isAuthenticated) {
    return (
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: 4, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t("sessionExpired", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("pleaseLoginAgain", language)}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = "/LandingPage"}
            sx={{ background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)" }}
          >
            {t("goToLogin", language)}
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!canSubmitClaims) {
    return (
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: 4, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            {t("accessDenied", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("noPermissionToSubmitClaims", language)}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: 4, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      {/* Header */}
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 64, height: 64 }}>
            <ReceiptIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700">
              {t("submitNewClaim", language)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t("fillClaimDetails", language)}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Loading overlay for initial data fetch */}
      {isFetchingData && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Form */}
      {!isFetchingData && (
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8EDE0" }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>

                {/* Family Member Selection (for clients only) */}
                {isClient && !isCoordinator && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                      <Avatar sx={{ bgcolor: "#556B2F", width: 40, height: 40 }}>
                        <FamilyRestroomIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="700" color="#1e293b">
                          {t("selectClaimBeneficiary", language)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("chooseYourselfOrFamily", language)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label={t("beneficiary", language)}
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          fullWidth
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: "#556B2F" }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                          }}
                        >
                          <MenuItem value="myself">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <PersonIcon fontSize="small" />
                              <Typography>
                                {t("myself", language)} {clientInfo ? `(${clientInfo.fullName})` : ""}
                              </Typography>
                            </Stack>
                          </MenuItem>
                          {familyMembers.map((member) => (
                            <MenuItem key={member.id} value={member.id}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <FamilyRestroomIcon fontSize="small" />
                                <Typography>
                                  {member.fullName} ({member.relation})
                                </Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      {selectedMemberId !== "myself" && (
                        <Grid item xs={12} md={6}>
                          {(() => {
                            const selectedMember = familyMembers.find(
                              (m) => m.id === selectedMemberId
                            );
                            return selectedMember ? (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: "#f0f9ff",
                                  border: "1px solid #bae6fd",
                                }}
                              >
                                <Stack spacing={1}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {t("selectedFamilyMember", language)}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>{t("name", language)}:</strong> {selectedMember.fullName}
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>{t("relation", language)}:</strong> {selectedMember.relation}
                                  </Typography>
                                  {selectedMember.insuranceNumber && (
                                    <Typography variant="body2">
                                      <strong>{t("insuranceNumber", language)}:</strong> {selectedMember.insuranceNumber}
                                    </Typography>
                                  )}
                                </Stack>
                              </Paper>
                            ) : null;
                          })()}
                        </Grid>
                      )}
                    </Grid>

                    <Divider sx={{ my: 4 }} />
                  </Box>
                )}

                {/* Coordinator Client Lookup */}
                {isCoordinator && (
                  <Box>
                    <Typography variant="h6" fontWeight="700" mb={2}>
                      {t("findClientCoordinator", language)}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("fullName", language)}
                          value={lookup.fullName}
                          onChange={(e) =>
                            setLookup({ ...lookup, fullName: sanitizeString(e.target.value) })
                          }
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("employeeInsuranceNumber", language)}
                          value={lookup.employeeId}
                          onChange={(e) =>
                            setLookup({ ...lookup, employeeId: sanitizeString(e.target.value) })
                          }
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("nationalId", language)}
                          value={lookup.nationalId}
                          onChange={(e) =>
                            setLookup({ ...lookup, nationalId: toLatinDigits(sanitizeString(e.target.value)) })
                          }
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("phoneNumber", language)}
                          value={lookup.phone}
                          onChange={(e) =>
                            setLookup({ ...lookup, phone: toLatinDigits(sanitizeString(e.target.value)) })
                          }
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          onClick={handleLookupClient}
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : t("searchClient", language)}
                        </Button>
                      </Grid>
                    </Grid>

                    {errors.client && (
                      <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                        {errors.client}
                      </Typography>
                    )}

                    <Divider sx={{ my: 4 }} />
                  </Box>
                )}

                {/* Selected Client Info (Coordinator) */}
                {isCoordinator && selectedClient && (
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                      <Avatar sx={{ bgcolor: "#0ea5e9", width: 40, height: 40 }}>
                        <PersonIcon />
                      </Avatar>

                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          {t("insuredPersonInfo", language)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("selectedClientReadOnly", language)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("fullName", language)}
                          value={selectedClient.fullName}
                          fullWidth
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("nationalId", language)}
                          value={selectedClient.nationalId}
                          fullWidth
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label={t("employeeInsuranceNo", language)}
                          value={selectedClient.employeeId}
                          fullWidth
                          disabled
                        />
                      </Grid>

                      {selectedClient.phone && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            label={t("phoneNumber", language)}
                            value={selectedClient.phone}
                            fullWidth
                            disabled
                          />
                        </Grid>
                      )}
                    </Grid>

                    <Divider sx={{ my: 4 }} />
                  </Box>
                )}

                {/* MEDICAL SECTION */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: "#556B2F", width: 40, height: 40 }}>
                      <MedicalServicesIcon />
                    </Avatar>

                    <Box>
                      <Typography variant="h6" fontWeight="700" color="#1e293b">
                        {t("medicalInformation", language)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("provideMedicalDetails", language)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label={t("description", language)}
                        name="description"
                        value={newClaim.description}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.description}
                        helperText={errors.description}
                        inputProps={{
                          "aria-label": t("description", language),
                          "aria-required": "true",
                          "aria-invalid": !!errors.description,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ mt: 2 }}>
                              <DescriptionIcon sx={{ color: "#556B2F" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label={t("diagnosis", language)}
                        name="diagnosis"
                        value={newClaim.diagnosis}
                        onChange={handleInputChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <HealingIcon sx={{ color: "#556B2F" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label={t("treatmentDetails", language)}
                        name="treatmentDetails"
                        value={newClaim.treatmentDetails}
                        onChange={handleInputChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MedicalServicesIcon sx={{ color: "#556B2F" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* FINANCIAL SECTION */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: "#7B8B5E", width: 40, height: 40 }}>
                      <AttachMoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700" color="#1e293b">
                        {t("providerFinancialDetails", language)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("serviceProviderCost", language)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label={t("providerName", language)}
                        name="providerName"
                        value={newClaim.providerName}
                        onChange={handleInputChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon sx={{ color: "#7B8B5E" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label={t("doctorName", language)}
                        name="doctorName"
                        value={newClaim.doctorName}
                        onChange={handleInputChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: "#7B8B5E" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label={`${t("claimAmount", language)} (${CURRENCY.SYMBOL})`}
                        type="text"
                        inputMode="decimal"
                        name="amount"
                        value={newClaim.amount}
                        onChange={handleInputChange}
                        required
                        fullWidth
                        error={!!errors.amount}
                        helperText={errors.amount}
                        inputProps={{
                          "aria-label": t("claimAmount", language),
                          "aria-required": "true",
                          "aria-invalid": !!errors.amount,
                          min: "0.01",
                          max: "100000",
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocalOfferIcon sx={{ color: "#7B8B5E" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography fontWeight={600}>{CURRENCY.SYMBOL}</Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label={t("serviceDate", language)}
                        type="date"
                        name="serviceDate"
                        value={newClaim.serviceDate}
                        onChange={handleInputChange}
                        required
                        error={!!errors.serviceDate}
                        helperText={errors.serviceDate}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          max: todayDate,
                          min: minServiceDate,
                          "aria-label": t("serviceDate", language),
                          "aria-required": "true",
                          "aria-invalid": !!errors.serviceDate,
                        }}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon sx={{ color: "#7B8B5E" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAF8F5" },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* UPLOAD SECTION */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: "#556B2F", width: 40, height: 40 }}>
                      <UploadFileIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700" color="#1e293b">
                        {t("supportingDocuments", language)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("uploadInvoiceMax", language)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: newClaim.invoiceImagePath.length
                        ? "2px solid #10b981"
                        : "2px dashed #cbd5e0",
                      bgcolor: newClaim.invoiceImagePath.length ? "#f0fdf4" : "#FAF8F5",
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      {/* Upload Button */}
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadFileIcon />}
                        sx={{
                          py: 1.5,
                          px: 4,
                          borderRadius: 3,
                          fontWeight: 600,
                          background: "linear-gradient(135deg, #7B8B5E 0%, #556B2F 100%)",
                        }}
                      >
                        {t("uploadInvoice", language)}
                        <input
                          type="file"
                          name="invoiceImagePath"
                          hidden
                          multiple
                          accept="image/jpeg,image/png,image/gif,application/pdf"
                          onChange={handleInputChange}
                        />
                      </Button>

                      {/* IMAGE PREVIEW */}
                      {newClaim.invoiceImagePath.length > 0 && (
                        <Grid container spacing={2} justifyContent="center">
                          {newClaim.invoiceImagePath.map((file, i) => (
                            <Grid item key={`${file.name}-${i}`}>
                              <Stack
                                alignItems="center"
                                sx={{
                                  p: 1,
                                  border: "1px solid #d1fae5",
                                  borderRadius: 2,
                                  bgcolor: "white",
                                  width: 120,
                                }}
                              >
                                {file.type === "application/pdf" ? (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: "90px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "#fee2e2",
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Typography variant="caption" fontWeight={600} color="error">
                                      PDF
                                    </Typography>
                                  </Box>
                                ) : (
                                  <img
                                    src={createTrackedObjectUrl(file)}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "90px",
                                      objectFit: "cover",
                                      borderRadius: 6,
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 1,
                                    textAlign: "center",
                                    fontSize: "0.7rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    width: "100%",
                                  }}
                                  title={file.name}
                                >
                                  {file.name}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: "0.65rem" }}
                                >
                                  {formatFileSize(file.size)}
                                </Typography>

                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveImage(i)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Stack>
                  </Paper>
                </Box>

                {/* SUBMIT */}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || isSubmitting}
                  size="large"
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                    "&:disabled": {
                      background: "#ccc",
                    },
                  }}
                >
                  {isSubmitting ? t("submittingClaim", language) : t("submitClaim", language)}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

AddClaim.propTypes = {
  onAdded: PropTypes.func,
};

export default AddClaim;
