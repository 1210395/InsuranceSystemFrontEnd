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
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ProvidersReport = () => {
  const { language, isRTL } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ جلب البيانات من الباك إند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.REPORTS.PROVIDERS);
        setReport(res || {});
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#FAF8F5" }}>
        <CircularProgress sx={{ color: "#556B2F" }} />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 3, backgroundColor: "#FAF8F5" }}>
        <Typography color="error">{t("failedToLoadProvidersReport", language)}</Typography>
      </Box>
    );
  }

  const cards = [
    {
      title: t("totalProviders", language),
      value: report.totalProviders,
      icon: <PeopleIcon />,
      color: "linear-gradient(135deg, #556B2F, #7B8B5E)",
    },
    {
      title: t("doctors", language),
      value: report.doctorsCount,
      icon: <LocalHospitalIcon />,
      color: "linear-gradient(135deg, #8B9A46, #A8B56B)",
    },
    {
      title: t("pharmacies", language),
      value: report.pharmaciesCount,
      icon: <LocalPharmacyIcon />,
      color: "linear-gradient(135deg, #3D4F23, #556B2F)",
    },
    {
      title: t("labs", language),
      value: report.labsCount,
      icon: <ScienceIcon />,
      color: "linear-gradient(135deg, #7B8B5E, #8B9A46)",
    },
  ];

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
            {t("providersReportTitle", language)}
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

          {/* Details */}
          <Box sx={{ mt: 5 }}>
            <Grid container spacing={3}>
              {/* Doctors */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)", backgroundColor: "#F5F5DC" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#3D4F23" }}>
                      {t("doctors", language)}
                    </Typography>
                    <List>
                      {report.doctors.map((doctor, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <LocalHospitalIcon sx={{ color: "#556B2F" }} />
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
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)", backgroundColor: "#F5F5DC" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#3D4F23" }}>
                      {t("pharmacies", language)}
                    </Typography>
                    <List>
                      {report.pharmacies.map((pharmacy, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <LocalPharmacyIcon sx={{ color: "#8B9A46" }} />
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
                <Card sx={{ borderRadius: 3, boxShadow: "0 6px 15px rgba(0,0,0,0.1)", backgroundColor: "#F5F5DC" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#3D4F23" }}>
                      {t("labs", language)}
                    </Typography>
                    <List>
                      {report.labs.map((lab, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon>
                            <ScienceIcon sx={{ color: "#7B8B5E" }} />
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
