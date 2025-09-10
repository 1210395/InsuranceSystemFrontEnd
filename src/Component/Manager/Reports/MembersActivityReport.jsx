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
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import { motion } from "framer-motion";
import axios from "axios";

const MembersActivityReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك اند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/reports/members-activity",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReport(res.data);
      } catch (err) {
        console.error(
          "❌ Failed to load members activity report:",
          err.response?.data || err.message
        );
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
            background: "#f4f6f9",
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
            background: "#f4f6f9",
            minHeight: "100vh",
            marginLeft: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">
            ⚠️ Failed to load members activity report.
          </Typography>
        </Box>
      </Box>
    );
  }

  // 🟢 الكروت
  const cards = [
    {
      title: "Total Members",
      value: report.totalMembers,
      icon: <PeopleIcon />,
      color: "linear-gradient(135deg, #00c6ff, #0072ff)",
    },
    {
      title: "Members with Claims",
      value: report.membersWithClaims,
      icon: <AssignmentIcon />,
      color: "linear-gradient(135deg, #56ab2f, #a8e063)",
    },
    {
      title: "Members with Prescriptions",
      value: report.membersWithPrescriptions,
      icon: <LocalPharmacyIcon />,
      color: "linear-gradient(135deg, #ff512f, #dd2476)",
    },
    {
      title: "Members with Lab Requests",
      value: report.membersWithLabRequests,
      icon: <ScienceIcon />,
      color: "linear-gradient(135deg, #2193b0, #6dd5ed)",
    },
    {
      title: "Members with Emergency Requests",
      value: report.membersWithEmergencyRequests,
      icon: <LocalHospitalIcon />,
      color: "linear-gradient(135deg, #ff9966, #ff5e62)",
    },
    {
      title: "Members with Medical Records",
      value: report.membersWithMedicalRecords,
      icon: <DescriptionIcon />,
      color: "linear-gradient(135deg, #8e2de2, #4a00e0)",
    },
  ];

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
          {/* العنوان */}
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
            Members Activity Report
          </Typography>

          {/* البطاقات */}
          <Grid container spacing={3}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
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
                      {card.icon}&nbsp; {card.title}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MembersActivityReport;
