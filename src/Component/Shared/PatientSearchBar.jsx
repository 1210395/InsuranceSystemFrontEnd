import React from "react";
import {
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ClearIcon from "@mui/icons-material/Clear";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const PatientSearchBar = ({
  searchType,
  onSearchTypeChange,
  searchValue,
  onSearchValueChange,
  onSearch,
  loading,
  onClear,
  hasSearched,
  title,
}) => {
  const { language, isRTL } = useLanguage();

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#f0f9ff", mb: 3 }} dir={isRTL ? "rtl" : "ltr"}>
      <Typography variant="h6" fontWeight={600} mb={2} color="#0284c7">
        {title || t("patientInformation", language)}
      </Typography>
      <Grid container spacing={2}>
        {/* Search Type Toggle */}
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={searchType}
            exclusive
            onChange={(e, newType) => {
              if (newType !== null) onSearchTypeChange(newType);
            }}
            size="small"
            sx={{
              mb: 1,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                  },
                },
              },
            }}
          >
            <ToggleButton value="employeeId">
              <BadgeIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 18 }} />
              {t("employeeId", language)}
            </ToggleButton>
            <ToggleButton value="nationalId">
              <CreditCardIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 18 }} />
              {t("nationalId", language)}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={12} md={10}>
          <TextField
            label={searchType === "employeeId" ? `🆔 ${t("employeeId", language)}` : `🪪 ${t("nationalId", language)}`}
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading && searchValue.trim()) {
                e.preventDefault();
                onSearch();
              }
            }}
            placeholder={searchType === "employeeId" ? t("enterEmployeeId", language) : t("enterNationalId", language)}
            fullWidth
            required
            disabled={loading}
            InputProps={
              hasSearched && onClear
                ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={onClear} edge="end" size="small" sx={{ color: "#dc2626" }}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                : undefined
            }
          />
        </Grid>

        <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            onClick={onSearch}
            variant="contained"
            fullWidth
            disabled={loading || !searchValue.trim()}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff !important",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "12px 16px",
              borderRadius: 2.5,
            }}
          >
            {loading ? t("checking", language) : `✓ ${t("check", language)}`}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PatientSearchBar;
