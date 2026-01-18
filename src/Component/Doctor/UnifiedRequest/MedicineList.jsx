import React from "react";
import {
  Box,
  Paper,
  TextField,
  Grid,
  Typography,
  Stack,
  IconButton,
  Chip,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const MedicineList = ({
  selectedMedicines,
  availableMedicines,
  selectedMedicineValue,
  selectedMedicineInput,
  setSelectedMedicineValue,
  setSelectedMedicineInput,
  hasSameSpecializationRestriction,
  onAddMedicine,
  onRemoveMedicine,
  onUpdateMedicine,
}) => {
  const { language, isRTL } = useLanguage();

  // Helper functions
  const detectFormFromName = (medicineName) => {
    if (!medicineName) return null;
    const nameUpper = medicineName.toUpperCase();
    if (nameUpper.includes("سائل") || nameUpper.includes("LIQUID") || nameUpper.includes("SYRUP")) {
      return "Syrup";
    }
    if (nameUpper.includes("TABLET") || nameUpper.includes("حبة")) {
      return "Tablet";
    }
    if (nameUpper.includes("CREAM") || nameUpper.includes("كريم")) {
      return "Cream";
    }
    if (nameUpper.includes("DROPS") || nameUpper.includes("قطرة")) {
      return "Drops";
    }
    if (nameUpper.includes("INJECTION") || nameUpper.includes("حقن")) {
      return "Injection";
    }
    return null;
  };

  const getDosageLabel = (form, medicineName = null) => {
    if (!form && medicineName) {
      const detectedForm = detectFormFromName(medicineName);
      if (detectedForm) {
        form = detectedForm;
      }
    }
    
    if (!form) return "Dosage";
    
    const formUpper = form.toUpperCase();
    
    if (formUpper === "TABLET") return "How many tablets";
    if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") {
      return "Dosage in ml";
    }
    if (formUpper === "INJECTION") return "How many injections";
    if (formUpper === "CREAM") return "How many grams";
    if (formUpper === "DROPS") return "How many drops";
    
    return "Dosage";
  };

  const getDosageHelperText = (form, medicineName = null) => {
    if (!form && medicineName) {
      const detectedForm = detectFormFromName(medicineName);
      if (detectedForm) {
        form = detectedForm;
      }
    }
    if (!form) return "Enter dosage";
    const formUpper = form.toUpperCase();
    if (formUpper === "TABLET") return "Number of tablets per dose";
    if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") return "Total ml per day";
    if (formUpper === "INJECTION") return "Number of injections";
    if (formUpper === "CREAM") return "Grams per dose";
    if (formUpper === "DROPS") return "Drops per dose";
    return "Enter dosage";
  };

  const getDosagePlaceholder = (form, medicineName = null) => {
    if (!form && medicineName) {
      const detectedForm = detectFormFromName(medicineName);
      if (detectedForm) {
        form = detectedForm;
      }
    }
    if (!form) return "Enter dosage";
    const formUpper = form.toUpperCase();
    if (formUpper === "TABLET") return "e.g., 1 or 2 tablets";
    if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") return "e.g., 15 or 20 ml per day";
    if (formUpper === "INJECTION") return "e.g., 1 or 2 injections";
    if (formUpper === "CREAM") return "e.g., 5 or 10 grams";
    if (formUpper === "DROPS") return "e.g., 2 or 3 drops";
    return "Enter dosage";
  };

  const calculateDuration = (medicine, dosage, timesPerDay) => {
    if (!medicine || !dosage || !timesPerDay) return null;
    const dailyConsumption = dosage * timesPerDay;
    const days = Math.floor(medicine.quantity / dailyConsumption);
    return days;
  };

  const calculateRequiredQuantity = (form, dosage, timesPerDay, duration, _packageQuantity) => {
    if (!duration || duration <= 0) return null;
    
    const formUpper = (form || "").toUpperCase();
    
    switch (formUpper) {
      case "TABLET":
      case "CAPSULE":
        if (!dosage || !timesPerDay || dosage <= 0 || timesPerDay <= 0) return null;
        return dosage * timesPerDay * duration;
        
      case "INJECTION":
        if (!dosage || !duration || dosage <= 0 || duration <= 0) return null;
        return dosage * duration;
        
      case "SYRUP":
      case "DROPS":
        return duration;
        
      case "CREAM":
      case "OINTMENT":
        if (!duration || !timesPerDay || duration <= 0 || timesPerDay <= 0) return null;
        return Math.ceil((duration * timesPerDay) / 7);
        
      default:
        if (dosage && timesPerDay && dosage > 0 && timesPerDay > 0) {
          return dosage * timesPerDay * duration;
        }
        return duration;
    }
  };

  return (
    <Stack spacing={3} dir={isRTL ? "rtl" : "ltr"}>
      <Box>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          {t("addMedicineLabel", language)}
          {availableMedicines.length === 0 && (
            <Typography variant="caption" color="warning.main" sx={{ ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0 }}>
              ({t("noMedicinesAvailable", language)})
            </Typography>
          )}
        </Typography>
        <Autocomplete
          value={selectedMedicineValue}
          inputValue={selectedMedicineInput}
          options={availableMedicines}
          getOptionLabel={(option) => `${option.name}${option.scientificName ? ` - ${option.scientificName}` : ''}`}
          onChange={(event, newValue) => {
            if (newValue) {
              onAddMedicine(newValue);
            }
            setSelectedMedicineValue(null);
            setSelectedMedicineInput("");
          }}
          onInputChange={(event, newInputValue) => {
            setSelectedMedicineInput(newInputValue);
          }}
          disabled={hasSameSpecializationRestriction}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("selectMedicine", language)}
              placeholder={availableMedicines.length === 0 ? t("noMedicinesAvailable", language) : t("searchSelectMedicine", language)}
              variant="outlined"
              disabled={availableMedicines.length === 0 || hasSameSpecializationRestriction}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...restProps } = props;
            return (
              <Box component="li" key={key} {...restProps}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  {option.scientificName && (
                    <Typography variant="caption" color="text.secondary">
                      {option.scientificName}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          sx={{ width: "100%" }}
        />
      </Box>

      {selectedMedicines.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            {t("selectedMedicines", language)}
          </Typography>
          <Stack spacing={2}>
            {selectedMedicines.map((med, idx) => {
              const _duration = calculateDuration(med.medicine, med.dosage, med.timesPerDay);
              const form = med.form || med.medicine?.form;
              const _packageQuantity = med.medicine?.quantity || med.medicine?.fullItem?.quantity || null;
              const _calculatedQty = calculateRequiredQuantity(
                form,
                med.dosage ? parseInt(med.dosage) : null,
                med.timesPerDay ? parseInt(med.timesPerDay) : null,
                med.duration ? parseInt(med.duration) : null,
                _packageQuantity
              );

              return (
                <Paper
                  key={idx}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "2px solid #e0f2fe",
                    backgroundColor: "#ffffff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(14,165,233,0.15)",
                    },
                  }}
                >
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={600} color="#0284c7">
                      {t("medicineNumber", language)} {idx + 1}
                    </Typography>
                    {selectedMedicines.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => onRemoveMedicine(idx)}
                        sx={{
                          "&:hover": {
                            bgcolor: "#fee2e2",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>

                  {/* Medicine Info */}
                  {med.medicine && (
                    <>
                      <Typography variant="body1" fontWeight={700} mb={2}>
                        {med.medicine.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mb={2}>
                        {t("scientificLabel", language)}: {med.medicine.scientificName}
                      </Typography>
                      {med.medicine.form && (
                        <Typography variant="caption" color="text.secondary" mb={2} display="block">
                          {t("formLabel", language)}: {med.medicine.form}
                        </Typography>
                      )}
                    </>
                  )}

                  {/* Medicine Form Display */}
                  {med.form && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`${t("formLabel", language)}: ${med.form}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}

                  {/* Dosage, Times & Duration */}
                  <Grid container spacing={2}>
                    {(() => {
                      const formValue = (med.form || med.medicine?.form || "").toUpperCase();
                      const isCream = formValue === "CREAM" || formValue === "OINTMENT";
                      const isInjection = formValue === "INJECTION";

                      if (isCream || med.noDosage) return null;

                      const xsSize = isInjection || isCream || med.noDosage ? 6 : 4;

                      return (
                        <Grid item xs={xsSize}>
                          <TextField
                            label={(() => {
                              const formValue = med.form || med.medicine?.form;
                              const medicineNameValue = med.medicine?.serviceName || med.medicineName || med.medicine?.name;
                              return getDosageLabel(formValue, medicineNameValue);
                            })()}
                            type="number"
                            size="small"
                            value={med.dosage}
                            onChange={(e) => onUpdateMedicine(idx, "dosage", e.target.value)}
                            placeholder={getDosagePlaceholder(
                              med.form || med.medicine?.form,
                              med.medicine?.serviceName || med.medicineName
                            )}
                            helperText={getDosageHelperText(
                              med.form || med.medicine?.form,
                              med.medicine?.serviceName || med.medicineName
                            )}
                            fullWidth
                            inputProps={{
                              min: med.form === "Tablet" ? 1 : 0.1,
                              step: med.form === "Tablet" ? 1 : 0.1,
                            }}
                            disabled={med.noDosage}
                            sx={
                              med.noDosage
                                ? {
                                    "& .MuiInputBase-input": {
                                      backgroundColor: "#f5f5f5",
                                      cursor: "not-allowed",
                                    },
                                  }
                                : {}
                            }
                          />
                        </Grid>
                      );
                    })()}
                    {(() => {
                      const formValue = (med.form || med.medicine?.form || "").toUpperCase();
                      const isCream = formValue === "CREAM" || formValue === "OINTMENT";
                      const isInjection = formValue === "INJECTION";

                      if (isInjection || med.noDosage) return null;

                      const xsSize = isCream ? 6 : 4;

                      return (
                        <Grid item xs={xsSize}>
                          <TextField
                            label={t("timesPerDay", language)}
                            type="number"
                            size="small"
                            value={med.timesPerDay}
                            onChange={(e) => onUpdateMedicine(idx, "timesPerDay", e.target.value)}
                            placeholder="e.g., 1, 2, 3..."
                            helperText={t("numberOfTimesPerDay", language)}
                            fullWidth
                            inputProps={{ min: 1 }}
                            disabled={med.noDosage}
                            sx={
                              med.noDosage
                                ? {
                                    "& .MuiInputBase-input": {
                                      backgroundColor: "#f5f5f5",
                                      cursor: "not-allowed",
                                    },
                                  }
                                : {}
                            }
                          />
                        </Grid>
                      );
                    })()}
                    <Grid
                      item
                      xs={(() => {
                        const formValue = (med.form || med.medicine?.form || "").toUpperCase();
                        const isCream = formValue === "CREAM" || formValue === "OINTMENT";
                        const isInjection = formValue === "INJECTION";

                        if (isCream || isInjection || med.noDosage) return 6;
                        return 4;
                      })()}
                    >
                      <TextField
                        label={t("durationInDays", language)}
                        type="number"
                        size="small"
                        value={med.duration || ""}
                        onChange={(e) => onUpdateMedicine(idx, "duration", e.target.value)}
                        placeholder="e.g., 7, 10, 14..."
                        helperText={t("treatmentDurationDays", language)}
                        fullWidth
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default MedicineList;
