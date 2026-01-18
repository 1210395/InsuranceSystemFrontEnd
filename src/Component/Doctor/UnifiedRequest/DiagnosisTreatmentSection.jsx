import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const DiagnosisTreatmentSection = ({
  noDiagnosisTreatment,
  setNoDiagnosisTreatment,
  patientForm,
  setPatientForm,
  selectedSpecialization,
  specializations,
  availableDiagnoses,
  availableTreatments,
  hasSameSpecializationRestriction,
  specializationRestrictionFailed,
  restrictionFailureReason,
  selectedFamilyMember: _selectedFamilyMember,
}) => {
  const { language, isRTL } = useLanguage();

  // If specialization restrictions failed, show error message
  if (specializationRestrictionFailed) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#fee2e2", border: "2px solid #ef4444" }} dir={isRTL ? "rtl" : "ltr"}>
        <Typography variant="h6" fontWeight={600} color="#dc2626" mb={1}>
          ⚠️ {t("specializationRestrictionsNotMet", language)}
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
                  // Clear diagnosis and treatment when checkbox is checked
                  setPatientForm((prev) => ({ ...prev, diagnosis: "", treatment: "" }));
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

          {/* Diagnosis Selection */}
          <FormControl
            fullWidth
            sx={{ mb: 2 }}
            disabled={!selectedSpecialization || hasSameSpecializationRestriction}
          >
            <InputLabel>{t("diagnosisLabel", language)}</InputLabel>
            <Select
              value={patientForm.diagnosis}
              onChange={(e) => setPatientForm({ ...patientForm, diagnosis: e.target.value })}
              label={t("diagnosisLabel", language)}
              required
            >
              {availableDiagnoses.map((diagnosis, index) => (
                <MenuItem key={index} value={diagnosis}>
                  {diagnosis}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Treatment Plan Selection */}
          <FormControl fullWidth disabled={!selectedSpecialization || hasSameSpecializationRestriction}>
            <InputLabel>{t("treatmentPlan", language)}</InputLabel>
            <Select
              value={patientForm.treatment}
              onChange={(e) => setPatientForm({ ...patientForm, treatment: e.target.value })}
              label={t("treatmentPlan", language)}
              required
            >
              {availableTreatments.map((treatment, index) => (
                <MenuItem key={index} value={treatment}>
                  {treatment}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      {noDiagnosisTreatment && (
        <Box sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 1, border: "1px solid #f59e0b" }}>
          <Typography variant="body2" color="#92400e" fontWeight={600}>
            ℹ️ {t("noDiagnosisTreatmentRequired", language)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DiagnosisTreatmentSection;
