import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import BarChartIcon from "@mui/icons-material/BarChart";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

// Category configurations
const CATEGORIES = {
  CLAIMS: {
    key: "claims",
    icon: <AssignmentIcon />,
    color: "#556B2F",
    bgColor: "#E8F5E9",
    labelKey: "claims",
  },
  PRESCRIPTIONS: {
    key: "prescriptions",
    icon: <LocalPharmacyIcon />,
    color: "#2196F3",
    bgColor: "#E3F2FD",
    labelKey: "prescriptions",
  },
  LAB_REQUESTS: {
    key: "labRequests",
    icon: <ScienceIcon />,
    color: "#9C27B0",
    bgColor: "#F3E5F5",
    labelKey: "labRequests",
  },
  EMERGENCY: {
    key: "emergency",
    icon: <LocalHospitalIcon />,
    color: "#F44336",
    bgColor: "#FFEBEE",
    labelKey: "emergencyRequests",
  },
  MEDICAL_RECORDS: {
    key: "medicalRecords",
    icon: <DescriptionIcon />,
    color: "#FF9800",
    bgColor: "#FFF3E0",
    labelKey: "medicalRecords",
  },
};

// Status configurations
const STATUS_CONFIG = {
  approved: { icon: <CheckCircleIcon />, color: "#4CAF50", label: "Approved" },
  rejected: { icon: <CancelIcon />, color: "#F44336", label: "Rejected" },
  pending: { icon: <PendingIcon />, color: "#FF9800", label: "Pending" },
  completed: { icon: <CheckCircleIcon />, color: "#4CAF50", label: "Completed" },
  verified: { icon: <CheckCircleIcon />, color: "#4CAF50", label: "Verified" },
};

// Stat Card Component - Fixed height for consistent sizing
const CARD_HEIGHT = 200;

const StatCard = ({ title, value, icon, color, bgColor, percentage, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    style={{ height: "100%" }}
  >
    <Card
      sx={{
        height: CARD_HEIGHT,
        minHeight: CARD_HEIGHT,
        maxHeight: CARD_HEIGHT,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: `1px solid ${bgColor}`,
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
            </Box>
            {trend !== undefined && (
              <Chip
                size="small"
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                label={`${trend > 0 ? "+" : ""}${trend}%`}
                sx={{
                  backgroundColor: trend >= 0 ? "#E8F5E9" : "#FFEBEE",
                  color: trend >= 0 ? "#2E7D32" : "#C62828",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
            {value?.toLocaleString() || 0}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, minHeight: 20 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ mt: "auto" }}>
          {percentage !== undefined ? (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  Progress
                </Typography>
                <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                  {percentage.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: bgColor,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ) : (
            <Box sx={{ height: 28 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

// Category Section Component
const CategorySection = ({ category, data, language }) => {
  const categoryConfig = CATEGORIES[category];
  if (!categoryConfig) return null;

  const getStats = () => {
    switch (category) {
      case "CLAIMS":
        return [
          { title: t("totalClaims", language), value: data.totalClaims, status: "total" },
          { title: t("approvedClaims", language), value: data.approvedClaims, status: "approved" },
          { title: t("rejectedClaims", language), value: data.rejectedClaims, status: "rejected" },
          { title: t("pendingClaimsTitle", language), value: data.pendingClaims, status: "pending" },
        ];
      case "PRESCRIPTIONS":
        return [
          { title: t("totalPrescriptions", language), value: data.totalPrescriptions, status: "total" },
          { title: t("verifiedPrescriptions", language), value: data.verifiedPrescriptions, status: "verified" },
          { title: t("rejectedPrescriptions", language), value: data.rejectedPrescriptions, status: "rejected" },
          { title: t("pendingPrescriptions", language), value: data.pendingPrescriptions, status: "pending" },
        ];
      case "LAB_REQUESTS":
        return [
          { title: t("totalLabRequests", language), value: data.totalLabRequests, status: "total" },
          { title: t("completedLabRequests", language), value: data.completedLabRequests, status: "completed" },
          { title: t("pendingLabRequests", language), value: data.pendingLabRequests, status: "pending" },
        ];
      case "EMERGENCY":
        return [
          { title: t("totalEmergencyRequests", language), value: data.totalEmergencyRequests, status: "total" },
          { title: t("approvedEmergencyRequests", language), value: data.approvedEmergencyRequests, status: "approved" },
          { title: t("rejectedEmergencyRequests", language), value: data.rejectedEmergencyRequests, status: "rejected" },
          { title: t("pendingEmergencyRequests", language), value: data.pendingEmergencyRequests, status: "pending" },
        ];
      case "MEDICAL_RECORDS":
        return [
          { title: t("totalMedicalRecords", language), value: data.totalMedicalRecords, status: "total" },
        ];
      default:
        return [];
    }
  };

  const stats = getStats();
  const total = stats.find((s) => s.status === "total")?.value || 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: categoryConfig.bgColor,
            display: "flex",
            alignItems: "center",
          }}
        >
          {React.cloneElement(categoryConfig.icon, { sx: { color: categoryConfig.color, fontSize: 24 } })}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
          {t(categoryConfig.labelKey, language)}
        </Typography>
        <Chip
          size="small"
          label={`${total} ${t("total", language)}`}
          sx={{
            backgroundColor: categoryConfig.bgColor,
            color: categoryConfig.color,
            fontWeight: 600,
          }}
        />
      </Box>
      <Grid container spacing={2}>
        {stats.map((stat, index) => {
          const statusConfig = STATUS_CONFIG[stat.status] || {
            icon: <BarChartIcon />,
            color: categoryConfig.color,
          };
          const percentage = total > 0 && stat.status !== "total" ? (stat.value / total) * 100 : undefined;

          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.status === "total" ? categoryConfig.icon : statusConfig.icon}
                color={stat.status === "total" ? categoryConfig.color : statusConfig.color}
                bgColor={stat.status === "total" ? categoryConfig.bgColor : `${statusConfig.color}15`}
                percentage={percentage}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

// Summary Card Component
const SummaryCard = ({ report, language }) => {
  const summaryData = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: t("totalClaims", language),
        value: report.totalClaims || 0,
        icon: <AssignmentIcon />,
        color: "#556B2F",
      },
      {
        label: t("totalPrescriptions", language),
        value: report.totalPrescriptions || 0,
        icon: <LocalPharmacyIcon />,
        color: "#2196F3",
      },
      {
        label: t("totalLabRequests", language),
        value: report.totalLabRequests || 0,
        icon: <ScienceIcon />,
        color: "#9C27B0",
      },
      {
        label: t("totalEmergencyRequests", language),
        value: report.totalEmergencyRequests || 0,
        icon: <LocalHospitalIcon />,
        color: "#F44336",
      },
      {
        label: t("totalMedicalRecords", language),
        value: report.totalMedicalRecords || 0,
        icon: <DescriptionIcon />,
        color: "#FF9800",
      },
    ];
  }, [report, language]);

  const totalAll = summaryData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        background: "linear-gradient(135deg, #556B2F 0%, #3D4F23 100%)",
        color: "#fff",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t("systemOverview", language) || "System Overview"}
      </Typography>
      <Grid container spacing={3}>
        {summaryData.map((item, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  mb: 1,
                }}
              >
                {React.cloneElement(item.icon, { sx: { fontSize: 28 } })}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {item.value.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: "0.8rem" }}>
                {item.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          {t("totalSystemActivities", language) || "Total System Activities"}:
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {totalAll.toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

const UsageReport = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { language, isRTL } = useLanguage();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch data
  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.REPORTS.USAGE);
      setReport(res || {});
    } catch (err) {
      console.error("Failed to load report:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Tab categories
  const tabCategories = [
    { key: "all", labelKey: "all" },
    { key: "CLAIMS", labelKey: "claims" },
    { key: "PRESCRIPTIONS", labelKey: "prescriptions" },
    { key: "LAB_REQUESTS", labelKey: "labRequests" },
    { key: "EMERGENCY", labelKey: "emergencyRequests" },
    { key: "MEDICAL_RECORDS", labelKey: "medicalRecords" },
  ];

  // Filter categories based on tab
  const filteredCategories = useMemo(() => {
    if (activeTab === 0) {
      return Object.keys(CATEGORIES);
    }
    return [tabCategories[activeTab].key];
  }, [activeTab]);

  // Calculate sidebar margin based on screen size
  const sidebarMargin = isMobile ? 0 : isTablet ? "72px" : "240px";

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
            minHeight: "100vh",
            marginLeft: sidebarMargin,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: isMobile ? "56px" : 0,
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
            background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
            minHeight: "100vh",
            marginLeft: sidebarMargin,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pt: isMobile ? "56px" : 0,
          }}
        >
          <Typography color="error">{t("failedToLoadUsageReport", language)}</Typography>
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
          background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
          minHeight: "100vh",
          marginLeft: sidebarMargin,
          transition: "margin-left 0.3s ease",
          pt: isMobile ? "56px" : 0,
        }}
      >
        <Header />
        <Box sx={{ p: { xs: 2, sm: 3 } }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Title and Actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <BarChartIcon sx={{ fontSize: 32, color: "#556B2F" }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#3D4F23" }}>
                {t("usageReport", language)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title={t("refresh", language) || "Refresh"}>
                <IconButton
                  onClick={fetchReport}
                  sx={{
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <RefreshIcon sx={{ color: "#556B2F" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Summary Overview */}
          <SummaryCard report={report} language={language} />

          {/* Filters and Tabs */}
          <Paper
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                p: 2,
                backgroundColor: "#fff",
                borderBottom: "1px solid #eee",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 500,
                    minHeight: 48,
                  },
                  "& .Mui-selected": {
                    color: "#556B2F !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#556B2F",
                  },
                }}
              >
                {tabCategories.map((tab, index) => (
                  <Tab
                    key={tab.key}
                    label={t(tab.labelKey, language)}
                    icon={index === 0 ? <FilterListIcon /> : CATEGORIES[tab.key]?.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>{t("status", language)}</InputLabel>
                  <Select
                    value={statusFilter}
                    label={t("status", language)}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">{t("all", language)}</MenuItem>
                    <MenuItem value="approved">{t("approved", language)}</MenuItem>
                    <MenuItem value="pending">{t("pending", language)}</MenuItem>
                    <MenuItem value="rejected">{t("rejected", language)}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Paper>

          {/* Category Sections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredCategories.map((category) => (
                <CategorySection key={category} category={category} data={report} language={language} />
              ))}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default UsageReport;
