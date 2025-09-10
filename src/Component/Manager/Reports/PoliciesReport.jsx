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
import axios from "axios";

const COLORS = ["#4CAF50", "#FF5252"];

const PoliciesReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك اند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/reports/policies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
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
            background: "linear-gradient(to bottom, #f9f9f9, #eef2f7)",
            minHeight: "100vh",
            marginLeft: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
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
            background: "linear-gradient(to bottom, #f9f9f9, #eef2f7)",
            minHeight: "100vh",
            marginLeft: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">⚠️ Failed to load policies report.</Typography>
        </Box>
      </Box>
    );
  }

  // Pie chart data
  const pieData = [
    { name: "Active Members", value: report.activeMembers },
    { name: "Inactive Members", value: report.inactiveMembers },
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
          background: "linear-gradient(to bottom, #f9f9f9, #eef2f7)",
          minHeight: "100vh",
          marginLeft: "240px",
        }}
      >
        <Header />
        <Box sx={{ p: 3 }}>
          {/* عنوان */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#120460",
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <DescriptionIcon sx={{ mr: 1, fontSize: 40, color: "#1E8EAB" }} />
            Policies Report
          </Typography>

          {/* البطاقات الرئيسية */}
          <Grid container spacing={3}>
            {[
              {
                title: "Total Members",
                value: report.totalMembers,
                icon: <PeopleIcon />,
                color: "linear-gradient(135deg,#00c6ff,#0072ff)",
              },
              {
                title: "Active Members",
                value: report.activeMembers,
                icon: <CheckCircleIcon />,
                color: "linear-gradient(135deg,#56ab2f,#a8e063)",
              },
              {
                title: "Inactive Members",
                value: report.inactiveMembers,
                icon: <CancelIcon />,
                color: "linear-gradient(135deg,#ff512f,#dd2476)",
              },
              {
                title: "Active Policies",
                value: report.activePolicies,
                icon: <PolicyIcon />,
                color: "linear-gradient(135deg,#2193b0,#6dd5ed)",
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
              <Paper sx={{ p: 3, borderRadius: 3, height: 350 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 2, color: "#120460" }}
                >
                  Active vs Inactive Members
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
              <Paper sx={{ p: 3, borderRadius: 3, height: 350 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 2, color: "#120460" }}
                >
                  Members per Policy
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barData}>
                    <XAxis dataKey="policy" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="members" fill="#1E8EAB" />
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
