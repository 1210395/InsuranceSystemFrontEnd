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
          px: { xs: 0.75, sm: 1.5 },
          py: 0.5,
          minWidth: { xs: 36, sm: "auto" },
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(85, 107, 47, 0.2)",
          },
          ...sx,
        }}
      >
        <LanguageIcon sx={{ fontSize: { xs: 18, sm: 20 }, marginInlineEnd: { xs: 0, sm: "4px" } }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            display: { xs: "none", sm: "inline" },
          }}
        >
          {language === "en" ? "عربي" : "EN"}
        </Typography>
      </IconButton>
    </Tooltip>
  );
};

export default LanguageToggle;
