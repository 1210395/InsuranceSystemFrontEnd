import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Chip,
  Stack,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const PatientInfoSection = ({
  patientForm,
  setPatientForm,
  lookupLoading,
  patientInfoLoaded,
  mainClientInfo,
  familyMembers,
  selectedFamilyMember,
  setSelectedFamilyMember,
  chronicDiseases,
  isFollowUpVisit,
  hasSameSpecializationRestriction,
  calculateAge,
  handleEmployeeIdLookup,
  handleNationalIdLookup,
  onPatientChange,
  validatePatient,
  showError,
}) => {
  const { language, isRTL } = useLanguage();
  const [searchType, setSearchType] = useState("employeeId");

  const handleSearchTypeChange = (event, newSearchType) => {
    if (newSearchType !== null) {
      setSearchType(newSearchType);
      // Clear the search field when switching types
      setPatientForm((prev) => ({
        ...prev,
        employeeId: "",
        nationalId: "",
      }));
    }
  };

  const handleSearch = () => {
    if (searchType === "employeeId") {
      handleEmployeeIdLookup();
    } else {
      handleNationalIdLookup?.();
    }
  };

  const getSearchValue = () => {
    return searchType === "employeeId" ? patientForm.employeeId : (patientForm.nationalId || "");
  };

  const setSearchValue = (value) => {
    if (searchType === "employeeId") {
      setPatientForm({ ...patientForm, employeeId: value });
    } else {
      setPatientForm({ ...patientForm, nationalId: value });
    }
  };

  const handleFamilyMemberChange = (e) => {
    if (e.target.value === "main") {
      setSelectedFamilyMember(null);
      setPatientForm((prev) => ({
        ...prev,
        memberId: mainClientInfo.id,
        memberName: mainClientInfo.fullName,
        age: mainClientInfo.age,
        gender: mainClientInfo.gender,
      }));
      if (onPatientChange) {
        onPatientChange(mainClientInfo.id, null);
      }
    } else {
      const member = familyMembers.find((m) => m.id === e.target.value);
      if (member) {
        const memberAge = member.dateOfBirth ? calculateAge(member.dateOfBirth) : "";

        setSelectedFamilyMember(member);
        setPatientForm((prev) => ({
          ...prev,
          memberId: member.id,
          memberName: member.fullName,
          age: memberAge,
          gender: member.gender || "",
        }));
        if (onPatientChange) {
          onPatientChange(null, member.id);
        }
      }
    }
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#f0f9ff" }} dir={isRTL ? "rtl" : "ltr"}>
        <Typography variant="h6" fontWeight={600} mb={2} color="#0284c7">
          {t("patientInformation", language)}
        </Typography>
        <Grid container spacing={2}>
          {/* Search Type Toggle */}
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={searchType}
              exclusive
              onChange={handleSearchTypeChange}
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
              value={getSearchValue()}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !lookupLoading && getSearchValue().trim()) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={searchType === "employeeId" ? t("enterEmployeeId", language) : t("enterNationalId", language)}
              fullWidth
              required
              disabled={lookupLoading}
            />
          </Grid>

          <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              onClick={handleSearch}
              variant="contained"
              fullWidth
              disabled={lookupLoading || !getSearchValue()}
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
              {lookupLoading ? t("checking", language) : `✓ ${t("check", language)}`}
            </Button>
          </Grid>

          {patientInfoLoaded && patientForm.memberName && (
            <Grid item xs={12}>
              <Box
                sx={{
                  background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  border: "2px solid #0284c7",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 10px 30px rgba(2, 132, 199, 0.15)",
                }}
              >
                {/* Family Member Selector */}
                {familyMembers.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="#0284c7">
                      👨‍👩‍👧‍👦 {t("selectPatientMainOrFamily", language)}
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={selectedFamilyMember ? selectedFamilyMember.id : "main"}
                        onChange={handleFamilyMemberChange}
                        sx={{
                          bgcolor: "#fff",
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#0284c7",
                          },
                        }}
                      >
                        <MenuItem value="main">
                          <Box>
                            <Typography fontWeight={600}>{mainClientInfo.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t("mainClient", language)}
                            </Typography>
                          </Box>
                        </MenuItem>
                        {familyMembers.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            <Box>
                              <Typography fontWeight={600}>{member.fullName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.relation}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                      👤 {t("fullName", language)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                      {patientForm.memberName}
                      {selectedFamilyMember && (
                        <Chip
                          label={selectedFamilyMember.relation}
                          size="small"
                          sx={{ ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0, bgcolor: "#e0f2fe", color: "#0284c7" }}
                        />
                      )}
                    </Typography>
                  </Grid>
                  {selectedFamilyMember ? (
                    <>
                      {selectedFamilyMember.insuranceNumber && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            🆔 {t("insuranceNumber", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {selectedFamilyMember.insuranceNumber}
                          </Typography>
                        </Grid>
                      )}
                      {selectedFamilyMember.dateOfBirth && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            🎂 {t("age", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {calculateAge(selectedFamilyMember.dateOfBirth)}
                          </Typography>
                        </Grid>
                      )}
                      {selectedFamilyMember.gender && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            👤 {t("gender", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {selectedFamilyMember.gender}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  ) : (
                    <>
                      {patientForm.phone && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            📱 {t("phone", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {patientForm.phone}
                          </Typography>
                        </Grid>
                      )}
                      {patientForm.employeeId && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            🆔 {t("employeeId", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {patientForm.employeeId}
                          </Typography>
                        </Grid>
                      )}
                      {patientForm.gender && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            👤 {t("gender", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {patientForm.gender}
                          </Typography>
                        </Grid>
                      )}
                      {patientForm.age && (
                        <Grid item xs={12} sm={3}>
                          <Typography variant="overline" sx={{ color: "#0284c7", fontWeight: 700 }}>
                            🎂 {t("age", language)}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937", mt: 0.5 }}>
                            {patientForm.age}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Chronic Diseases Display - Only show for main client, not family members */}
      {patientInfoLoaded && !selectedFamilyMember && chronicDiseases.length > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "#fef2f2",
            border: "2px solid #dc2626",
            mb: 2,
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box
              sx={{
                bgcolor: "#dc2626",
                borderRadius: "50%",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1.2rem" }}>
                ⚠️
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color="#dc2626">
              {t("patientsChronicDiseases", language)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {chronicDiseases.map((disease, idx) => (
              <Chip
                key={idx}
                label={disease}
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#991b1b",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  border: "1px solid #dc2626",
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Follow-up Visit Warning */}
      {patientInfoLoaded && isFollowUpVisit && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "#fef3c7",
            border: "2px solid #f59e0b",
            mb: 2,
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <InfoIcon sx={{ color: "#d97706", fontSize: 28 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600} color="#92400e" mb={1}>
                ⚠️ {t("followUpVisit", language)}
              </Typography>
              <Typography variant="body2" color="#78350f">
                {t("followUpVisitMessage", language)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Same Specialization Restriction Warning */}
      {patientInfoLoaded && hasSameSpecializationRestriction && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: "#fef2f2", border: "2px solid #dc2626" }} dir={isRTL ? "rtl" : "ltr"}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight={600} color="#dc2626">
              ⚠️ {t("restrictionWarning", language)}
            </Typography>
            <Typography variant="body1" color="#991b1b" fontWeight={600}>
              {t("restrictionMessage", language)}
            </Typography>
          </Stack>
        </Paper>
      )}
    </>
  );
};

export default PatientInfoSection;
