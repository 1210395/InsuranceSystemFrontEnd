import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PolicyIcon from "@mui/icons-material/Policy";
import PeopleIcon from "@mui/icons-material/People";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const COLORS = ["#556B2F", "#7B8B5E"];

const PoliciesReport = () => {
  const { language, isRTL } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك اند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.REPORTS.POLICIES);
        setReport(res || {});
      } catch (err) {
        console.error("❌ Failed to load policies report:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
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

  if (!report) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
            marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">{t("failedToLoadPoliciesReport", language)}</Typography>
        </Box>
      </Box>
    );
  }

  // Pie chart data
  const pieData = [
    { name: t("activeMembers", language), value: report.activeMembers },
    { name: t("inactiveMembers", language), value: report.inactiveMembers },
  ];

  // Bar chart data
  const barData = Object.entries(report.membersPerPolicy).map(
    ([policy, count]) => ({
      policy,
      members: count,
    })
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          background: "linear-gradient(to bottom, #FAF8F5, #E8EDE0)",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
        }}
      >
        <Header />
        <Box sx={{ p: 3 }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Title */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#3D4F23",
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <DescriptionIcon sx={{ mr: 1, fontSize: 40, color: "#556B2F" }} />
            {t("policiesReportTitle", language)}
          </Typography>

          {/* Main Cards */}
          <Grid container spacing={3}>
            {[
              {
                title: t("totalMembers", language),
                value: report.totalMembers,
                icon: <PeopleIcon />,
                color: "linear-gradient(135deg,#556B2F,#7B8B5E)",
              },
              {
                title: t("activeMembers", language),
                value: report.activeMembers,
                icon: <CheckCircleIcon />,
                color: "linear-gradient(135deg,#8B9A46,#A8B56B)",
              },
              {
                title: t("inactiveMembers", language),
                value: report.inactiveMembers,
                icon: <CancelIcon />,
                color: "linear-gradient(135deg,#3D4F23,#556B2F)",
              },
              {
                title: t("activePolicies", language),
                value: report.activePolicies,
                icon: <PolicyIcon />,
                color: "linear-gradient(135deg,#7B8B5E,#8B9A46)",
              },
            ].map((card, index) => (
              <Grid item xs={12} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      textAlign: "center",
                      background: card.color,
                      color: "#fff",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.05)",
                        transition: "0.3s",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      {card.icon} &nbsp; {card.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={4} sx={{ mt: 5 }}>
            {/* Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: 350, backgroundColor: "#F5F5DC" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 2, color: "#3D4F23" }}
                >
                  {t("activeVsInactiveMembers", language)}
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, height: 350, backgroundColor: "#F5F5DC" }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 2, color: "#3D4F23" }}
                >
                  {t("membersPerPolicy", language)}
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barData}>
                    <XAxis dataKey="policy" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="members" fill="#556B2F" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default PoliciesReport;
