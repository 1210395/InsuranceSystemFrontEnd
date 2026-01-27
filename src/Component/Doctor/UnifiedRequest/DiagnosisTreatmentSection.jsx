import React, { useState } from "react";
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
  TextField,
  Grid,
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

  // State for selected diagnoses (multiple)
  const [selectedDiagnoses, setSelectedDiagnoses] = useState([]);
  const [customDiagnosis, setCustomDiagnosis] = useState("");

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

          {/* Diagnosis Selection - Multiple Checkboxes */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} color="#0284c7" mb={1}>
              {t("diagnosisLabel", language)} *
            </Typography>
            <Grid container spacing={1}>
              {availableDiagnoses.map((diagnosis, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedDiagnoses.includes(diagnosis)}
                        onChange={(e) => {
                          const newSelected = e.target.checked
                            ? [...selectedDiagnoses, diagnosis]
                            : selectedDiagnoses.filter((d) => d !== diagnosis);
                          setSelectedDiagnoses(newSelected);

                          // Update patientForm with comma-separated diagnoses
                          const allDiagnoses = [...newSelected];
                          if (customDiagnosis.trim()) {
                            allDiagnoses.push(customDiagnosis.trim());
                          }
                          setPatientForm({ ...patientForm, diagnosis: allDiagnoses.join(", ") });
                        }}
                        disabled={!selectedSpecialization || hasSameSpecializationRestriction}
                      />
                    }
                    label={diagnosis}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Custom Diagnosis Input */}
            <TextField
              fullWidth
              label={t("customDiagnosis", language) || "Custom Diagnosis"}
              value={customDiagnosis}
              onChange={(e) => {
                setCustomDiagnosis(e.target.value);

                // Update patientForm with comma-separated diagnoses
                const allDiagnoses = [...selectedDiagnoses];
                if (e.target.value.trim()) {
                  allDiagnoses.push(e.target.value.trim());
                }
                setPatientForm({ ...patientForm, diagnosis: allDiagnoses.join(", ") });
              }}
              placeholder={t("enterCustomDiagnosis", language) || "Enter custom diagnosis..."}
              disabled={!selectedSpecialization || hasSameSpecializationRestriction}
              sx={{ mt: 2 }}
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
            ℹ️ {t("noDiagnosisTreatmentRequired", language)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DiagnosisTreatmentSection;
