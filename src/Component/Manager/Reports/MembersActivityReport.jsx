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
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const MembersActivityReport = () => {
  const { language, isRTL } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك اند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.REPORTS.MEMBERS_ACTIVITY);
        setReport(res || {});
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
            background: "#FAF8F5",
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
            background: "#FAF8F5",
            minHeight: "100vh",
            marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
            marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">
            {t("failedToLoadMembersReport", language)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Olive-themed cards
  const cards = [
    {
      title: t("totalMembers", language),
      value: report.totalMembers,
      icon: <PeopleIcon />,
      color: "linear-gradient(135deg, #556B2F, #7B8B5E)",
    },
    {
      title: t("membersWithClaims", language),
      value: report.membersWithClaims,
      icon: <AssignmentIcon />,
      color: "linear-gradient(135deg, #8B9A46, #A8B56B)",
    },
    {
      title: t("membersWithPrescriptions", language),
      value: report.membersWithPrescriptions,
      icon: <LocalPharmacyIcon />,
      color: "linear-gradient(135deg, #3D4F23, #556B2F)",
    },
    {
      title: t("membersWithLabRequests", language),
      value: report.membersWithLabRequests,
      icon: <ScienceIcon />,
      color: "linear-gradient(135deg, #7B8B5E, #8B9A46)",
    },
    {
      title: t("membersWithEmergencyRequests", language),
      value: report.membersWithEmergencyRequests,
      icon: <LocalHospitalIcon />,
      color: "linear-gradient(135deg, #556B2F, #8B9A46)",
    },
    {
      title: t("membersWithMedicalRecords", language),
      value: report.membersWithMedicalRecords,
      icon: <DescriptionIcon />,
      color: "linear-gradient(135deg, #A8B56B, #7B8B5E)",
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
            {t("membersActivityReport", language)}
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
