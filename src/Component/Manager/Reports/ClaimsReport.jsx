import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Collapse,
  IconButton,
  Tooltip,
  Slider,
  Stack,
  Divider,
  Badge,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import TuneIcon from "@mui/icons-material/Tune";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import RadiologyIcon from "@mui/icons-material/MonitorHeart";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BadgeIcon from "@mui/icons-material/Badge";
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ImageIcon from "@mui/icons-material/Image";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import ReviewsIcon from "@mui/icons-material/Reviews";
import ReplayIcon from "@mui/icons-material/Replay";
import UndoIcon from "@mui/icons-material/Undo";
import PaymentIcon from "@mui/icons-material/Payment";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";
import { sanitizeString } from "../../../utils/sanitize";

const ClaimsReport = () => {
  const { language, isRTL } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountRange, setAmountRange] = useState([0, 10000]);
  const [maxAmount, setMaxAmount] = useState(10000);
  const [policyFilter, setPolicyFilter] = useState("all");
  const [providerTypeFilter, setProviderTypeFilter] = useState("all");

  // Available policies for filter dropdown
  const [availablePolicies, setAvailablePolicies] = useState([]);

  // Claim details dialog state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Return for review dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [claimToReturn, setClaimToReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch report data - defined first so other callbacks can reference it
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.REPORTS.CLAIMS);
      setReport(res || {});

      // Extract unique policies for filter dropdown
      const allClaims = [
        ...(res.approvedList || []),
        ...(res.rejectedList || []),
        ...(res.pendingList || []),
      ];
      const policies = [...new Set(allClaims.map(c => c.policyName).filter(Boolean))];
      setAvailablePolicies(policies);

      // Calculate max amount for slider
      if (allClaims.length > 0) {
        const max = Math.max(...allClaims.map(c => c.amount || 0));
        const roundedMax = Math.ceil(max / 100) * 100 || 10000;
        setMaxAmount(roundedMax);
        setAmountRange([0, roundedMax]);
      }
    } catch (err) {
      console.error("Failed to load claims report:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle view claim details
  const handleViewDetails = useCallback((claim, status) => {
    setSelectedClaim({ ...claim, status });
    setDetailsDialogOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsDialogOpen(false);
    setSelectedClaim(null);
  }, []);

  // Handle return for review
  const handleOpenReturnDialog = useCallback((claim) => {
    setClaimToReturn(claim);
    setReturnReason("");
    setReturnDialogOpen(true);
  }, []);

  const handleCloseReturnDialog = useCallback(() => {
    setReturnDialogOpen(false);
    setClaimToReturn(null);
    setReturnReason("");
  }, []);

  const handleReturnForReview = useCallback(async () => {
    if (!claimToReturn || !returnReason.trim()) return;

    setActionLoading(true);
    try {
      await api.patch(`/api/healthcare-provider-claims/${claimToReturn.id}/return-to-medical`, {
        reason: returnReason.trim()
      });
      handleCloseReturnDialog();
      fetchReport(); // Refresh the data
    } catch (err) {
      console.error("Failed to return claim for review:", err);
      alert(t("failedToReturnClaim", language) || "Failed to return claim for review: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  }, [claimToReturn, returnReason, fetchReport, handleCloseReturnDialog, language]);

  // Handle mark as paid
  const handleMarkAsPaid = useCallback(async (claim) => {
    if (!window.confirm(t("confirmMarkAsPaid", language) || `Are you sure you want to mark this claim as PAID? This action is FINAL and cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.patch(`/api/healthcare-provider-claims/${claim.id}/mark-paid`);
      fetchReport(); // Refresh the data
    } catch (err) {
      console.error("Failed to mark claim as paid:", err);
      alert(t("failedToMarkAsPaid", language) || "Failed to mark claim as paid: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  }, [fetchReport, language]);

  // Provider type options for filter
  const providerTypeOptions = useMemo(() => [
    { value: "all", label: t("allProviders", language) || "جميع مقدمي الخدمات", icon: null },
    { value: "DOCTOR", label: t("doctorClaims", language) || "مطالبات الأطباء", icon: <LocalHospitalIcon sx={{ fontSize: 18 }} /> },
    { value: "PHARMACIST", label: t("pharmacistClaims", language) || "مطالبات الصيدليات", icon: <LocalPharmacyIcon sx={{ fontSize: 18 }} /> },
    { value: "LAB_TECH", label: t("labClaims", language) || "مطالبات المختبرات", icon: <ScienceIcon sx={{ fontSize: 18 }} /> },
    { value: "RADIOLOGIST", label: t("radiologyClaims", language) || "مطالبات الأشعة", icon: <RadiologyIcon sx={{ fontSize: 18 }} /> },
    { value: "INSURANCE_CLIENT", label: t("clientClaims", language) || "مطالبات العملاء", icon: <PersonOutlineIcon sx={{ fontSize: 18 }} /> },
    { value: "OTHER", label: t("otherClaims", language) || "أخرى/غير مسجل", icon: <HelpOutlineIcon sx={{ fontSize: 18 }} /> },
  ], [language]);

  // Status options for filter
  const statusOptions = useMemo(() => [
    { value: "all", label: t("allStatuses", language) || "جميع الحالات" },
    { value: "approved", label: t("approved", language) || "موافق عليها" },
    { value: "rejected", label: t("rejected", language) || "مرفوضة" },
    { value: "pending", label: t("pending", language) || "معلقة" },
  ], [language]);

  // Sort options
  const sortOptions = useMemo(() => [
    { value: "dateDesc", label: t("newestFirst", language) || "الأحدث أولاً" },
    { value: "dateAsc", label: t("oldestFirst", language) || "الأقدم أولاً" },
    { value: "amountDesc", label: t("highestAmount", language) || "الأعلى مبلغاً" },
    { value: "amountAsc", label: t("lowestAmount", language) || "الأقل مبلغاً" },
    { value: "memberName", label: t("memberNameAZ", language) || "اسم العضو (أ-ي)" },
  ], [language]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("dateDesc");
    setDateFrom("");
    setDateTo("");
    setAmountRange([0, maxAmount]);
    setPolicyFilter("all");
    setProviderTypeFilter("all");
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
      policyFilter !== "all" ||
      providerTypeFilter !== "all"
    );
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, policyFilter, providerTypeFilter]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "all") count++;
    if (sortBy !== "dateDesc") count++;
    if (dateFrom || dateTo) count++;
    if (amountRange[0] !== 0 || amountRange[1] !== maxAmount) count++;
    if (policyFilter !== "all") count++;
    if (providerTypeFilter !== "all") count++;
    return count;
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, policyFilter, providerTypeFilter]);

  // Filter and sort claims
  const filterClaims = useCallback((claims) => {
    if (!claims) return [];

    return claims.filter(claim => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          claim.memberName?.toLowerCase().includes(query) ||
          claim.policyName?.toLowerCase().includes(query) ||
          claim.description?.toLowerCase().includes(query) ||
          claim.providerName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Policy filter
      if (policyFilter !== "all" && claim.policyName !== policyFilter) {
        return false;
      }

      // Provider type filter (uses providerRole field from backend)
      if (providerTypeFilter !== "all") {
        if (providerTypeFilter === "OTHER") {
          // "Other" matches claims with no provider role, null, undefined, or unrecognized types
          const knownTypes = ["DOCTOR", "PHARMACIST", "LAB_TECH", "RADIOLOGIST", "INSURANCE_CLIENT"];
          if (claim.providerRole && knownTypes.includes(claim.providerRole)) {
            return false;
          }
        } else if (claim.providerRole !== providerTypeFilter) {
          return false;
        }
      }

      // Amount range filter
      if (claim.amount < amountRange[0] || claim.amount > amountRange[1]) {
        return false;
      }

      // Date filter (if claim has date field)
      if (dateFrom && claim.createdAt) {
        const claimDate = new Date(claim.createdAt);
        const fromDate = new Date(dateFrom);
        if (claimDate < fromDate) return false;
      }
      if (dateTo && claim.createdAt) {
        const claimDate = new Date(claim.createdAt);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (claimDate > toDate) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case "dateAsc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "dateDesc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "amountAsc":
          return (a.amount || 0) - (b.amount || 0);
        case "amountDesc":
          return (b.amount || 0) - (a.amount || 0);
        case "memberName":
          return (a.memberName || "").localeCompare(b.memberName || "");
        default:
          return 0;
      }
    });
  }, [searchQuery, policyFilter, providerTypeFilter, amountRange, dateFrom, dateTo, sortBy]);

  // Filtered lists
  const filteredApprovedList = useMemo(() =>
    statusFilter === "all" || statusFilter === "approved"
      ? filterClaims(report?.approvedList)
      : [],
    [report?.approvedList, statusFilter, filterClaims]
  );

  const filteredRejectedList = useMemo(() =>
    statusFilter === "all" || statusFilter === "rejected"
      ? filterClaims(report?.rejectedList)
      : [],
    [report?.rejectedList, statusFilter, filterClaims]
  );

  const filteredPendingList = useMemo(() =>
    statusFilter === "all" || statusFilter === "pending"
      ? filterClaims(report?.pendingList)
      : [],
    [report?.pendingList, statusFilter, filterClaims]
  );

  // Filtered summary stats
  const filteredStats = useMemo(() => ({
    totalClaims: filteredApprovedList.length + filteredRejectedList.length + filteredPendingList.length,
    approvedClaims: filteredApprovedList.length,
    rejectedClaims: filteredRejectedList.length,
    pendingClaims: filteredPendingList.length,
    totalApprovedAmount: filteredApprovedList.reduce((sum, c) => sum + (c.amount || 0), 0),
    totalRejectedAmount: filteredRejectedList.reduce((sum, c) => sum + (c.amount || 0), 0),
  }), [filteredApprovedList, filteredRejectedList, filteredPendingList]);

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#FAF8F5",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : "240px",
            marginRight: isRTL ? "240px" : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "#556B2F" }} />
        </Box>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#FAF8F5",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : "240px",
            marginRight: isRTL ? "240px" : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">{t("failedToLoadClaimsReport", language)}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#FAF8F5",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : "240px",
          marginRight: isRTL ? "240px" : 0,
        }}
      >
        <Header />
        <Box sx={{ p: 3 }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "#3D4F23", display: "flex", alignItems: "center" }}
              >
                <AssignmentIcon sx={{ mr: 1, fontSize: 35, color: "#556B2F" }} />
                {t("claimsReport", language) || "تقرير المطالبات"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("claimsReportDescription", language) || "عرض وإدارة جميع مطالبات التأمين الصحي"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={t("refresh", language) || "تحديث"}>
                <IconButton onClick={fetchReport} sx={{ color: "#556B2F" }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Search and Filter Bar */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "#fff" }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("searchClaims", language) || "البحث في المطالبات..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#556B2F" }} />
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
                />
              </Grid>

              {/* Status Filter */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("status", language) || "الحالة"}</InputLabel>
                  <Select
                    value={statusFilter}
                    label={t("status", language) || "الحالة"}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Provider Type Filter */}
              <Grid item xs={6} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("providerType", language) || "نوع مقدم الخدمة"}</InputLabel>
                  <Select
                    value={providerTypeFilter}
                    label={t("providerType", language) || "نوع مقدم الخدمة"}
                    onChange={(e) => setProviderTypeFilter(e.target.value)}
                  >
                    {providerTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("sortBy", language) || "ترتيب حسب"}</InputLabel>
                  <Select
                    value={sortBy}
                    label={t("sortBy", language) || "ترتيب حسب"}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Advanced Filters Toggle */}
              <Grid item xs={6} md={2.5}>
                <Button
                  fullWidth
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={
                    <Badge badgeContent={activeFilterCount} color="error">
                      <TuneIcon />
                    </Badge>
                  }
                  endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    borderColor: "#556B2F",
                    color: showFilters ? "#fff" : "#556B2F",
                    backgroundColor: showFilters ? "#556B2F" : "transparent",
                    "&:hover": {
                      borderColor: "#3D4F23",
                      backgroundColor: showFilters ? "#3D4F23" : "rgba(85, 107, 47, 0.1)",
                    },
                  }}
                >
                  {t("filters", language) || "الفلاتر"}
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters Panel */}
            <Collapse in={showFilters}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* Date Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                    <DateRangeIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t("dateRange", language) || "نطاق التاريخ"}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      type="date"
                      size="small"
                      label={t("from", language) || "من"}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      type="date"
                      size="small"
                      label={t("to", language) || "إلى"}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
                </Grid>

                {/* Policy Filter */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                    <DescriptionIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t("policy", language) || "البوليصة"}
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={policyFilter}
                      onChange={(e) => setPolicyFilter(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="all">{t("allPolicies", language) || "جميع البوليصات"}</MenuItem>
                      {availablePolicies.map((policy) => (
                        <MenuItem key={policy} value={policy}>
                          {policy}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Amount Range */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                    <AttachMoneyIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t("amountRange", language) || "نطاق المبلغ"}: ${amountRange[0]} - ${amountRange[1]}
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={amountRange}
                      onChange={(e, newValue) => setAmountRange(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={maxAmount}
                      step={100}
                      sx={{
                        color: "#556B2F",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#556B2F",
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Clear Filters Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={clearAllFilters}
                      disabled={!hasActiveFilters}
                      sx={{
                        borderColor: "#7B8B5E",
                        color: "#7B8B5E",
                        "&:hover": {
                          borderColor: "#556B2F",
                          backgroundColor: "rgba(85, 107, 47, 0.1)",
                        },
                      }}
                    >
                      {t("clearFilters", language) || "مسح جميع الفلاتر"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

          {/* Filtered Results Info */}
          {hasActiveFilters && (
            <Paper sx={{ p: 1.5, mb: 2, backgroundColor: "#E8EDE0" }}>
              <Typography variant="body2" sx={{ color: "#3D4F23", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <FilterListIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />
                {t("showingFilteredResults", language) || "عرض النتائج المفلترة"}: {filteredStats.totalClaims} {t("claims", language) || "مطالبة"}
                {statusFilter !== "all" && (
                  <Chip size="small" label={statusOptions.find(o => o.value === statusFilter)?.label} sx={{ backgroundColor: "#556B2F", color: "#fff" }} />
                )}
                {providerTypeFilter !== "all" && (
                  <Chip
                    size="small"
                    icon={providerTypeOptions.find(o => o.value === providerTypeFilter)?.icon}
                    label={providerTypeOptions.find(o => o.value === providerTypeFilter)?.label}
                    sx={{ backgroundColor: "#7B8B5E", color: "#fff", "& .MuiChip-icon": { color: "#fff" } }}
                  />
                )}
                {policyFilter !== "all" && (
                  <Chip size="small" label={policyFilter} sx={{ backgroundColor: "#8B9A46", color: "#fff" }} />
                )}
              </Typography>
            </Paper>
          )}

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("totalClaims", language) || "إجمالي المطالبات"}</Typography>
                <Chip label={filteredStats.totalClaims} sx={{ backgroundColor: "#556B2F", color: "#fff" }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("approved", language) || "موافق عليها"}</Typography>
                <Chip label={filteredStats.approvedClaims} sx={{ backgroundColor: "#8B9A46", color: "#fff" }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("rejected", language) || "مرفوضة"}</Typography>
                <Chip label={filteredStats.rejectedClaims} sx={{ backgroundColor: "#7B8B5E", color: "#fff" }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("pending", language) || "معلقة"}</Typography>
                <Chip label={filteredStats.pendingClaims} sx={{ backgroundColor: "#A8B56B", color: "#fff" }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("approvedAmount", language) || "المبلغ الموافق"}</Typography>
                <Typography sx={{ color: "#556B2F", fontWeight: "bold" }}>${filteredStats.totalApprovedAmount.toFixed(2)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                <Typography variant="h6" sx={{ color: "#3D4F23" }}>{t("rejectedAmount", language) || "المبلغ المرفوض"}</Typography>
                <Typography sx={{ color: "#7B8B5E", fontWeight: "bold" }}>${filteredStats.totalRejectedAmount.toFixed(2)}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Approved Claims */}
          {(statusFilter === "all" || statusFilter === "approved") && (
            <>
              <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                {t("approvedClaims", language) || "المطالبات الموافق عليها"}
                <Chip label={filteredApprovedList.length} size="small" sx={{ ml: 1, backgroundColor: "#8B9A46", color: "#fff" }} />
              </Typography>
              {filteredApprovedList.length > 0 ? (
                filteredApprovedList.map((claim) => (
                  <Paper key={claim.id} sx={{ p: 2, mb: 2, backgroundColor: "#E8EDE0", borderLeft: "4px solid #556B2F" }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={2.5}>
                        <Typography><PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#556B2F" }} /><b>{t("member", language) || "العضو"}:</b> {claim.memberName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography><DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#556B2F" }} /><b>{t("policy", language) || "البوليصة"}:</b> {claim.policyName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.5}>
                        <Typography><b>{t("description", language) || "الوصف"}:</b> {sanitizeString(claim.description)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <Typography><AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#556B2F" }} /><b>{t("amount", language) || "المبلغ"}:</b> ${claim.amount}</Typography>
                      </Grid>
                      <Grid item xs={12} md={3.5} sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <Tooltip title={t("viewDetails", language) || "عرض التفاصيل"}>
                            <IconButton
                              onClick={() => handleViewDetails(claim, "approved")}
                              sx={{ color: "#556B2F", "&:hover": { backgroundColor: "rgba(85, 107, 47, 0.1)" } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("returnForReview", language) || "إعادة للمراجعة"}>
                            <IconButton
                              onClick={() => handleOpenReturnDialog(claim)}
                              disabled={actionLoading}
                              sx={{ color: "#ff9800", "&:hover": { backgroundColor: "rgba(255, 152, 0, 0.1)" } }}
                            >
                              <UndoIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("markAsPaid", language) || "تعليم كمدفوعة (نهائي)"}>
                            <IconButton
                              onClick={() => handleMarkAsPaid(claim)}
                              disabled={actionLoading}
                              sx={{ color: "#4caf50", "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.1)" } }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>{t("noApprovedClaims", language) || "لا توجد مطالبات موافق عليها"}</Typography>
              )}
            </>
          )}

          {/* Rejected Claims */}
          {(statusFilter === "all" || statusFilter === "rejected") && (
            <>
              <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "#7B8B5E", display: "flex", alignItems: "center" }}>
                {t("rejectedClaims", language) || "المطالبات المرفوضة"}
                <Chip label={filteredRejectedList.length} size="small" sx={{ ml: 1, backgroundColor: "#7B8B5E", color: "#fff" }} />
              </Typography>
              {filteredRejectedList.length > 0 ? (
                filteredRejectedList.map((claim) => (
                  <Paper key={claim.id} sx={{ p: 2, mb: 2, backgroundColor: "#F5F5DC", borderLeft: "4px solid #7B8B5E" }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={2.5}>
                        <Typography><PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#7B8B5E" }} /><b>{t("member", language) || "العضو"}:</b> {claim.memberName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography><DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#7B8B5E" }} /><b>{t("policy", language) || "البوليصة"}:</b> {claim.policyName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.5}>
                        <Typography><b>{t("description", language) || "الوصف"}:</b> {sanitizeString(claim.description)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography color="error"><b>{t("reason", language) || "السبب"}:</b> {sanitizeString(claim.rejectionReason)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography><AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#7B8B5E" }} /><b>{t("amount", language) || "المبلغ"}:</b> ${claim.amount}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ textAlign: "center" }}>
                        <Tooltip title={t("viewDetails", language) || "عرض التفاصيل"}>
                          <IconButton
                            onClick={() => handleViewDetails(claim, "rejected")}
                            sx={{ color: "#7B8B5E", "&:hover": { backgroundColor: "rgba(123, 139, 94, 0.1)" } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>{t("noRejectedClaims", language) || "لا توجد مطالبات مرفوضة"}</Typography>
              )}
            </>
          )}

          {/* Pending Claims */}
          {(statusFilter === "all" || statusFilter === "pending") && (
            <>
              <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "#8B9A46", display: "flex", alignItems: "center" }}>
                {t("pendingClaimsTitle", language) || "المطالبات المعلقة"}
                <Chip label={filteredPendingList.length} size="small" sx={{ ml: 1, backgroundColor: "#A8B56B", color: "#fff" }} />
              </Typography>
              {filteredPendingList.length > 0 ? (
                filteredPendingList.map((claim) => (
                  <Paper key={claim.id} sx={{ p: 2, mb: 2, backgroundColor: "#FAF8F5", borderLeft: "4px solid #8B9A46" }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Typography><PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#8B9A46" }} /><b>{t("member", language) || "العضو"}:</b> {claim.memberName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2.5}>
                        <Typography><DescriptionIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#8B9A46" }} /><b>{t("policy", language) || "البوليصة"}:</b> {claim.policyName}</Typography>
                      </Grid>
                      <Grid item xs={12} md={3.5}>
                        <Typography><b>{t("description", language) || "الوصف"}:</b> {sanitizeString(claim.description)}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography><AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle", color: "#8B9A46" }} /><b>{t("amount", language) || "المبلغ"}:</b> ${claim.amount}</Typography>
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ textAlign: "center" }}>
                        <Tooltip title={t("viewDetails", language) || "عرض التفاصيل"}>
                          <IconButton
                            onClick={() => handleViewDetails(claim, "pending")}
                            sx={{ color: "#8B9A46", "&:hover": { backgroundColor: "rgba(139, 154, 70, 0.1)" } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>{t("noPendingClaims", language) || "لا توجد مطالبات معلقة"}</Typography>
              )}
            </>
          )}

          {/* Claim Details Dialog */}
          <Dialog
            open={detailsDialogOpen}
            onClose={handleCloseDetails}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                backgroundColor:
                  selectedClaim?.status === "approved"
                    ? "#556B2F"
                    : selectedClaim?.status === "rejected"
                    ? "#7B8B5E"
                    : "#8B9A46",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VisibilityIcon />
                <Typography variant="h6">{t("claimDetails", language) || "تفاصيل المطالبة"}</Typography>
              </Box>
              <IconButton onClick={handleCloseDetails} sx={{ color: "#fff" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              {selectedClaim && (
                <Grid container spacing={3}>
                  {/* Status & Follow-up Badge */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t("status", language) || "الحالة"}:
                      </Typography>
                      <Chip
                        label={
                          selectedClaim.status === "approved"
                            ? t("approved", language) || "موافق عليها"
                            : selectedClaim.status === "rejected"
                            ? t("rejected", language) || "مرفوضة"
                            : t("pending", language) || "معلقة"
                        }
                        sx={{
                          backgroundColor:
                            selectedClaim.status === "approved"
                              ? "#556B2F"
                              : selectedClaim.status === "rejected"
                              ? "#d32f2f"
                              : "#ff9800",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                      {selectedClaim.isFollowUp && (
                        <Chip
                          icon={<ReplayIcon sx={{ color: "#fff !important" }} />}
                          label={t("followUpVisit", language) || "زيارة متابعة"}
                          sx={{ backgroundColor: "#2196f3", color: "#fff" }}
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* ===== PROVIDER INFORMATION ===== */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#556B2F", mb: 1 }}>
                      <LocalHospitalIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      {t("providerInformation", language) || "معلومات مقدم الخدمة"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <PersonIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("providerName", language) || "اسم مقدم الخدمة"}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedClaim.providerName || "-"}
                    </Typography>
                    {selectedClaim.providerRole && (
                      <Chip
                        size="small"
                        label={
                          selectedClaim.providerRole === "DOCTOR" ? t("doctor", language) || "طبيب" :
                          selectedClaim.providerRole === "PHARMACIST" ? t("pharmacist", language) || "صيدلي" :
                          selectedClaim.providerRole === "LAB_TECH" ? t("labTech", language) || "فني مختبر" :
                          selectedClaim.providerRole === "RADIOLOGIST" ? t("radiologist", language) || "أخصائي أشعة" :
                          selectedClaim.providerRole === "INSURANCE_CLIENT" ? t("client", language) || "عميل" :
                          selectedClaim.providerRole
                        }
                        sx={{ mt: 0.5, backgroundColor: "#E8EDE0", color: "#3D4F23" }}
                      />
                    )}
                  </Grid>

                  {selectedClaim.providerEmployeeId && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <WorkIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("employeeId", language) || "رقم الموظف"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.providerEmployeeId}</Typography>
                    </Grid>
                  )}

                  {selectedClaim.providerNationalId && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <BadgeIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("nationalId", language) || "رقم الهوية"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.providerNationalId}</Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  {/* ===== CLIENT/PATIENT INFORMATION ===== */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#556B2F", mb: 1 }}>
                      <PersonOutlineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      {t("patientInformation", language) || "معلومات المريض"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <PersonIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("patientName", language) || "اسم المريض"}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedClaim.clientName || selectedClaim.memberName || "-"}
                    </Typography>
                  </Grid>

                  {selectedClaim.clientAge && (
                    <Grid item xs={6} md={2}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("age", language) || "العمر"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.clientAge} {t("years", language) || "سنة"}</Typography>
                    </Grid>
                  )}

                  {selectedClaim.clientGender && (
                    <Grid item xs={6} md={2}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("gender", language) || "الجنس"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.clientGender === "M" ? "ذكر" : selectedClaim.clientGender === "F" ? "أنثى" : selectedClaim.clientGender}</Typography>
                    </Grid>
                  )}

                  {selectedClaim.clientInsuranceNumber && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ReceiptIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("insuranceNumber", language) || "رقم التأمين"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.clientInsuranceNumber}</Typography>
                    </Grid>
                  )}

                  {selectedClaim.clientEmployeeId && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <WorkIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("employeeId", language) || "رقم الموظف"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.clientEmployeeId}</Typography>
                    </Grid>
                  )}

                  {selectedClaim.clientNationalId && (
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <BadgeIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("nationalId", language) || "رقم الهوية"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.clientNationalId}</Typography>
                    </Grid>
                  )}

                  {(selectedClaim.clientFaculty || selectedClaim.clientDepartment) && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <SchoolIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("facultyDepartment", language) || "الكلية / القسم"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {[selectedClaim.clientFaculty, selectedClaim.clientDepartment].filter(Boolean).join(" / ") || "-"}
                      </Typography>
                    </Grid>
                  )}

                  {/* ===== FAMILY MEMBER INFO (if applicable) ===== */}
                  {selectedClaim.familyMemberName && (
                    <>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#8B9A46", mb: 1 }}>
                          <FamilyRestroomIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                          {t("familyMemberInformation", language) || "معلومات فرد العائلة"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <PersonIcon sx={{ color: "#8B9A46", fontSize: 18 }} />
                          <Typography variant="caption" color="text.secondary">
                            {t("name", language) || "الاسم"}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">{selectedClaim.familyMemberName}</Typography>
                      </Grid>

                      {selectedClaim.familyMemberRelation && (
                        <Grid item xs={6} md={2}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t("relation", language) || "صلة القرابة"}
                            </Typography>
                          </Box>
                          <Chip size="small" label={selectedClaim.familyMemberRelation} sx={{ backgroundColor: "#E8EDE0" }} />
                        </Grid>
                      )}

                      {selectedClaim.familyMemberAge && (
                        <Grid item xs={6} md={2}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t("age", language) || "العمر"}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{selectedClaim.familyMemberAge} {t("years", language) || "سنة"}</Typography>
                        </Grid>
                      )}

                      {selectedClaim.familyMemberGender && (
                        <Grid item xs={6} md={2}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t("gender", language) || "الجنس"}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{selectedClaim.familyMemberGender === "M" ? "ذكر" : selectedClaim.familyMemberGender === "F" ? "أنثى" : selectedClaim.familyMemberGender}</Typography>
                        </Grid>
                      )}

                      {selectedClaim.familyMemberInsuranceNumber && (
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <ReceiptIcon sx={{ color: "#8B9A46", fontSize: 18 }} />
                            <Typography variant="caption" color="text.secondary">
                              {t("insuranceNumber", language) || "رقم التأمين"}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{selectedClaim.familyMemberInsuranceNumber}</Typography>
                        </Grid>
                      )}

                      {selectedClaim.familyMemberNationalId && (
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <BadgeIcon sx={{ color: "#8B9A46", fontSize: 18 }} />
                            <Typography variant="caption" color="text.secondary">
                              {t("nationalId", language) || "رقم الهوية"}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{selectedClaim.familyMemberNationalId}</Typography>
                        </Grid>
                      )}
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  {/* ===== CLAIM DETAILS ===== */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#556B2F", mb: 1 }}>
                      <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      {t("claimDetails", language) || "تفاصيل المطالبة"}
                    </Typography>
                  </Grid>

                  {/* Amount & Service Date */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <AttachMoneyIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("amount", language) || "المبلغ"}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: "#556B2F" }}>
                      ${selectedClaim.amount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Grid>

                  {selectedClaim.serviceDate && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <EventIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("serviceDate", language) || "تاريخ الخدمة"}
                        </Typography>
                      </Box>
                      <Typography variant="body1">
                        {new Date(selectedClaim.serviceDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Grid>
                  )}

                  {/* Policy Info */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <DescriptionIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("policy", language) || "البوليصة"}
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedClaim.policyName || "-"}
                    </Typography>
                  </Grid>

                  {/* Follow-up info */}
                  {selectedClaim.isFollowUp && selectedClaim.originalConsultationFee && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ReplayIcon sx={{ color: "#2196f3", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("originalConsultationFee", language) || "رسوم الاستشارة الأصلية"}
                        </Typography>
                      </Box>
                      <Typography variant="body1">${parseFloat(selectedClaim.originalConsultationFee).toFixed(2)}</Typography>
                    </Grid>
                  )}

                  {/* Description */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t("description", language) || "الوصف"}
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 2, backgroundColor: "#FAF8F5" }}>
                      <Typography variant="body1">
                        {selectedClaim.description || t("noDescription", language) || "لا يوجد وصف"}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Diagnosis */}
                  {selectedClaim.diagnosis && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <MedicalServicesIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("diagnosis", language) || "التشخيص"}
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, backgroundColor: "#E8F5E9", borderLeft: "4px solid #4caf50" }}>
                        <Typography variant="body1">{selectedClaim.diagnosis}</Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Treatment Details */}
                  {selectedClaim.treatmentDetails && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <LocalHospitalIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("treatmentDetails", language) || "تفاصيل العلاج"}
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, backgroundColor: "#E3F2FD", borderLeft: "4px solid #2196f3" }}>
                        <Typography variant="body1">{selectedClaim.treatmentDetails}</Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Role Specific Data (medicines, lab results, etc.) */}
                  {selectedClaim.roleSpecificData && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <DescriptionIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("additionalDetails", language) || "تفاصيل إضافية"}
                          ({selectedClaim.providerRole === "PHARMACIST" ? t("medicines", language) || "الأدوية" :
                            selectedClaim.providerRole === "LAB_TECH" ? t("testResults", language) || "نتائج الفحوصات" :
                            selectedClaim.providerRole === "RADIOLOGIST" ? t("imagingDetails", language) || "تفاصيل التصوير" :
                            t("details", language) || "التفاصيل"})
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, backgroundColor: "#FFF8E1", borderLeft: "4px solid #ff9800" }}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                          {selectedClaim.roleSpecificData}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Invoice Image */}
                  {selectedClaim.invoiceImagePath && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ImageIcon sx={{ color: "#556B2F", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("invoiceImage", language) || "صورة الفاتورة"}
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, backgroundColor: "#FAF8F5", display: "flex", alignItems: "center", gap: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ImageIcon />}
                          onClick={() => window.open(`http://localhost:8080${selectedClaim.invoiceImagePath}`, '_blank')}
                          sx={{ borderColor: "#556B2F", color: "#556B2F" }}
                        >
                          {t("viewInvoice", language) || "عرض الفاتورة"}
                        </Button>
                        <Typography variant="body2" color="text.secondary">
                          {selectedClaim.invoiceImagePath.split('/').pop()}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {/* Rejection Reason (if rejected) */}
                  {selectedClaim.status === "rejected" && selectedClaim.rejectionReason && (
                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ClearIcon sx={{ color: "#d32f2f", fontSize: 18 }} />
                        <Typography variant="caption" color="error">
                          {t("rejectionReason", language) || "سبب الرفض"}
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, backgroundColor: "#ffebee", borderLeft: "4px solid #d32f2f" }}>
                        <Typography variant="body1" color="error">
                          {sanitizeString(selectedClaim.rejectionReason)}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  {/* ===== TIMESTAMPS & REVIEW INFO ===== */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#556B2F", mb: 1 }}>
                      <DateRangeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      {t("timestampsAndReview", language) || "التواريخ والمراجعة"}
                    </Typography>
                  </Grid>

                  {/* Submitted At */}
                  {selectedClaim.submittedAt && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t("submittedAt", language) || "تاريخ التقديم"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {new Date(selectedClaim.submittedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                      </Typography>
                    </Grid>
                  )}

                  {/* Medical Reviewed At */}
                  {selectedClaim.medicalReviewedAt && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <ReviewsIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("medicalReviewedAt", language) || "تاريخ المراجعة الطبية"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {new Date(selectedClaim.medicalReviewedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                      </Typography>
                    </Grid>
                  )}

                  {/* Medical Reviewer */}
                  {selectedClaim.medicalReviewerName && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <PersonIcon sx={{ color: "#7B8B5E", fontSize: 18 }} />
                        <Typography variant="caption" color="text.secondary">
                          {t("medicalReviewer", language) || "المراجع الطبي"}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{selectedClaim.medicalReviewerName}</Typography>
                    </Grid>
                  )}

                  {/* Approved At */}
                  {selectedClaim.approvedAt && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "#4caf50" }}>
                          {t("approvedAt", language) || "تاريخ الموافقة"}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#4caf50" }}>
                        {new Date(selectedClaim.approvedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                      </Typography>
                    </Grid>
                  )}

                  {/* Rejected At */}
                  {selectedClaim.rejectedAt && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="error">
                          {t("rejectedAt", language) || "تاريخ الرفض"}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="error">
                        {new Date(selectedClaim.rejectedAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US")}
                      </Typography>
                    </Grid>
                  )}

                  {/* Claim ID */}
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t("claimId", language) || "رقم المطالبة"}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", color: "#666", backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}>
                      {selectedClaim.id || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: "#FAF8F5" }}>
              <Button
                variant="contained"
                onClick={handleCloseDetails}
                sx={{
                  backgroundColor: "#556B2F",
                  "&:hover": { backgroundColor: "#3D4F23" },
                }}
              >
                {t("close", language) || "إغلاق"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Return for Review Dialog */}
          <Dialog
            open={returnDialogOpen}
            onClose={handleCloseReturnDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#ff9800",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UndoIcon />
                <Typography variant="h6">{t("returnForReview", language) || "إعادة للمراجعة"}</Typography>
              </Box>
              <IconButton onClick={handleCloseReturnDialog} sx={{ color: "#fff" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              {claimToReturn && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {t("returnClaimConfirmation", language) || "أنت على وشك إعادة هذه المطالبة الموافق عليها للمراجعة الطبية. يرجى تقديم سبب:"}
                  </Typography>

                  <Paper sx={{ p: 2, mb: 3, backgroundColor: "#FFF8E1", borderLeft: "4px solid #ff9800" }}>
                    <Typography variant="body2">
                      <b>{t("claimId", language) || "رقم المطالبة"}:</b> {claimToReturn.id}
                    </Typography>
                    <Typography variant="body2">
                      <b>{t("member", language) || "العضو"}:</b> {claimToReturn.memberName}
                    </Typography>
                    <Typography variant="body2">
                      <b>{t("amount", language) || "المبلغ"}:</b> ${claimToReturn.amount}
                    </Typography>
                  </Paper>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={t("reasonForReturn", language) || "سبب الإعادة"}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder={t("enterReasonForReturn", language) || "أدخل سبب إعادة هذه المطالبة للمراجعة..."}
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#ff9800",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#ff9800",
                      },
                    }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: "#FAF8F5", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleCloseReturnDialog}
                disabled={actionLoading}
                sx={{
                  borderColor: "#7B8B5E",
                  color: "#7B8B5E",
                  "&:hover": { borderColor: "#556B2F", backgroundColor: "rgba(85, 107, 47, 0.1)" },
                }}
              >
                {t("cancel", language) || "إلغاء"}
              </Button>
              <Button
                variant="contained"
                onClick={handleReturnForReview}
                disabled={actionLoading || !returnReason.trim()}
                startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <UndoIcon />}
                sx={{
                  backgroundColor: "#ff9800",
                  "&:hover": { backgroundColor: "#f57c00" },
                  "&:disabled": { backgroundColor: "#ffcc80" },
                }}
              >
                {actionLoading ? (t("processing", language) || "جاري المعالجة...") : (t("returnForReview", language) || "إعادة للمراجعة")}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimsReport;
