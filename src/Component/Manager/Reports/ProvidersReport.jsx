import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import PeopleIcon from "@mui/icons-material/People";
import { motion } from "framer-motion";
import axios from "axios";

const ProvidersReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ جلب البيانات من الباك إند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/reports/providers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch providers report:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">⚠️ Failed to load Providers Report</Typography>
      </Box>
    );
  }

  const cards = [
    {
      title: "Total Providers",
      value: report.totalProviders,
      icon: <PeopleIcon />,
      color: "linear-gradient(135deg, #00c6ff, #0072ff)",
    },
    {
      title: "Doctors",
      value: report.doctorsCount,
      icon: <LocalHospitalIcon />,
      color: "linear-gradient(135deg, #56ab2f, #a8e063)",
    },
    {
      title: "Pharmacies",
      value: report.pharmaciesCount,
      icon: <LocalPharmacyIcon />,
      color: "linear-gradient(135deg, #ff512f, #dd2476)",
    },
    {
      title: "Labs",
      value: report.labsCount,
      icon: <ScienceIcon />,
      color: "linear-gradient(135deg, #2193b0, #6dd5ed)",
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
            Providers Report
          </Typography>

          {/* كروت الأرقام */}
          <Grid container spacing={3}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
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
                    <Typography variant="h4" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* التفاصيل */}
          <Box sx={{ mt: 5 }}>
            <Grid container spacing={3}>
              {/* Doctors */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#2c3e50" }}>
                      Doctors
                    </Typography>
                    <List>
                      {report.doctors.map((doctor, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <LocalHospitalIcon sx={{ color: "#56ab2f" }} />
                          </ListItemIcon>
                          <ListItemText primary={doctor} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pharmacies */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#2c3e50" }}>
                      Pharmacies
                    </Typography>
                    <List>
                      {report.pharmacies.map((pharmacy, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <LocalPharmacyIcon sx={{ color: "#ff512f" }} />
                          </ListItemIcon>
                          <ListItemText primary={pharmacy} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Labs */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#2c3e50" }}>
                      Labs
                    </Typography>
                    <List>
                      {report.labs.map((lab, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <ScienceIcon sx={{ color: "#2193b0" }} />
                          </ListItemIcon>
                          <ListItemText primary={lab} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProvidersReport;
