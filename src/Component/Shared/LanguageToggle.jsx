import React from "react";
import { IconButton, Tooltip, Box, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { useLanguage } from "../../context/LanguageContext";

const LanguageToggle = ({ sx = {} }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Tooltip title={language === "en" ? "Switch to Arabic" : "التحويل إلى الإنجليزية"}>
      <IconButton
        onClick={toggleLanguage}
        sx={{
          color: "#556B2F",
          backgroundColor: "rgba(85, 107, 47, 0.1)",
          borderRadius: "8px",
          px: 1.5,
          py: 0.5,
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(85, 107, 47, 0.2)",
            transform: "scale(1.05)",
          },
          ...sx,
        }}
      >
        <LanguageIcon sx={{ fontSize: 20, mr: 0.5 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {language === "en" ? "عربي" : "EN"}
        </Typography>
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggle;
