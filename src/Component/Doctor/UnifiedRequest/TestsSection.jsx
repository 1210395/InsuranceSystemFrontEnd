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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

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
                return (
                  <Box component="li" key={key} {...restProps} sx={{ fontSize: "0.95rem" }}>
                    {option.serviceName || option.name || t("labTestNumber", language)}
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
                  {selectedLabTests.map((lab, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2.5,
                        bgcolor: "#FAF8F5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        minHeight: "50px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#f3f4f6",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.95rem", color: "#374151", flex: 1, wordBreak: "break-word" }}
                      >
                        {lab.test?.serviceName || lab.test?.name || `${t("labTestNumber", language)} ${idx + 1}`}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoveLabTest(idx)}
                        sx={{ ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0, flexShrink: 0 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
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
                return (
                  <Box component="li" key={key} {...restProps} sx={{ fontSize: "0.95rem" }}>
                    {option.serviceName || option.name || t("radiologyTestNumber", language)}
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
                  {selectedRadiologyTests.map((rad, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2.5,
                        bgcolor: "#FAF8F5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        minHeight: "50px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#f3f4f6",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "0.95rem", color: "#374151", flex: 1, wordBreak: "break-word" }}
                      >
                        {rad.test?.serviceName || rad.test?.name || `${t("radiologyTestNumber", language)} ${idx + 1}`}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoveRadiologyTest(idx)}
                        sx={{ ml: isRTL ? 0 : 2, mr: isRTL ? 2 : 0, flexShrink: 0 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
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
