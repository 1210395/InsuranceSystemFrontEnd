import React, { useMemo } from "react";
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
  Chip,
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
  diagnosisTreatmentMappings = {}, // New prop for mappings
  hasSameSpecializationRestriction,
  specializationRestrictionFailed,
  restrictionFailureReason,
  selectedFamilyMember: _selectedFamilyMember,
}) => {
  const { language, isRTL } = useLanguage();

  // Filter treatments based on selected diagnosis using mappings
  const filteredTreatments = useMemo(() => {
    if (!patientForm.diagnosis) {
      // No diagnosis selected - show all treatments
      return availableTreatments;
    }

    // Check if there are mapped treatments for this diagnosis
    const mappedTreatments = diagnosisTreatmentMappings[patientForm.diagnosis];

    if (mappedTreatments && mappedTreatments.length > 0) {
      // Return only treatments that are mapped to this diagnosis AND are in availableTreatments
      return mappedTreatments.filter(t => availableTreatments.includes(t));
    }

    // If no mappings exist for this diagnosis, show all treatments
    return availableTreatments;
  }, [patientForm.diagnosis, diagnosisTreatmentMappings, availableTreatments]);

  // Check if current treatment is still valid when diagnosis changes
  const handleDiagnosisChange = (e) => {
    const newDiagnosis = e.target.value;
    const mappedTreatments = diagnosisTreatmentMappings[newDiagnosis];

    // Check if current treatment is still valid
    let newTreatment = patientForm.treatment;
    if (mappedTreatments && mappedTreatments.length > 0) {
      // If there are mapped treatments and current treatment is not in them, clear it
      if (!mappedTreatments.includes(patientForm.treatment)) {
        newTreatment = "";
      }
    }

    setPatientForm({ ...patientForm, diagnosis: newDiagnosis, treatment: newTreatment });
  };

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
              onChange={handleDiagnosisChange}
              label={t("diagnosisLabel", language)}
              required
            >
              {availableDiagnoses.map((diagnosis, index) => (
                <MenuItem key={index} value={diagnosis}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {diagnosis}
                    {diagnosisTreatmentMappings[diagnosis]?.length > 0 && (
                      <Chip
                        label={`${diagnosisTreatmentMappings[diagnosis].length} ${t("treatments", language) || "treatments"}`}
                        size="small"
                        sx={{
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          fontSize: "0.7rem",
                          height: "20px",
                        }}
                      />
                    )}
                  </Box>
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
              {filteredTreatments.map((treatment, index) => (
                <MenuItem key={index} value={treatment}>
                  {treatment}
                </MenuItem>
              ))}
            </Select>
            {patientForm.diagnosis && diagnosisTreatmentMappings[patientForm.diagnosis]?.length > 0 && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5, ml: 1 }}>
                {t("treatmentsFilteredByDiagnosis", language) || "Treatments filtered based on selected diagnosis"}
              </Typography>
            )}
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
