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
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import { motion } from "framer-motion";
import axios from "axios";

const UsageReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك إند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/reports/usage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("❌ Failed to load report:", err.response?.data || err.message);
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
          <Typography color="error">⚠️ Failed to load usage report.</Typography>
        </Box>
      </Box>
    );
  }

  // 🟢 تعريف الكروت
  const cards = [
    // Claims
    { title: "Total Claims", value: report.totalClaims, icon: <AssignmentIcon />, color: "linear-gradient(135deg,#00c6ff,#0072ff)" },
    { title: "Approved Claims", value: report.approvedClaims, icon: <CheckCircleIcon />, color: "linear-gradient(135deg,#56ab2f,#a8e063)" },
    { title: "Rejected Claims", value: report.rejectedClaims, icon: <CancelIcon />, color: "linear-gradient(135deg,#ff512f,#dd2476)" },
    { title: "Pending Claims", value: report.pendingClaims, icon: <PendingIcon />, color: "linear-gradient(135deg,#f7971e,#ffd200)" },

    // Prescriptions
    { title: "Total Prescriptions", value: report.totalPrescriptions, icon: <LocalPharmacyIcon />, color: "linear-gradient(135deg,#2193b0,#6dd5ed)" },
    { title: "Verified Prescriptions", value: report.verifiedPrescriptions, icon: <CheckCircleIcon />, color: "linear-gradient(135deg,#56ab2f,#a8e063)" },
    { title: "Rejected Prescriptions", value: report.rejectedPrescriptions, icon: <CancelIcon />, color: "linear-gradient(135deg,#ff512f,#dd2476)" },
    { title: "Pending Prescriptions", value: report.pendingPrescriptions, icon: <PendingIcon />, color: "linear-gradient(135deg,#f7971e,#ffd200)" },

    // Lab Requests
    { title: "Total Lab Requests", value: report.totalLabRequests, icon: <ScienceIcon />, color: "linear-gradient(135deg,#8e2de2,#4a00e0)" },
    { title: "Completed Lab Requests", value: report.completedLabRequests, icon: <CheckCircleIcon />, color: "linear-gradient(135deg,#56ab2f,#a8e063)" },
    { title: "Pending Lab Requests", value: report.pendingLabRequests, icon: <PendingIcon />, color: "linear-gradient(135deg,#f7971e,#ffd200)" },

    // Emergency Requests
    { title: "Total Emergency Requests", value: report.totalEmergencyRequests, icon: <LocalHospitalIcon />, color: "linear-gradient(135deg,#ff9966,#ff5e62)" },
    { title: "Approved Emergency Requests", value: report.approvedEmergencyRequests, icon: <CheckCircleIcon />, color: "linear-gradient(135deg,#56ab2f,#a8e063)" },
    { title: "Rejected Emergency Requests", value: report.rejectedEmergencyRequests, icon: <CancelIcon />, color: "linear-gradient(135deg,#ff512f,#dd2476)" },
    { title: "Pending Emergency Requests", value: report.pendingEmergencyRequests, icon: <PendingIcon />, color: "linear-gradient(135deg,#f7971e,#ffd200)" },

    // Medical Records
    { title: "Total Medical Records", value: report.totalMedicalRecords, icon: <DescriptionIcon />, color: "linear-gradient(135deg,#00b09b,#96c93d)" },
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
            Usage Report
          </Typography>

          {/* الشبكة */}
          <Grid container spacing={3}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                    <Typography variant="h4" fontWeight="bold">
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

export default UsageReport;
