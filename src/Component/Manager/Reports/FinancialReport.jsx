import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TuneIcon from "@mui/icons-material/Tune";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PieChartIcon from "@mui/icons-material/PieChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

// Category configuration with icons and colors (matching backend RoleName enum)
const EXPENSE_CATEGORIES = {
  DOCTOR: {
    icon: <LocalHospitalIcon />,
    color: "#4CAF50",
    bgColor: "#E8F5E9",
    label: "Doctor Consultations"
  },
  PHARMACIST: {
    icon: <MedicationIcon />,
    color: "#2196F3",
    bgColor: "#E3F2FD",
    label: "Pharmacy"
  },
  LAB_TECH: {
    icon: <BiotechIcon />,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    label: "Lab Tests"
  },
  RADIOLOGIST: {
    icon: <MonitorHeartIcon />,
    color: "#FF9800",
    bgColor: "#FFF3E0",
    label: "Radiology"
  },
};

const FinancialReport = () => {
  const { language, isRTL } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("amountDesc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountRange, setAmountRange] = useState([0, 50000]);
  const [maxAmount, setMaxAmount] = useState(50000);
  const [activeTab, setActiveTab] = useState(0);

  // Provider Detail Dialog States
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerExpenses, setProviderExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseDateFrom, setExpenseDateFrom] = useState("");
  const [expenseDateTo, setExpenseDateTo] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expensePage, setExpensePage] = useState(0);
  const [expenseRowsPerPage, setExpenseRowsPerPage] = useState(10);

  // Category options for filter (matching backend RoleName enum)
  const categoryOptions = useMemo(() => [
    { value: "all", label: t("allCategories", language) || "All Categories" },
    { value: "DOCTOR", label: t("doctorConsultations", language) || "Doctor Consultations" },
    { value: "PHARMACIST", label: t("pharmacy", language) || "Pharmacy" },
    { value: "LAB_TECH", label: t("labTests", language) || "Lab Tests" },
    { value: "RADIOLOGIST", label: t("radiology", language) || "Radiology" },
  ], [language]);

  // Sort options
  const sortOptions = useMemo(() => [
    { value: "amountDesc", label: t("highestAmount", language) || "Highest Amount" },
    { value: "amountAsc", label: t("lowestAmount", language) || "Lowest Amount" },
    { value: "nameAsc", label: t("nameAZ", language) || "Name (A-Z)" },
    { value: "nameDesc", label: t("nameZA", language) || "Name (Z-A)" },
  ], [language]);

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API_ENDPOINTS.REPORTS.FINANCIAL);
      setReport(res || {});

      // Calculate max amount for slider
      if (res?.topProviders?.length > 0) {
        const max = Math.max(...res.topProviders.map(p => p.totalAmount || 0));
        const roundedMax = Math.ceil(max / 1000) * 1000 || 50000;
        setMaxAmount(roundedMax);
        setAmountRange([0, roundedMax]);
      }
    } catch (err) {
      console.error("Failed to fetch financial report:", err.response?.data || err.message);
      setError(t("failedToLoadFinancialReport", language));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Fetch provider expenses
  const fetchProviderExpenses = useCallback(async (providerId) => {
    setExpensesLoading(true);
    try {
      let url = API_ENDPOINTS.REPORTS.PROVIDER_EXPENSES(providerId);
      const params = new URLSearchParams();
      if (expenseDateFrom) params.append("fromDate", expenseDateFrom);
      if (expenseDateTo) params.append("toDate", expenseDateTo);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      setProviderExpenses(res || []);
    } catch (err) {
      console.error("Failed to fetch provider expenses:", err);
      setProviderExpenses([]);
    } finally {
      setExpensesLoading(false);
    }
  }, [expenseDateFrom, expenseDateTo]);

  // Handle provider click
  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    setDetailDialogOpen(true);
    setExpenseDateFrom("");
    setExpenseDateTo("");
    setExpenseSearch("");
    setExpensePage(0);
    fetchProviderExpenses(provider.providerId);
  };

  // Handle expense filter apply
  const handleApplyExpenseFilter = () => {
    if (selectedProvider) {
      fetchProviderExpenses(selectedProvider.providerId);
    }
  };

  // Handle clear expense filters
  const handleClearExpenseFilters = () => {
    setExpenseDateFrom("");
    setExpenseDateTo("");
    setExpenseSearch("");
    if (selectedProvider) {
      fetchProviderExpenses(selectedProvider.providerId);
    }
  };

  // Filter expenses by search
  const filteredExpenses = useMemo(() => {
    if (!expenseSearch) return providerExpenses;
    const query = expenseSearch.toLowerCase();
    return providerExpenses.filter(exp =>
      exp.clientName?.toLowerCase().includes(query) ||
      exp.description?.toLowerCase().includes(query) ||
      exp.diagnosis?.toLowerCase().includes(query)
    );
  }, [providerExpenses, expenseSearch]);

  // Paginated expenses
  const paginatedExpenses = useMemo(() => {
    const start = expensePage * expenseRowsPerPage;
    return filteredExpenses.slice(start, start + expenseRowsPerPage);
  }, [filteredExpenses, expensePage, expenseRowsPerPage]);

  // Calculate expense totals
  const expenseTotals = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const insuranceCovered = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.insuranceCoveredAmount) || 0), 0);
    const clientPay = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.clientPayAmount) || 0), 0);
    return { total, insuranceCovered, clientPay, count: filteredExpenses.length };
  }, [filteredExpenses]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("amountDesc");
    setDateFrom("");
    setDateTo("");
    setAmountRange([0, maxAmount]);
  }, [maxAmount]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== "" ||
      categoryFilter !== "all" ||
      sortBy !== "amountDesc" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      amountRange[0] !== 0 ||
      amountRange[1] !== maxAmount
    );
  }, [searchQuery, categoryFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (categoryFilter !== "all") count++;
    if (sortBy !== "amountDesc") count++;
    if (dateFrom || dateTo) count++;
    if (amountRange[0] !== 0 || amountRange[1] !== maxAmount) count++;
    return count;
  }, [searchQuery, categoryFilter, sortBy, dateFrom, dateTo, amountRange, maxAmount]);

  // Filter and sort providers (providerType comes from backend)
  const filteredProviders = useMemo(() => {
    if (!report?.topProviders) return [];

    return report.topProviders
      .filter(provider => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (!provider.providerName?.toLowerCase().includes(query)) {
            return false;
          }
        }

        // Category filter (using providerType from backend)
        if (categoryFilter !== "all" && provider.providerType !== categoryFilter) {
          return false;
        }

        // Amount range filter
        if (provider.totalAmount < amountRange[0] || provider.totalAmount > amountRange[1]) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "amountAsc":
            return (a.totalAmount || 0) - (b.totalAmount || 0);
          case "amountDesc":
            return (b.totalAmount || 0) - (a.totalAmount || 0);
          case "nameAsc":
            return (a.providerName || "").localeCompare(b.providerName || "");
          case "nameDesc":
            return (b.providerName || "").localeCompare(a.providerName || "");
          default:
            return 0;
        }
      });
  }, [report?.topProviders, searchQuery, categoryFilter, amountRange, sortBy]);

  // Calculate category breakdown (using providerType from backend)
  const categoryBreakdown = useMemo(() => {
    if (!report?.topProviders) return {};

    const breakdown = {};
    report.topProviders.forEach(provider => {
      const category = provider.providerType || "OTHER";
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, total: 0, providers: [] };
      }
      breakdown[category].count++;
      breakdown[category].total += provider.totalAmount || 0;
      breakdown[category].providers.push(provider);
    });

    return breakdown;
  }, [report?.topProviders]);

  // Calculate filtered totals
  const filteredTotals = useMemo(() => {
    const total = filteredProviders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    return {
      total,
      count: filteredProviders.length,
      average: filteredProviders.length > 0 ? total / filteredProviders.length : 0,
    };
  }, [filteredProviders]);

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#FAF8F5",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
            marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
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

  if (error || !report) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#FAF8F5",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
            marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">{error}</Typography>
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
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
        }}
      >
        <Header />
        <Box sx={{ p: 3 }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: "#3D4F23", display: "flex", alignItems: "center" }}
              >
                <MonetizationOnIcon sx={{ mr: 1, fontSize: 40, color: "#556B2F" }} />
                {t("financialReport", language)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("financialReportDescription", language) || "Comprehensive financial overview and expense analysis"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={t("refresh", language) || "Refresh"}>
                <IconButton onClick={fetchReport} sx={{ color: "#556B2F" }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Total Expenses */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #556B2F, #7B8B5E)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <AccountBalanceIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {t("totalExpenses", language)}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${report.totalExpenses?.toLocaleString() || 0}
                </Typography>
              </Paper>
            </Grid>

            {/* Top Providers Total */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #8B9A46, #A8B56B)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {t("topProvidersTotal", language)}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${report.topProviders?.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toLocaleString() || 0}
                </Typography>
              </Paper>
            </Grid>

            {/* Provider Count */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #3D4F23, #556B2F)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <BusinessIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {t("totalProviders", language) || "Total Providers"}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {report.topProviders?.length || 0}
                </Typography>
              </Paper>
            </Grid>

            {/* Average per Provider */}
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #7B8B5E, #8B9A46)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <PieChartIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  {t("averagePerProvider", language) || "Avg per Provider"}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${report.topProviders?.length > 0
                    ? Math.round(report.topProviders.reduce((sum, p) => sum + (p.totalAmount || 0), 0) / report.topProviders.length).toLocaleString()
                    : 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Category Breakdown Cards */}
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#3D4F23", mb: 2, display: "flex", alignItems: "center" }}>
            <CategoryIcon sx={{ mr: 1, color: "#556B2F" }} />
            {t("expensesByCategory", language) || "Expenses by Category"}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, config]) => {
              const data = categoryBreakdown[key] || { count: 0, total: 0 };
              const percentage = report.totalExpenses > 0
                ? ((data.total / report.totalExpenses) * 100).toFixed(1)
                : 0;

              return (
                <Grid item xs={12} sm={6} md={2.4} key={key}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      backgroundColor: config.bgColor,
                      border: `2px solid ${categoryFilter === key ? config.color : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${config.color}40`,
                      },
                    }}
                    onClick={() => setCategoryFilter(categoryFilter === key ? "all" : key)}
                  >
                    <CardContent sx={{ textAlign: "center", py: 2 }}>
                      <Box sx={{ color: config.color, mb: 1 }}>
                        {React.cloneElement(config.icon, { sx: { fontSize: 32 } })}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "#555" }}>
                        {t(key.toLowerCase(), language) || config.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: config.color }}>
                        ${data.total.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 1 }}>
                        <Chip
                          label={`${data.count} ${t("providers", language) || "providers"}`}
                          size="small"
                          sx={{ backgroundColor: `${config.color}20`, color: config.color }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(percentage)}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: `${config.color}20`,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: config.color,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "#777" }}>
                        {percentage}% {t("ofTotal", language) || "of total"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Search and Filter Bar */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "#fff" }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t("searchProviders", language) || "Search providers..."}
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

              {/* Category Filter */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("category", language) || "Category"}</InputLabel>
                  <Select
                    value={categoryFilter}
                    label={t("category", language) || "Category"}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t("sortBy", language) || "Sort By"}</InputLabel>
                  <Select
                    value={sortBy}
                    label={t("sortBy", language) || "Sort By"}
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
              <Grid item xs={12} md={2}>
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
                  {t("filters", language) || "Filters"}
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters Panel */}
            <Collapse in={showFilters}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* Amount Range */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                    <AttachMoneyIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t("amountRange", language) || "Amount Range"}: ${amountRange[0].toLocaleString()} - ${amountRange[1].toLocaleString()}
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={amountRange}
                      onChange={(e, newValue) => setAmountRange(newValue)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                      min={0}
                      max={maxAmount}
                      step={1000}
                      sx={{
                        color: "#556B2F",
                        "& .MuiSlider-thumb": {
                          backgroundColor: "#556B2F",
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Date Range (if applicable) */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "#556B2F", display: "flex", alignItems: "center" }}>
                    <DateRangeIcon sx={{ mr: 1, fontSize: 18 }} />
                    {t("dateRange", language) || "Date Range"}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      type="date"
                      size="small"
                      label={t("from", language) || "From"}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      type="date"
                      size="small"
                      label={t("to", language) || "To"}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Stack>
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
                      {t("clearFilters", language) || "Clear All Filters"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

          {/* Filtered Results Info */}
          {hasActiveFilters && (
            <Paper sx={{ p: 1.5, mb: 2, backgroundColor: "#E8EDE0" }}>
              <Typography variant="body2" sx={{ color: "#3D4F23" }}>
                <FilterListIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                {t("showingFilteredResults", language) || "Showing filtered results"}: {filteredTotals.count} {t("providers", language) || "providers"} |
                {t("total", language) || "Total"}: ${filteredTotals.total.toLocaleString()} |
                {t("average", language) || "Average"}: ${Math.round(filteredTotals.average).toLocaleString()}
              </Typography>
            </Paper>
          )}

          {/* Providers Breakdown */}
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ color: "#3D4F23", mb: 2, display: "flex", alignItems: "center" }}
          >
            <LocalHospitalIcon sx={{ mr: 1, color: "#556B2F" }} />
            {t("providersBreakdown", language)}
            <Chip
              label={filteredProviders.length}
              size="small"
              sx={{ ml: 1, backgroundColor: "#556B2F", color: "#fff" }}
            />
          </Typography>

          {/* View Toggle Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': { color: '#556B2F' },
                '& .Mui-selected': { color: '#3D4F23' },
                '& .MuiTabs-indicator': { backgroundColor: '#556B2F' },
              }}
            >
              <Tab icon={<BarChartIcon />} label={t("cards", language) || "Cards"} iconPosition="start" />
              <Tab icon={<ReceiptLongIcon />} label={t("table", language) || "Table"} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Cards View */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {filteredProviders.length > 0 ? (
                filteredProviders.map((provider, index) => {
                  const categoryConfig = EXPENSE_CATEGORIES[provider.providerType] || EXPENSE_CATEGORIES.DOCTOR;
                  return (
                    <Grid item xs={12} md={4} key={index}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                          backgroundColor: "#F5F5DC",
                          borderLeft: `4px solid ${categoryConfig.color}`,
                          transition: 'transform 0.2s',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                          },
                        }}
                        onClick={() => handleProviderClick(provider)}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                              {provider.providerName}
                            </Typography>
                            <Chip
                              icon={React.cloneElement(categoryConfig.icon, { sx: { fontSize: 16 } })}
                              label={t(provider.providerType?.toLowerCase(), language) || categoryConfig.label}
                              size="small"
                              sx={{
                                backgroundColor: categoryConfig.bgColor,
                                color: categoryConfig.color,
                                '& .MuiChip-icon': { color: categoryConfig.color },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="h4"
                            sx={{ color: "#556B2F", fontWeight: "bold", mt: 2 }}
                          >
                            ${provider.totalAmount?.toLocaleString() || 0}
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                            <Chip
                              label={`${provider.claimCount || 0} claims`}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: "#556B2F", color: "#556B2F" }}
                            />
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: "#556B2F" }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((provider.totalAmount / maxAmount) * 100, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#E0E0E0",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: categoryConfig.color,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              {((provider.totalAmount / (report.totalExpenses || 1)) * 100).toFixed(1)}% {t("ofTotalExpenses", language) || "of total expenses"}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#F5F5DC" }}>
                    <Typography color="text.secondary">
                      {t("noProvidersFound", language) || "No providers found matching your criteria"}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}

          {/* Table View */}
          {activeTab === 1 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#E8EDE0" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("provider", language) || "Provider"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("category", language) || "Category"}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("claims", language) || "Claims"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("amount", language) || "Amount"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("percentage", language) || "Percentage"}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#3D4F23" }}>
                      {t("actions", language) || "Actions"}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((provider, index) => {
                      const categoryConfig = EXPENSE_CATEGORIES[provider.providerType] || EXPENSE_CATEGORIES.DOCTOR;
                      const percentage = ((provider.totalAmount / (report.totalExpenses || 1)) * 100).toFixed(1);

                      return (
                        <TableRow
                          key={index}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleProviderClick(provider)}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <BusinessIcon sx={{ mr: 1, color: "#556B2F", fontSize: 20 }} />
                              {provider.providerName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={React.cloneElement(categoryConfig.icon, { sx: { fontSize: 14 } })}
                              label={t(provider.providerType?.toLowerCase(), language) || categoryConfig.label}
                              size="small"
                              sx={{
                                backgroundColor: categoryConfig.bgColor,
                                color: categoryConfig.color,
                                '& .MuiChip-icon': { color: categoryConfig.color },
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={provider.claimCount || 0}
                              size="small"
                              variant="outlined"
                              sx={{ borderColor: "#556B2F", color: "#556B2F" }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" color="#556B2F">
                              ${provider.totalAmount?.toLocaleString() || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(percentage)}
                                sx={{
                                  width: 60,
                                  height: 6,
                                  borderRadius: 3,
                                  mr: 1,
                                  backgroundColor: "#E0E0E0",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: categoryConfig.color,
                                  },
                                }}
                              />
                              {percentage}%
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton size="small" sx={{ color: "#556B2F" }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {t("noProvidersFound", language) || "No providers found matching your criteria"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Provider Expenses Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#556B2F", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {selectedProvider && EXPENSE_CATEGORIES[selectedProvider.providerType] && (
              React.cloneElement(EXPENSE_CATEGORIES[selectedProvider.providerType].icon, { sx: { mr: 1 } })
            )}
            {selectedProvider?.providerName} - {language === "ar" ? "تفاصيل المصاريف" : "Expense Details"}
          </Box>
          <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#E8F5E9" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {language === "ar" ? "إجمالي المطالبات" : "Total Claims"}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#4CAF50">
                  {expenseTotals.count}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#E3F2FD" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {language === "ar" ? "إجمالي المبلغ" : "Total Amount"}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#2196F3">
                  ${expenseTotals.total.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#FFF3E0" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {language === "ar" ? "تغطية التأمين" : "Insurance Covered"}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#FF9800">
                  ${expenseTotals.insuranceCovered.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Paper sx={{ p: 2, textAlign: "center", backgroundColor: "#FCE4EC" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {language === "ar" ? "دفع العميل" : "Client Pay"}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#E91E63">
                  ${expenseTotals.clientPay.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "#F5F5F5" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label={language === "ar" ? "بحث" : "Search"}
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={language === "ar" ? "من تاريخ" : "From Date"}
                  value={expenseDateFrom}
                  onChange={(e) => setExpenseDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={language === "ar" ? "إلى تاريخ" : "To Date"}
                  value={expenseDateTo}
                  onChange={(e) => setExpenseDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={handleApplyExpenseFilter}
                    sx={{ backgroundColor: "#556B2F", "&:hover": { backgroundColor: "#3D4F23" } }}
                  >
                    {language === "ar" ? "تطبيق" : "Apply"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearExpenseFilters}
                    sx={{ borderColor: "#556B2F", color: "#556B2F" }}
                  >
                    {language === "ar" ? "مسح" : "Clear"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Expenses Table */}
          {expensesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#E8EDE0" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {language === "ar" ? "تاريخ الخدمة" : "Service Date"}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {language === "ar" ? "العميل" : "Client"}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {language === "ar" ? "الوصف" : "Description"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {language === "ar" ? "التشخيص" : "Diagnosis"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {language === "ar" ? "المبلغ" : "Amount"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {language === "ar" ? "التأمين" : "Insurance"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {language === "ar" ? "العميل" : "Client"}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedExpenses.length > 0 ? (
                      paginatedExpenses.map((expense, index) => (
                        <TableRow key={expense.id || index} hover>
                          <TableCell>
                            {expense.serviceDate ? new Date(expense.serviceDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>{expense.clientName || "-"}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <Tooltip title={expense.description || ""}>
                              <span>{expense.description || "-"}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <Tooltip title={expense.diagnosis || ""}>
                              <span>{expense.diagnosis || "-"}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" color="#556B2F">
                              ${expense.amount?.toLocaleString() || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="#4CAF50">
                              ${parseFloat(expense.insuranceCoveredAmount || 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="#E91E63">
                              ${parseFloat(expense.clientPayAmount || 0).toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            {language === "ar" ? "لا توجد مصاريف" : "No expenses found"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredExpenses.length}
                page={expensePage}
                onPageChange={(e, newPage) => setExpensePage(newPage)}
                rowsPerPage={expenseRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setExpenseRowsPerPage(parseInt(e.target.value, 10));
                  setExpensePage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage={language === "ar" ? "صفوف لكل صفحة:" : "Rows per page:"}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDetailDialogOpen(false)}
            variant="contained"
            sx={{ backgroundColor: "#556B2F", "&:hover": { backgroundColor: "#3D4F23" } }}
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialReport;
