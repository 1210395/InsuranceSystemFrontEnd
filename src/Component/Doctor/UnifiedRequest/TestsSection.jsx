import React from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Stack,
  IconButton,
  Divider,
  Autocomplete,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

// Helper function to get coverage status display info
const getCoverageStatusInfo = (coverageStatus, coveragePercentage, language) => {
  switch (coverageStatus) {
    case "COVERED":
      return {
        label: language === "ar" ? `مغطى ${coveragePercentage || 100}%` : `Covered ${coveragePercentage || 100}%`,
        color: "success",
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        bgColor: "#e8f5e9",
        borderColor: "#4caf50",
      };
    case "REQUIRES_APPROVAL":
      return {
        label: language === "ar" ? "يحتاج موافقة" : "Requires Approval",
        color: "warning",
        icon: <WarningIcon sx={{ fontSize: 16 }} />,
        bgColor: "#fff3e0",
        borderColor: "#ff9800",
      };
    case "NOT_COVERED":
      return {
        label: language === "ar" ? "غير مغطى" : "Not Covered",
        color: "error",
        icon: <CancelIcon sx={{ fontSize: 16 }} />,
        bgColor: "#ffebee",
        borderColor: "#f44336",
      };
    default:
      return {
        label: language === "ar" ? "مغطى" : "Covered",
        color: "success",
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        bgColor: "#e8f5e9",
        borderColor: "#4caf50",
      };
  }
};

const TestsSection = ({
  selectedLabTests,
  selectedRadiologyTests,
  availableLabTests,
  availableRadiologyTests,
  selectedLabTestValue,
  selectedRadiologyTestValue,
  setSelectedLabTestValue,
  setSelectedRadiologyTestValue,
  hasSameSpecializationRestriction,
  onAddLabTest,
  onAddRadiologyTest,
  onRemoveLabTest,
  onRemoveRadiologyTest,
  activeSubTab,
}) => {
  const { language, isRTL } = useLanguage();

  return (
    <>
      {/* Lab Tests */}
      {activeSubTab === 0 && (
        <Stack spacing={3} dir={isRTL ? "rtl" : "ltr"}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t("addLabTest", language)}
              {availableLabTests.length === 0 && (
                <Typography variant="caption" color="warning.main" sx={{ ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0 }}>
                  ({t("noLabTestsAvailable", language)})
                </Typography>
              )}
            </Typography>
            <Autocomplete
              value={selectedLabTestValue}
              options={availableLabTests}
              getOptionLabel={(option) => option.serviceName || option.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                if (newValue) {
                  onAddLabTest(newValue);
                  setSelectedLabTestValue(null);
                }
              }}
              disabled={hasSameSpecializationRestriction}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                const searchLower = inputValue.toLowerCase();
                return options.filter((option) => {
                  const serviceName = (option.serviceName || option.name || "").toLowerCase();
                  return serviceName.includes(searchLower);
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("selectLabTest", language)}
                  placeholder={
                    availableLabTests.length === 0
                      ? t("noLabTestsAvailable", language)
                      : t("searchSelectLabTest", language)
                  }
                  variant="outlined"
                  disabled={availableLabTests.length === 0 || hasSameSpecializationRestriction}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...restProps } = props;
                const statusInfo = getCoverageStatusInfo(option.coverageStatus, option.coveragePercentage, language);
                return (
                  <Box
                    component="li"
                    key={key}
                    {...restProps}
                    sx={{
                      fontSize: "0.95rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span>{option.serviceName || option.name || t("labTestNumber", language)}</span>
                    <Chip
                      size="small"
                      label={statusInfo.label}
                      color={statusInfo.color}
                      icon={statusInfo.icon}
                      sx={{
                        fontSize: "0.7rem",
                        height: 22,
                        "& .MuiChip-icon": { fontSize: 14 }
                      }}
                    />
                  </Box>
                );
              }}
              sx={{ width: "100%" }}
            />
          </Box>

          {selectedLabTests.length > 0 && (
            <>
              <Divider />
              <Box sx={{ width: "100%", display: "block" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  mb={2}
                  sx={{ color: "#1f2937", fontSize: "0.95rem" }}
                >
                  ✅ {t("selectedLabTestsCount", language)} ({selectedLabTests.length})
                </Typography>
                <Stack spacing={2} sx={{ width: "100%" }}>
                  {selectedLabTests.map((lab, idx) => {
                    const statusInfo = getCoverageStatusInfo(
                      lab.test?.coverageStatus,
                      lab.test?.coveragePercentage,
                      language
                    );
                    return (
                      <Paper
                        key={idx}
                        sx={{
                          p: 2.5,
                          bgcolor: statusInfo.bgColor,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          minHeight: "50px",
                          border: `1px solid ${statusInfo.borderColor}`,
                          borderRadius: 1,
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography
                            sx={{ fontSize: "0.95rem", color: "#374151", wordBreak: "break-word" }}
                          >
                            {lab.test?.serviceName || lab.test?.name || `${t("labTestNumber", language)} ${idx + 1}`}
                          </Typography>
                          <Chip
                            size="small"
                            label={statusInfo.label}
                            color={statusInfo.color}
                            icon={statusInfo.icon}
                            sx={{
                              fontSize: "0.7rem",
                              height: 22,
                              width: "fit-content",
                              "& .MuiChip-icon": { fontSize: 14 }
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemoveLabTest(idx)}
                          sx={{ ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0, flexShrink: 0 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      )}

      {/* Radiology Tests */}
      {activeSubTab === 1 && (
        <Stack spacing={3} dir={isRTL ? "rtl" : "ltr"}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t("addRadiologyTest", language)}
            </Typography>
            <Autocomplete
              value={selectedRadiologyTestValue}
              options={availableRadiologyTests}
              getOptionLabel={(option) => option.serviceName || option.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                if (newValue) {
                  onAddRadiologyTest(newValue);
                  setSelectedRadiologyTestValue(null);
                }
              }}
              disabled={hasSameSpecializationRestriction}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                const searchLower = inputValue.toLowerCase();
                return options.filter((option) => {
                  const serviceName = (option.serviceName || option.name || "").toLowerCase();
                  return serviceName.includes(searchLower);
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("selectRadiologyTest", language)}
                  placeholder={t("searchSelectRadiologyTest", language)}
                  variant="outlined"
                  disabled={hasSameSpecializationRestriction}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...restProps } = props;
                const statusInfo = getCoverageStatusInfo(option.coverageStatus, option.coveragePercentage, language);
                return (
                  <Box
                    component="li"
                    key={key}
                    {...restProps}
                    sx={{
                      fontSize: "0.95rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <span>{option.serviceName || option.name || t("radiologyTestNumber", language)}</span>
                    <Chip
                      size="small"
                      label={statusInfo.label}
                      color={statusInfo.color}
                      icon={statusInfo.icon}
                      sx={{
                        fontSize: "0.7rem",
                        height: 22,
                        "& .MuiChip-icon": { fontSize: 14 }
                      }}
                    />
                  </Box>
                );
              }}
              sx={{ width: "100%" }}
            />
          </Box>

          {selectedRadiologyTests.length > 0 && (
            <>
              <Divider />
              <Box sx={{ width: "100%", display: "block" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  mb={2}
                  sx={{ color: "#1f2937", fontSize: "0.95rem" }}
                >
                  ✅ {t("selectedRadiologyTestsCount", language)} ({selectedRadiologyTests.length})
                </Typography>
                <Stack spacing={2} sx={{ width: "100%" }}>
                  {selectedRadiologyTests.map((rad, idx) => {
                    const statusInfo = getCoverageStatusInfo(
                      rad.test?.coverageStatus,
                      rad.test?.coveragePercentage,
                      language
                    );
                    return (
                      <Paper
                        key={idx}
                        sx={{
                          p: 2.5,
                          bgcolor: statusInfo.bgColor,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          minHeight: "50px",
                          border: `1px solid ${statusInfo.borderColor}`,
                          borderRadius: 1,
                          "&:hover": {
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography
                            sx={{ fontSize: "0.95rem", color: "#374151", wordBreak: "break-word" }}
                          >
                            {rad.test?.serviceName || rad.test?.name || `${t("radiologyTestNumber", language)} ${idx + 1}`}
                          </Typography>
                          <Chip
                            size="small"
                            label={statusInfo.label}
                            color={statusInfo.color}
                            icon={statusInfo.icon}
                            sx={{
                              fontSize: "0.7rem",
                              height: 22,
                              width: "fit-content",
                              "& .MuiChip-icon": { fontSize: 14 }
                            }}
                          />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onRemoveRadiologyTest(idx)}
                          sx={{ ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0, flexShrink: 0 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      )}
    </>
  );
};

export default TestsSection;
