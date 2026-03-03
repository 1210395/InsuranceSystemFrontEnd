import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip,
  TextField,
  Autocomplete,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const DiagnosisTreatmentSection = ({
  noDiagnosisTreatment,
  setNoDiagnosisTreatment,
  patientForm,
  setPatientForm,
  selectedSpecialization,
  specializations,
  medicalDiagnosisList = [],
  onDiagnosisChange,
  hasSameSpecializationRestriction,
  specializationRestrictionFailed,
  restrictionFailureReason,
}) => {
  const { language, isRTL } = useLanguage();

  // State for selected diagnosis objects
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);

  // If specialization restrictions failed, show error message
  if (specializationRestrictionFailed) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#fee2e2", border: "2px solid #ef4444" }} dir={isRTL ? "rtl" : "ltr"}>
        <Typography variant="h6" fontWeight={600} color="#dc2626" mb={1}>
          {t("specializationRestrictionsNotMet", language)}
        </Typography>
        <Typography variant="body1" color="#991b1b" mb={2}>
          {restrictionFailureReason}
        </Typography>
        <Typography variant="body2" color="#7f1d1d">
          {t("cannotDisplayMedicinesTests", language)}
        </Typography>
      </Paper>
    );
  }

  // Handle diagnosis selection change
  const handleDiagnosisChange = (event, newValue) => {
    setSelectedDiagnoses(newValue);

    // Update patientForm.diagnosis with display names for the prescription record
    const diagnosisText = newValue
      .map((d) => (language === "ar" ? d.arabicName : d.englishName))
      .join(", ");
    setPatientForm({ ...patientForm, diagnosis: diagnosisText });

    // Notify parent with selected diagnosis IDs for filtering
    if (onDiagnosisChange) {
      onDiagnosisChange(newValue.map((d) => d.id));
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#f0f9ff" }} dir={isRTL ? "rtl" : "ltr"}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600} color="#0284c7">
          {t("diagnosisTreatment", language)}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={noDiagnosisTreatment}
              onChange={(e) => {
                setNoDiagnosisTreatment(e.target.checked);
                if (e.target.checked) {
                  setPatientForm((prev) => ({ ...prev, diagnosis: "", treatment: "" }));
                  setSelectedDiagnoses([]);
                  if (onDiagnosisChange) onDiagnosisChange([]);
                }
              }}
              disabled={hasSameSpecializationRestriction}
            />
          }
          label={t("noDiagnosisTreatmentNeeded", language)}
        />
      </Stack>

      {!noDiagnosisTreatment && (
        <>
          {/* Show specialization info (read-only) */}
          {selectedSpecialization && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#e0f2fe", borderRadius: 1 }}>
              <Typography variant="body2" color="#0284c7" fontWeight={600}>
                {t("specialization", language)}:{" "}
                {specializations.find((s) => s.displayName === selectedSpecialization)?.displayName ||
                  selectedSpecialization}
              </Typography>
            </Box>
          )}

          {/* Diagnosis Selection - Searchable Multi-Select from MedicalDiagnosis API */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} color="#0284c7" mb={1}>
              {t("diagnosisLabel", language)} *
            </Typography>
            <Autocomplete
              multiple
              disableCloseOnSelect
              id="diagnosis-autocomplete"
              options={medicalDiagnosisList}
              value={selectedDiagnoses}
              onChange={handleDiagnosisChange}
              disabled={!selectedSpecialization || hasSameSpecializationRestriction}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionLabel={(option) => {
                const en = option.englishName || "";
                const ar = option.arabicName || "";
                if (language === "ar") return ar ? `${ar} (${en})` : en;
                return en ? `${en} (${ar})` : ar;
              }}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                const lower = inputValue.toLowerCase();
                return options.filter(
                  (opt) =>
                    (opt.englishName || "").toLowerCase().includes(lower) ||
                    (opt.arabicName || "").includes(inputValue)
                );
              }}
              renderOption={(props, option, { selected }) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    <Stack>
                      <Typography variant="body2" fontWeight={500}>
                        {language === "ar" ? option.arabicName : option.englishName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {language === "ar" ? option.englishName : option.arabicName}
                      </Typography>
                    </Stack>
                  </li>
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...chipProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={language === "ar" ? option.arabicName : option.englishName}
                      {...chipProps}
                      sx={{
                        bgcolor: "#0284c7",
                        color: "#fff",
                        "& .MuiChip-deleteIcon": {
                          color: "#fff",
                          "&:hover": { color: "#e0f2fe" },
                        },
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={t("searchDiagnosis", language)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: "#0284c7" },
                      "&.Mui-focused fieldset": { borderColor: "#0284c7" },
                    },
                  }}
                />
              )}
              sx={{ "& .MuiAutocomplete-tag": { margin: "2px" } }}
            />
          </Box>

          {/* Treatment Plan - Free Text Field */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t("treatmentPlan", language)}
            value={patientForm.treatment}
            onChange={(e) => setPatientForm({ ...patientForm, treatment: e.target.value })}
            placeholder={t("enterTreatmentPlan", language) || "Enter treatment plan..."}
            disabled={!selectedSpecialization || hasSameSpecializationRestriction}
            required
          />
        </>
      )}

      {noDiagnosisTreatment && (
        <Box sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 1, border: "1px solid #f59e0b" }}>
          <Typography variant="body2" color="#92400e" fontWeight={600}>
            {t("noDiagnosisTreatmentRequired", language)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DiagnosisTreatmentSection;
