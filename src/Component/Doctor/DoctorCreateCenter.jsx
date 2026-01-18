
import React, { useState } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Stack,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import UnifiedIcon from "@mui/icons-material/SpaceBar";

import UnifiedCreateRequest from "./UnifiedCreateRequest";
import AddEmergency from "./AddEmergency";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const DoctorCreateCenter = ({ refresh }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const _isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { language, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState("unified");

  const tabConfig = [
    {
      value: "unified",
      label: t("unifiedRequest", language),
      description: t("unifiedRequestDesc", language),
      icon: <UnifiedIcon fontSize="small" />,
      accent: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
    },
    {
      value: "emergency",
      label: t("emergency", language),
      description: t("emergencyDesc", language),
      icon: <LocalHospitalIcon fontSize="small" />,
      accent: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
    },
  ];

  const currentTab = tabConfig.find((tab) => tab.value === activeTab) ?? tabConfig[0];

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={6}
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          overflow: "hidden",
          mb: { xs: 2, sm: 3 },
          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 50%, #8B9A46 100%)",
          color: "#fff",
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, py: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 1.5 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Chip
                icon={currentTab.icon}
                label={t("create", language)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  color: "#fff",
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    color: "#fff",
                  },
                }}
              />
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                sx={{ letterSpacing: 0.5, fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" } }}
              >
                {t("smartCareCreationCenter", language)}
              </Typography>
            </Stack>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />
            <Typography
              variant="body2"
              sx={{
                maxWidth: { xs: "100%", md: 360 },
                opacity: 0.85,
                textAlign: { xs: isRTL ? "right" : "left", md: isRTL ? "left" : "right" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                display: { xs: "none", sm: "block" },
              }}
            >
              {t("smartCareCreationCenterDesc", language)}
            </Typography>
          </Stack>
        </Box>
        <Paper
          elevation={0}
          sx={{
            borderRadius: { xs: "16px 16px 0 0", sm: "20px 20px 0 0", md: "24px 24px 0 0" },
            px: { xs: 1, sm: 1.5, md: 3 },
            pt: { xs: 0.5, sm: 1 },
            pb: 0.5,
            backdropFilter: "blur(6px)",
            backgroundColor: "rgba(255,255,255,0.92)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="fullWidth"
            TabIndicatorProps={{ style: { height: 0 } }}
            sx={{
              "& .MuiTab-root": {
                minHeight: { xs: 48, sm: 56, md: 60 },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: "#4A5D4A",
                transition: "all 0.2s ease",
                backgroundColor: "transparent !important",
                px: { xs: 1, sm: 2 },
                "&:hover": {
                  backgroundColor: "rgba(85, 107, 47, 0.08)",
                },
              },
              "& .Mui-selected": {
                backgroundColor: "transparent !important",
                color: "#556B2F",
                borderBottom: "3px solid #556B2F",
                fontWeight: 700,
              },
            }}
          >
            {tabConfig.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={isMobile ? null : tab.icon}
                iconPosition="start"
                label={
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      {tab.label}
                    </Typography>
                    {!isMobile && (
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.7, fontSize: { xs: "0.65rem", sm: "0.75rem" }, display: { xs: "none", sm: "block" } }}
                      >
                        {tab.description}
                      </Typography>
                    )}
                  </Box>
                }
                sx={{ alignItems: "flex-start" }}
              />
            ))}
          </Tabs>
        </Paper>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          p: { xs: 1.5, sm: 2, md: 3.5 },
          background: "linear-gradient(135deg, #ffffff 0%, #FAF8F5 100%)",
          boxShadow: "0 20px 45px rgba(46, 59, 45, 0.08)",
          border: "1px solid #E8EDE0",
        }}
      >
        {activeTab === "unified" && <UnifiedCreateRequest refresh={refresh} />}
        {activeTab === "emergency" && <AddEmergency onAdded={() => refresh?.()} />}
      </Paper>
    </Box>
  );
};

export default DoctorCreateCenter;