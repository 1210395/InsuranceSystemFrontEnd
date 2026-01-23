// src/Component/Manager/AdminFunctions/ManagerMedicalDecisionsList.jsx
// Manager wrapper for MedicalDecisionsList with Manager Sidebar and Header
// Enhanced with advanced filtering, pagination, and export for large datasets
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
  Slider,
  Card,
  CardContent,
  Pagination,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Manager-specific imports
import Header from "../Header";
import Sidebar from "../Sidebar";

// Icons
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import DownloadIcon from "@mui/icons-material/Download";
import TableChartIcon from "@mui/icons-material/TableChart";

import { api } from "../../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";
import { sanitizeString } from "../../../utils/sanitize";

const ManagerMedicalDecisionsList = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // ==========================================
  // ADVANCED FILTER STATES
  // ==========================================
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("dateDesc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountRange, setAmountRange] = useState([0, 1000]);
  const [maxAmount, setMaxAmount] = useState(1000);
  const [providerSearch, setProviderSearch] = useState("");
  const [diagnosisSearch, setDiagnosisSearch] = useState("");

  // ==========================================
  // PAGINATION STATES
  // ==========================================
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==========================================
  // VIEW MODE STATE
  // ==========================================
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  // TAB CONFIG
  const claimTabs = useMemo(() => [
    { label: t("doctorClaims", language), role: "DOCTOR", icon: <LocalHospitalIcon /> },
    { label: t("pharmacyClaims", language), role: "PHARMACIST", icon: <MedicationIcon /> },
    { label: t("labClaims", language), role: "LAB_TECH", icon: <BiotechIcon /> },
    { label: t("radiologyClaims", language), role: "RADIOLOGIST", icon: <MonitorHeartIcon /> },
    { label: t("clientClaims", language), role: "INSURANCE_CLIENT", icon: <PersonIcon /> },
  ], [language]);

  // Status options
  const statusOptions = useMemo(() => [
    { value: "ALL", label: "All Statuses", color: "default" },
    { value: "APPROVED_FINAL", label: "Approved", color: "success" },
    { value: "REJECTED_FINAL", label: "Rejected", color: "error" },
    { value: "PENDING_MEDICAL", label: "Pending Medical", color: "info" },
    { value: "RETURNED_FOR_REVIEW", label: "Returned", color: "warning" },
  ], []);

  // Sort options
  const sortOptions = useMemo(() => [
    { value: "dateDesc", label: "Newest First" },
    { value: "dateAsc", label: "Oldest First" },
    { value: "amountDesc", label: "Highest Amount" },
    { value: "amountAsc", label: "Lowest Amount" },
    { value: "clientName", label: "Client Name (A-Z)" },
    { value: "providerName", label: "Provider Name (A-Z)" },
    { value: "statusAsc", label: "Status (Approved First)" },
    { value: "statusDesc", label: "Status (Rejected First)" },
  ], []);

  // Fetch claims
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.FINAL_DECISIONS);
      const claimsData = res || [];
      setClaims(claimsData);

      // Calculate max amount for slider
      if (claimsData.length > 0) {
        const max = Math.max(...claimsData.map(c => c.amount || 0));
        setMaxAmount(Math.ceil(max / 100) * 100 || 1000);
        setAmountRange([0, Math.ceil(max / 100) * 100 || 1000]);
      }
    } catch (err) {
      console.error("Failed to load final decisions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // TIME FORMATTER
  const timeSince = useCallback((timestamp) => {
    if (!timestamp) return "N/A";
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  }, []);

  const parseRoleSpecificData = useCallback((roleSpecificData) => {
    if (!roleSpecificData) return null;
    if (typeof roleSpecificData === "object") return roleSpecificData;
    if (typeof roleSpecificData !== "string") return null;
    try {
      return JSON.parse(roleSpecificData);
    } catch {
      return null;
    }
  }, []);

  const getStatusChip = useCallback((status) => {
    switch (status) {
      case "APPROVED_FINAL":
        return { color: "success", label: t("approvedFinal", language), icon: <CheckCircleIcon /> };
      case "REJECTED_FINAL":
        return { color: "error", label: t("rejectedFinal", language), icon: <CancelIcon /> };
      case "PENDING_MEDICAL":
        return { color: "info", label: t("pendingMedicalReview", language) };
      case "RETURNED_FOR_REVIEW":
        return { color: "warning", label: t("returnedForReview", language) };
      default:
        return { color: "default", label: status };
    }
  }, [language]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setSortBy("dateDesc");
    setDateFrom("");
    setDateTo("");
    setAmountRange([0, maxAmount]);
    setProviderSearch("");
    setDiagnosisSearch("");
    setPage(0);
  }, [maxAmount]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      statusFilter !== "ALL" ||
      sortBy !== "dateDesc" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      amountRange[0] !== 0 ||
      amountRange[1] !== maxAmount ||
      providerSearch !== "" ||
      diagnosisSearch !== ""
    );
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, providerSearch, diagnosisSearch]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "ALL") count++;
    if (sortBy !== "dateDesc") count++;
    if (dateFrom || dateTo) count++;
    if (amountRange[0] !== 0 || amountRange[1] !== maxAmount) count++;
    if (providerSearch) count++;
    if (diagnosisSearch) count++;
    return count;
  }, [searchQuery, statusFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount, providerSearch, diagnosisSearch]);

  // FILTER CLAIMS
  const filteredClaims = useMemo(() => {
    if (!claims || !Array.isArray(claims)) return [];
    let result = claims.filter((c) => c.providerRole === claimTabs[selectedTab].role);

    // Apply client name search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        (c.clientName || "").toLowerCase().includes(query) ||
        (c.id || "").toLowerCase().includes(query)
      );
    }

    // Apply provider search
    if (providerSearch.trim()) {
      const query = providerSearch.toLowerCase();
      result = result.filter((c) =>
        (c.providerName || "").toLowerCase().includes(query)
      );
    }

    // Apply diagnosis search
    if (diagnosisSearch.trim()) {
      const query = diagnosisSearch.toLowerCase();
      result = result.filter((c) =>
        (c.diagnosis || "").toLowerCase().includes(query) ||
        (c.treatmentDetails || "").toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((c) => {
        const claimDate = new Date(c.approvedAt || c.rejectedAt || c.submittedAt);
        return claimDate >= fromDate;
      });
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((c) => {
        const claimDate = new Date(c.approvedAt || c.rejectedAt || c.submittedAt);
        return claimDate <= toDate;
      });
    }

    // Apply amount range filter
    result = result.filter((c) => {
      const amount = c.amount || 0;
      return amount >= amountRange[0] && amount <= amountRange[1];
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "dateDesc":
          return new Date(b.approvedAt || b.rejectedAt || b.submittedAt) -
                 new Date(a.approvedAt || a.rejectedAt || a.submittedAt);
        case "dateAsc":
          return new Date(a.approvedAt || a.rejectedAt || a.submittedAt) -
                 new Date(b.approvedAt || b.rejectedAt || b.submittedAt);
        case "amountDesc":
          return (b.amount || 0) - (a.amount || 0);
        case "amountAsc":
          return (a.amount || 0) - (b.amount || 0);
        case "clientName":
          return (a.clientName || "").localeCompare(b.clientName || "");
        case "providerName":
          return (a.providerName || "").localeCompare(b.providerName || "");
        case "statusAsc":
          return (a.status || "").localeCompare(b.status || "");
        case "statusDesc":
          return (b.status || "").localeCompare(a.status || "");
        default:
          return new Date(b.approvedAt || b.rejectedAt || b.submittedAt) -
                 new Date(a.approvedAt || a.rejectedAt || a.submittedAt);
      }
    });

    return result;
  }, [claims, selectedTab, claimTabs, searchQuery, providerSearch, diagnosisSearch, statusFilter, dateFrom, dateTo, amountRange, sortBy]);

  // Get paginated claims
  const paginatedClaims = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredClaims.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredClaims, page, rowsPerPage]);

  // Get tab counts
  const tabCounts = useMemo(() => {
    if (!claims || !Array.isArray(claims)) return claimTabs.map(() => 0);
    return claimTabs.map(tab =>
      claims.filter(c => c.providerRole === tab.role).length
    );
  }, [claims, claimTabs]);

  // Get statistics for current tab
  const currentTabStats = useMemo(() => {
    const currentRole = claimTabs[selectedTab]?.role;
    if (!currentRole || !claims || !Array.isArray(claims)) return { total: 0, approved: 0, rejected: 0, totalAmount: 0 };

    const tabClaims = claims.filter((c) => c.providerRole === currentRole);
    return {
      total: tabClaims.length,
      approved: tabClaims.filter((c) => c.status === "APPROVED_FINAL").length,
      rejected: tabClaims.filter((c) => c.status === "REJECTED_FINAL").length,
      totalAmount: tabClaims.reduce((sum, c) => sum + (c.amount || 0), 0),
    };
  }, [claims, selectedTab, claimTabs]);

  // Handle page change
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["Claim ID", "Client Name", "Provider Name", "Diagnosis", "Amount", "Status", "Service Date", "Decision Date"];
    const rows = filteredClaims.map(claim => [
      claim.id,
      claim.clientName || "N/A",
      claim.providerName || "N/A",
      claim.diagnosis || "N/A",
      claim.amount?.toFixed(2) || "0",
      claim.status,
      claim.serviceDate || "N/A",
      formatDate(claim.approvedAt || claim.rejectedAt)
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `medical_decisions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredClaims, formatDate]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
  }, [selectedTab]);

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
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#3D4F23", mb: 1 }}>
                <AssignmentIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 35, verticalAlign: "middle" }} />
                {t("finalMedicalDecisions", language)}
              </Typography>
              <Typography sx={{ color: "#6B7280" }}>
                {t("viewApprovedRejectedClaims", language)}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Export to CSV">
                <IconButton
                  onClick={handleExportCSV}
                  disabled={filteredClaims.length === 0}
                  sx={{
                    bgcolor: "#4CAF50",
                    color: "#fff",
                    "&:hover": { bgcolor: "#388E3C" },
                    "&:disabled": { bgcolor: "#BDBDBD" },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={fetchClaims}
                  disabled={loading}
                  sx={{
                    bgcolor: "#556B2F",
                    color: "#fff",
                    "&:hover": { bgcolor: "#3D4F23" },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* STATISTICS CARDS */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: "#E8F5E9", borderLeft: "4px solid #4CAF50" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#2E7D32">
                    {currentTabStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Decisions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: "#E3F2FD", borderLeft: "4px solid #2196F3" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#1565C0">
                    {currentTabStats.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: "#FFEBEE", borderLeft: "4px solid #F44336" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#C62828">
                    {currentTabStats.rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: "#FFF3E0", borderLeft: "4px solid #FF9800" }}>
                <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="h4" fontWeight="bold" color="#E65100">
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
              {/* Search by Client */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by client name or ID..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#FAFAFA" } }}
                />
              </Grid>

              {/* Status Filter */}
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    sx={{ borderRadius: 2, bgcolor: "#FAFAFA" }}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.value === "APPROVED_FINAL" && <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 18 }} />}
                          {option.value === "REJECTED_FINAL" && <CancelIcon sx={{ color: "#F44336", fontSize: 18 }} />}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={6} md={2}>
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

              {/* View Toggle */}
              <Grid item xs={6} md={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="cards">
                    <Tooltip title="Card View">
                      <ViewModuleIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="table">
                    <Tooltip title="Table View">
                      <TableChartIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {/* Filter Toggle Button */}
              <Grid item xs={6} md={1.5}>
                <Button
                  fullWidth
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<TuneIcon />}
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
                  {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
                </Button>
              </Grid>

              {/* Clear Filters */}
              <Grid item xs={6} md={1.5}>
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
                    "&:disabled": { borderColor: "#BDBDBD", color: "#BDBDBD" },
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters Panel */}
            <Collapse in={showFilters}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* Provider Search */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search by Provider"
                    placeholder="Provider name..."
                    value={providerSearch}
                    onChange={(e) => { setProviderSearch(e.target.value); setPage(0); }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#6B7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Diagnosis Search */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search by Diagnosis"
                    placeholder="Diagnosis or treatment..."
                    value={diagnosisSearch}
                    onChange={(e) => { setDiagnosisSearch(e.target.value); setPage(0); }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalHospitalIcon sx={{ color: "#6B7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Date Range */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <DateRangeIcon fontSize="small" />
                    Decision Date Range
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      type="date"
                      size="small"
                      label="From"
                      value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      label="To"
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                </Grid>

                {/* Amount Range */}
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoneyIcon fontSize="small" />
                    Amount: {amountRange[0]} - {amountRange[1]} {CURRENCY.SYMBOL}
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={amountRange}
                      onChange={(e, newValue) => { setAmountRange(newValue); setPage(0); }}
                      valueLabelDisplay="auto"
                      min={0}
                      max={maxAmount}
                      step={10}
                      sx={{ color: "#556B2F" }}
                    />
                  </Box>
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
                <Chip size="small" label={`Client: "${searchQuery}"`} onDelete={() => setSearchQuery("")} sx={{ bgcolor: "#E8F5E9" }} />
              )}
              {providerSearch && (
                <Chip size="small" label={`Provider: "${providerSearch}"`} onDelete={() => setProviderSearch("")} sx={{ bgcolor: "#E3F2FD" }} />
              )}
              {diagnosisSearch && (
                <Chip size="small" label={`Diagnosis: "${diagnosisSearch}"`} onDelete={() => setDiagnosisSearch("")} sx={{ bgcolor: "#FFF3E0" }} />
              )}
              {statusFilter !== "ALL" && (
                <Chip
                  size="small"
                  label={`Status: ${statusOptions.find(o => o.value === statusFilter)?.label}`}
                  onDelete={() => setStatusFilter("ALL")}
                  color={statusFilter === "APPROVED_FINAL" ? "success" : statusFilter === "REJECTED_FINAL" ? "error" : "default"}
                  variant="outlined"
                />
              )}
              {(dateFrom || dateTo) && (
                <Chip size="small" label={`Date: ${dateFrom || "..."} to ${dateTo || "..."}`} onDelete={() => { setDateFrom(""); setDateTo(""); }} sx={{ bgcolor: "#F3E5F5" }} />
              )}
              {(amountRange[0] !== 0 || amountRange[1] !== maxAmount) && (
                <Chip size="small" label={`Amount: ${amountRange[0]} - ${amountRange[1]} ${CURRENCY.SYMBOL}`} onDelete={() => setAmountRange([0, maxAmount])} sx={{ bgcolor: "#FFECB3" }} />
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
              "& .MuiTab-root": { fontWeight: "bold", textTransform: "none", minHeight: 56 },
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

          {/* Results Count & Pagination Info */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Showing <b>{paginatedClaims.length}</b> of <b>{filteredClaims.length}</b> decisions
              {hasActiveFilters && ` (filtered from ${tabCounts[selectedTab]})`}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={5}>5 per page</MenuItem>
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
                <MenuItem value={100}>100 per page</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* CONTENT */}
          {loading ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : filteredClaims.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
              <SearchIcon sx={{ fontSize: 60, color: "#BDBDBD", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "#6B7280", mb: 1 }}>
                {hasActiveFilters ? "No decisions match your filters" : t("noClaimsFound", language)}
              </Typography>
              {hasActiveFilters && (
                <Button variant="outlined" startIcon={<ClearIcon />} onClick={clearAllFilters} sx={{ mt: 2, textTransform: "none" }}>
                  Clear all filters
                </Button>
              )}
            </Paper>
          ) : viewMode === "table" ? (
            /* TABLE VIEW */
            <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#556B2F" }}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Client</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Provider</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Diagnosis</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Amount</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedClaims.map((claim) => {
                      const statusInfo = getStatusChip(claim.status);
                      return (
                        <TableRow key={claim.id} hover>
                          <TableCell>
                            <Typography fontWeight="500">{claim.clientName || "N/A"}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {claim.id?.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell>{claim.providerName || "N/A"}</TableCell>
                          <TableCell sx={{ maxWidth: 200 }}>
                            <Typography noWrap title={claim.diagnosis}>
                              {claim.diagnosis || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {claim.amount?.toFixed(2) || "0"} {CURRENCY.SYMBOL}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(claim.approvedAt || claim.rejectedAt || claim.submittedAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => { setSelectedClaim(claim); setOpenFilesModal(true); }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            /* CARD VIEW */
            paginatedClaims.map((claim) => {
              const statusInfo = getStatusChip(claim.status);
              const roleData = parseRoleSpecificData(claim.roleSpecificData);
              const pharmacyItems = claim.providerRole === "PHARMACIST" ? roleData?.items : null;
              const isChronicPrescription = roleData?.isChronic === true;
              const labTestName = claim.providerRole === "LAB_TECH" ? roleData?.testName : null;
              const radiologyTestName = claim.providerRole === "RADIOLOGIST" ? roleData?.testName : null;

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 2,
                    background: "#FFFFFF",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    borderLeft: `6px solid ${
                      statusInfo.color === "success" ? "#4CAF50" :
                      statusInfo.color === "error" ? "#F44336" :
                      statusInfo.color === "warning" ? "#FF9800" : "#2196F3"
                    }`,
                    transition: "0.2s ease",
                    "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.12)" },
                  }}
                >
                  <Grid container spacing={2}>
                    {/* Header Row */}
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: "#3D4F23" }}>
                            {claim.clientName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {claim.id?.substring(0, 8)}... | Provider: {claim.providerName || "N/A"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                          <Typography variant="h6" fontWeight="bold" sx={{ color: "#556B2F" }}>
                            {claim.amount?.toFixed(2) || "0"} {CURRENCY.SYMBOL}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Grid>

                    {/* Details Row */}
                    <Grid item xs={12} md={8}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          <b>Diagnosis:</b> {claim.diagnosis || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <b>Treatment:</b> {claim.treatmentDetails || "N/A"}
                        </Typography>
                        {labTestName && <Typography variant="body2"><b>Test:</b> {labTestName}</Typography>}
                        {radiologyTestName && <Typography variant="body2"><b>Test:</b> {radiologyTestName}</Typography>}
                      </Stack>
                    </Grid>

                    {/* Dates Row */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          <EventIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                          Service: {claim.serviceDate || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                          Decision: {timeSince(claim.approvedAt || claim.rejectedAt)}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Rejection Reason */}
                    {claim.rejectionReason && (
                      <Grid item xs={12}>
                        <Box sx={{ bgcolor: "#FFEBEE", p: 1.5, borderRadius: 1, border: "1px solid #FFCDD2" }}>
                          <Typography variant="body2" color="error.dark">
                            <b>Rejection Reason:</b> {sanitizeString(claim.rejectionReason)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Actions */}
                    <Grid item xs={12}>
                      <Divider sx={{ mb: 1 }} />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => { setSelectedClaim(claim); setOpenFilesModal(true); }}
                        sx={{ textTransform: "none" }}
                      >
                        View Details
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })
          )}

          {/* PAGINATION */}
          {filteredClaims.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredClaims.length / rowsPerPage)}
                page={page + 1}
                onChange={(e, p) => handleChangePage(e, p - 1)}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    "&.Mui-selected": { bgcolor: "#556B2F", color: "#fff" },
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* DETAIL MODAL */}
      <Dialog open={openFilesModal} onClose={() => setOpenFilesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#556B2F", color: "#fff" }}>
          Claim Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedClaim && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Client Information</Typography>
                <Typography fontWeight="bold">{selectedClaim.clientName}</Typography>
                <Typography variant="body2">ID: {selectedClaim.id}</Typography>
                {selectedClaim.clientAge && <Typography variant="body2">Age: {selectedClaim.clientAge}</Typography>}
                {selectedClaim.clientGender && <Typography variant="body2">Gender: {selectedClaim.clientGender}</Typography>}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Provider Information</Typography>
                <Typography fontWeight="bold">{selectedClaim.providerName}</Typography>
                <Typography variant="body2">Role: {selectedClaim.providerRole}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">Medical Details</Typography>
                <Typography><b>Diagnosis:</b> {selectedClaim.diagnosis || "N/A"}</Typography>
                <Typography><b>Treatment:</b> {selectedClaim.treatmentDetails || "N/A"}</Typography>
                {selectedClaim.description && <Typography><b>Description:</b> {selectedClaim.description}</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={2}>
                  <Typography><b>Amount:</b> {selectedClaim.amount?.toFixed(2)} {CURRENCY.SYMBOL}</Typography>
                  <Typography><b>Service Date:</b> {selectedClaim.serviceDate}</Typography>
                  <Chip label={getStatusChip(selectedClaim.status).label} color={getStatusChip(selectedClaim.status).color} size="small" />
                </Stack>
              </Grid>
              {selectedClaim.rejectionReason && (
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: "#FFEBEE", p: 2, borderRadius: 1 }}>
                    <Typography color="error.dark"><b>Rejection Reason:</b> {sanitizeString(selectedClaim.rejectionReason)}</Typography>
                  </Box>
                </Grid>
              )}
              {selectedClaim.invoiceImagePath && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Attachment</Typography>
                  {selectedClaim.invoiceImagePath.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={selectedClaim.invoiceImagePath}
                      width="100%"
                      height="400"
                      style={{ border: "none", borderRadius: 8 }}
                      title="Invoice PDF"
                    />
                  ) : (
                    <img
                      src={selectedClaim.invoiceImagePath}
                      alt="invoice"
                      style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8 }}
                    />
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilesModal(false)}>{t("close", language)}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerMedicalDecisionsList;
