// src/Component/Manager/AdminFunctions/ManagerMedicalClaimsReview.jsx
// Manager wrapper for MedicalClaimsReview with Manager Sidebar and Header
// Enhanced with advanced filtering, search, and sorting capabilities
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Tooltip,
  Slider,
  Card,
  CardContent,
} from "@mui/material";

// Manager-specific imports
import Header from "../Header";
import Sidebar from "../Sidebar";

// Icons
import ScienceIcon from "@mui/icons-material/Science";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import TuneIcon from "@mui/icons-material/Tune";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

// Import utilities
import api from "../../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../../config/api";
import { CLAIM_STATUS, isValidTransition } from "../../../config/claimStateMachine";
import { ROLES } from "../../../config/roles";
import { sanitizeString } from "../../../utils/sanitize";
import { timeSince, safeJsonParse } from "../../../utils/helpers";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ManagerMedicalClaimsReview = () => {
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

  // ==========================================
  // ADVANCED FILTER STATES
  // ==========================================
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountRange, setAmountRange] = useState([0, 1000]);
  const [maxAmount, setMaxAmount] = useState(1000);
  const [showReturnedOnly, setShowReturnedOnly] = useState(false);
  const [showFollowUpOnly, setShowFollowUpOnly] = useState(false);

  // Tabs Configuration
  const claimTabs = useMemo(() => [
    { label: t("doctorClaims", language), role: ROLES.DOCTOR, icon: <LocalHospitalIcon /> },
    { label: t("pharmacyClaims", language), role: ROLES.PHARMACIST, icon: <MedicationIcon /> },
    { label: t("labClaims", language), role: ROLES.LAB_TECH, icon: <BiotechIcon /> },
    { label: t("radiologyClaims", language), role: ROLES.RADIOLOGIST, icon: <MonitorHeartIcon /> },
    { label: t("clientClaims", language), role: ROLES.INSURANCE_CLIENT, icon: <PersonIcon /> },
  ], [language]);

  // Status options for filter
  const statusOptions = useMemo(() => [
    { value: "all", label: "All Statuses" },
    { value: "PENDING_MEDICAL", label: "Pending Medical Review" },
    { value: "PENDING", label: "Pending" },
    { value: "RETURNED_FOR_REVIEW", label: "Returned for Review" },
  ], []);

  // Sort options
  const sortOptions = useMemo(() => [
    { value: "dateDesc", label: "Newest First" },
    { value: "dateAsc", label: "Oldest First" },
    { value: "amountDesc", label: "Highest Amount" },
    { value: "amountAsc", label: "Lowest Amount" },
    { value: "clientName", label: "Client Name (A-Z)" },
    { value: "providerName", label: "Provider Name (A-Z)" },
  ], []);

  // State for permission error
  const [permissionError, setPermissionError] = useState(null);

  // Fetch pending medical claims
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setPermissionError(null);
    try {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MEDICAL_REVIEW);
      const claimsData = res || [];
      setClaims(claimsData);

      // Calculate max amount for slider
      if (claimsData.length > 0) {
        const max = Math.max(...claimsData.map(c => c.amount || 0));
        setMaxAmount(Math.ceil(max / 100) * 100 || 1000);
        setAmountRange([0, Math.ceil(max / 100) * 100 || 1000]);
      }
    } catch (err) {
      console.error("Failed to load claims:", err);

      // Handle 403 Forbidden specifically
      if (err.response?.status === 403) {
        setPermissionError({
          title: t("accessDenied", language) || "Access Denied",
          message: t("managerRoleNotAssigned", language) ||
            "Your account does not have the required INSURANCE_MANAGER role assigned in the database. Please contact your system administrator to assign the role in the client_roles table.",
          technical: "HTTP 403: The backend requires ROLE_INSURANCE_MANAGER authority for this endpoint."
        });
      } else {
        setSnackbar({
          open: true,
          message: t("failedToLoadClaims", language),
          severity: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Check if claim is returned by coordinator
  const isReturnedByCoordinator = useCallback((claim) => {
    return claim.status === CLAIM_STATUS.RETURNED_FOR_REVIEW;
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("dateDesc");
    setDateFrom("");
    setDateTo("");
    setAmountRange([0, maxAmount]);
    setShowReturnedOnly(false);
    setShowFollowUpOnly(false);
  }, [maxAmount]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      statusFilter !== "all" ||
      sortBy !== "dateDesc" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      amountRange[0] !== 0 ||
      amountRange[1] !== maxAmount ||
      showReturnedOnly ||
      showFollowUpOnly
    );
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, showReturnedOnly, showFollowUpOnly]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "all") count++;
    if (sortBy !== "dateDesc") count++;
    if (dateFrom || dateTo) count++;
    if (amountRange[0] !== 0 || amountRange[1] !== maxAmount) count++;
    if (showReturnedOnly) count++;
    if (showFollowUpOnly) count++;
    return count;
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, showReturnedOnly, showFollowUpOnly]);

  // Get filtered and sorted claims for current tab
  const filteredClaims = useMemo(() => {
    const currentRole = claimTabs[selectedTab]?.role;
    if (!currentRole) return [];

    let result = claims.filter((c) => c.providerRole === currentRole);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        (c.clientName || "").toLowerCase().includes(query) ||
        (c.providerName || "").toLowerCase().includes(query) ||
        (c.diagnosis || "").toLowerCase().includes(query) ||
        (c.description || "").toLowerCase().includes(query) ||
        (c.id || "").toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((c) => new Date(c.serviceDate) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((c) => new Date(c.serviceDate) <= toDate);
    }

    // Apply amount range filter
    result = result.filter((c) => {
      const amount = c.amount || 0;
      return amount >= amountRange[0] && amount <= amountRange[1];
    });

    // Apply returned only filter
    if (showReturnedOnly) {
      result = result.filter((c) => isReturnedByCoordinator(c));
    }

    // Apply follow-up only filter
    if (showFollowUpOnly) {
      result = result.filter((c) => c.isFollowUp || (c.providerRole === ROLES.DOCTOR && c.amount === 0));
    }

    // Apply sorting
    result.sort((a, b) => {
      // Always show returned claims first when not sorting by something else
      if (sortBy === "dateDesc" || sortBy === "dateAsc") {
        const aReturned = isReturnedByCoordinator(a);
        const bReturned = isReturnedByCoordinator(b);
        if (aReturned && !bReturned) return -1;
        if (!aReturned && bReturned) return 1;
      }

      switch (sortBy) {
        case "dateDesc":
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case "dateAsc":
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case "amountDesc":
          return (b.amount || 0) - (a.amount || 0);
        case "amountAsc":
          return (a.amount || 0) - (b.amount || 0);
        case "clientName":
          return (a.clientName || "").localeCompare(b.clientName || "");
        case "providerName":
          return (a.providerName || "").localeCompare(b.providerName || "");
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });

    return result;
  }, [claims, selectedTab, claimTabs, searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, showReturnedOnly, showFollowUpOnly, isReturnedByCoordinator]);

  // Get claim counts per tab (before filters)
  const tabCounts = useMemo(() => {
    return claimTabs.map(tab =>
      claims.filter(c => c.providerRole === tab.role).length
    );
  }, [claims, claimTabs]);

  // Get statistics for current tab
  const currentTabStats = useMemo(() => {
    const currentRole = claimTabs[selectedTab]?.role;
    if (!currentRole) return { total: 0, returned: 0, pending: 0, totalAmount: 0 };

    const tabClaims = claims.filter((c) => c.providerRole === currentRole);
    return {
      total: tabClaims.length,
      returned: tabClaims.filter((c) => isReturnedByCoordinator(c)).length,
      pending: tabClaims.filter((c) => c.status === "PENDING_MEDICAL" || c.status === "PENDING").length,
      totalAmount: tabClaims.reduce((sum, c) => sum + (c.amount || 0), 0),
    };
  }, [claims, selectedTab, claimTabs, isReturnedByCoordinator]);

  // Approve claim with confirmation
  const handleApprove = useCallback(async (id, currentStatus) => {
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
      console.error("Approve failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToApproveClaim", language),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, language]);

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
      console.error("Reject failed:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToRejectClaim", language),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rejectReason, selectedClaim, isSubmitting, language]);

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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box>
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
              <Typography sx={{ color: "#6B7280" }}>
                {t("validateMedicalAccuracy", language)}
              </Typography>
            </Box>
            <Tooltip title="Refresh Claims">
              <span>
                <IconButton
                  onClick={fetchClaims}
                  disabled={loading}
                  sx={{
                    bgcolor: "#556B2F",
                    color: "#fff",
                    "&:hover": { bgcolor: "#3D4F23" },
                    "&.Mui-disabled": { bgcolor: "#9CA3AF", color: "#E5E7EB" },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {/* STATISTICS CARDS */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: "#E8F5E9", borderLeft: "4px solid #4CAF50" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#2E7D32">
                    {currentTabStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Claims
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: "#FFF3E0", borderLeft: "4px solid #FF9800" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#E65100">
                    {currentTabStats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Review
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: "#FFEBEE", borderLeft: "4px solid #F44336" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#C62828">
                    {currentTabStats.returned}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Returned Claims
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: "#E3F2FD", borderLeft: "4px solid #2196F3" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#1565C0">
                    {currentTabStats.totalAmount.toFixed(0)} {CURRENCY.SYMBOL}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* SEARCH AND FILTER BAR */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search Input */}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by client, provider, diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6B7280" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery("")}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#FAFAFA",
                    },
                  }}
                />
              </Grid>

              {/* Status Filter */}
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2, bgcolor: "#FAFAFA" }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid size={{ xs: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon sx={{ color: "#6B7280", ml: 1 }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2, bgcolor: "#FAFAFA" }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Filter Toggle Button */}
              <Grid size={{ xs: 6, md: 2 }}>
                <Button
                  fullWidth
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<TuneIcon />}
                  endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    bgcolor: showFilters ? "#556B2F" : "transparent",
                    borderColor: "#556B2F",
                    color: showFilters ? "#fff" : "#556B2F",
                    "&:hover": {
                      bgcolor: showFilters ? "#3D4F23" : "rgba(85, 107, 47, 0.1)",
                      borderColor: "#3D4F23",
                    },
                  }}
                >
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </Grid>

              {/* Clear Filters */}
              <Grid size={{ xs: 6, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: "#D32F2F",
                    color: "#D32F2F",
                    "&:hover": {
                      bgcolor: "rgba(211, 47, 47, 0.1)",
                      borderColor: "#B71C1C",
                    },
                    "&:disabled": {
                      borderColor: "#BDBDBD",
                      color: "#BDBDBD",
                    },
                  }}
                >
                  Clear All
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters Panel */}
            <Collapse in={showFilters}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* Date Range */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <DateRangeIcon fontSize="small" />
                    Service Date Range
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      type="date"
                      size="small"
                      label="From"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      label="To"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                </Grid>

                {/* Amount Range */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoneyIcon fontSize="small" />
                    Amount Range: {amountRange[0]} - {amountRange[1]} {CURRENCY.SYMBOL}
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={amountRange}
                      onChange={(e, newValue) => setAmountRange(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={maxAmount}
                      step={10}
                      sx={{
                        color: "#556B2F",
                        "& .MuiSlider-thumb": {
                          "&:hover, &.Mui-focusVisible": {
                            boxShadow: "0px 0px 0px 8px rgba(85, 107, 47, 0.16)",
                          },
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Quick Filters */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <FilterListIcon fontSize="small" />
                    Quick Filters
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<WarningAmberIcon />}
                      label="Returned Only"
                      clickable
                      color={showReturnedOnly ? "error" : "default"}
                      variant={showReturnedOnly ? "filled" : "outlined"}
                      onClick={() => setShowReturnedOnly(!showReturnedOnly)}
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      icon={<AssignmentIcon />}
                      label="Follow-up Only"
                      clickable
                      color={showFollowUpOnly ? "warning" : "default"}
                      variant={showFollowUpOnly ? "filled" : "outlined"}
                      onClick={() => setShowFollowUpOnly(!showFollowUpOnly)}
                      sx={{ mb: 1 }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Typography variant="body2" sx={{ color: "#6B7280", mr: 1 }}>
                Active filters:
              </Typography>
              {searchQuery && (
                <Chip
                  size="small"
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  sx={{ bgcolor: "#E8F5E9" }}
                />
              )}
              {statusFilter !== "all" && (
                <Chip
                  size="small"
                  label={`Status: ${statusOptions.find(o => o.value === statusFilter)?.label}`}
                  onDelete={() => setStatusFilter("all")}
                  sx={{ bgcolor: "#FFF3E0" }}
                />
              )}
              {(dateFrom || dateTo) && (
                <Chip
                  size="small"
                  label={`Date: ${dateFrom || "..."} to ${dateTo || "..."}`}
                  onDelete={() => { setDateFrom(""); setDateTo(""); }}
                  sx={{ bgcolor: "#E3F2FD" }}
                />
              )}
              {(amountRange[0] !== 0 || amountRange[1] !== maxAmount) && (
                <Chip
                  size="small"
                  label={`Amount: ${amountRange[0]} - ${amountRange[1]} ${CURRENCY.SYMBOL}`}
                  onDelete={() => setAmountRange([0, maxAmount])}
                  sx={{ bgcolor: "#F3E5F5" }}
                />
              )}
              {showReturnedOnly && (
                <Chip
                  size="small"
                  label="Returned Only"
                  onDelete={() => setShowReturnedOnly(false)}
                  color="error"
                  variant="outlined"
                />
              )}
              {showFollowUpOnly && (
                <Chip
                  size="small"
                  label="Follow-up Only"
                  onDelete={() => setShowFollowUpOnly(false)}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          )}

          {/* TABS */}
          <Tabs
            value={selectedTab}
            onChange={(e, v) => setSelectedTab(v)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              bgcolor: "#fff",
              borderRadius: 2,
              px: 1,
              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                minHeight: 56,
              },
            }}
          >
            {claimTabs.map((tabItem, index) => (
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
                    {tabItem.icon}
                  </Badge>
                }
                iconPosition="start"
                label={tabItem.label}
              />
            ))}
          </Tabs>

          {/* Results Count */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Showing <b>{filteredClaims.length}</b> of <b>{tabCounts[selectedTab]}</b> claims
              {hasActiveFilters && " (filtered)"}
            </Typography>
          </Box>

          {/* CONTENT */}
          {permissionError ? (
            <Paper
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "#FEF2F2",
                border: "1px solid #FCA5A5",
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 80, color: "#DC2626", mb: 2 }} />
              <Typography variant="h5" sx={{ color: "#DC2626", fontWeight: "bold", mb: 2 }}>
                {permissionError.title}
              </Typography>
              <Typography sx={{ color: "#7F1D1D", mb: 3, maxWidth: 600, mx: "auto" }}>
                {permissionError.message}
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FEE2E2",
                  borderRadius: 1,
                  maxWidth: 500,
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Typography variant="caption" sx={{ color: "#991B1B", fontFamily: "monospace" }}>
                  {permissionError.technical}
                </Typography>
              </Paper>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={fetchClaims}
                  sx={{
                    bgcolor: "#556B2F",
                    "&:hover": { bgcolor: "#3D4F23" },
                    textTransform: "none",
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = "/ManagerDashboard"}
                  sx={{
                    borderColor: "#556B2F",
                    color: "#556B2F",
                    "&:hover": { borderColor: "#3D4F23", bgcolor: "rgba(85, 107, 47, 0.1)" },
                    textTransform: "none",
                  }}
                >
                  Back to Dashboard
                </Button>
              </Stack>
            </Paper>
          ) : loading ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : filteredClaims.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
              <SearchIcon sx={{ fontSize: 60, color: "#BDBDBD", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                {hasActiveFilters ? "No claims match your filters" : t("noPendingClaims", language)}
              </Typography>
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearAllFilters}
                  sx={{ mt: 2, textTransform: "none" }}
                >
                  Clear all filters
                </Button>
              )}
            </Paper>
          ) : (
            filteredClaims.map((claim) => {
              const roleData = parseRoleSpecificData(claim.roleSpecificData);
              const isReturned = isReturnedByCoordinator(claim);
              const isFollowUp = claim.isFollowUp || (claim.providerRole === ROLES.DOCTOR && claim.amount === 0);

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    p: 4,
                    mb: 3,
                    borderLeft: isReturned ? "12px solid #D32F2F" : "8px solid #556B2F",
                    background: isReturned
                      ? "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)"
                      : "#FFFFFF",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    borderRadius: 2,
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
                    <Grid size={{ xs: 12, md: 6 }}>
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
                              </>
                            )}
                          </Box>
                        </Box>

                        {/* Description */}
                        {claim.description && (
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
                                bgcolor: "#E8EDE0",
                              }}
                            >
                              <b>Description:</b> {sanitizeString(claim.description)}
                            </Box>
                          </Box>
                        )}

                        {/* Patient/Client Information */}
                        <Box sx={{ mt: 2 }}>
                          <Typography sx={{ fontWeight: "bold", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            {t("patientClientInformation", language)}
                          </Typography>
                          <Box sx={{ ml: 3, pl: 2, borderLeft: "2px solid #8B9A46" }}>
                            <Typography sx={{ fontWeight: "600", mb: 0.5 }}>{claim.clientName || "N/A"}</Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 1 }}>
                              {claim.clientAge && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Age:</b> {claim.clientAge}</Typography>}
                              {claim.clientGender && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Gender:</b> {claim.clientGender}</Typography>}
                              {(claim.clientEmployeeId || claim.employeeId) && <Typography sx={{ color: "#666", fontSize: "0.9rem" }}><b>Employee ID:</b> {claim.clientEmployeeId || claim.employeeId}</Typography>}
                            </Stack>
                          </Box>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* BASIC DETAILS */}
                    <Grid size={{ xs: 12, md: 6 }}>
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
                        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
                          <b>Claim ID:</b> {claim.id?.substring(0, 8)}...
                        </Typography>
                        <Chip
                          label={claim.status?.replace(/_/g, " ")}
                          size="small"
                          sx={{
                            width: "fit-content",
                            bgcolor: claim.status === "RETURNED_FOR_REVIEW" ? "#FFEBEE" : "#E8F5E9",
                            color: claim.status === "RETURNED_FOR_REVIEW" ? "#C62828" : "#2E7D32",
                            fontWeight: "bold",
                          }}
                        />
                      </Stack>
                    </Grid>

                    {/* ATTACHMENTS */}
                    <Grid size={12}>
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

export default ManagerMedicalClaimsReview;
