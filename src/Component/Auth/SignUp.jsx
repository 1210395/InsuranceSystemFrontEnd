import React, { useState, useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormHelperText,
  Collapse,
  Stack,
  Tooltip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const getGenders = (language) => [
  { value: "MALE", label: t("male", language) },
  { value: "FEMALE", label: t("female", language) },
];

const getRelationTypes = (language) => [
  { value: "WIFE", label: t("wife", language) },
  { value: "SON", label: t("son", language) },
  { value: "DAUGHTER", label: t("daughter", language) },
  { value: "FATHER", label: t("fatherRelation", language) },
  { value: "MOTHER", label: t("motherRelation", language) },
];

const getChronicDiseasesList = (language) => [
  { value: "DIABETES", label: t("diabetesDisease", language) },
  { value: "HYPERTENSION", label: t("highBloodPressure", language) },
  { value: "ASTHMA", label: t("asthmaDisease", language) },
  { value: "HEART_DISEASE", label: t("heartDisease", language) },
  { value: "KIDNEY_DISEASE", label: t("kidneyDisease", language) },
  { value: "THYROID", label: t("thyroidDisorder", language) },
  { value: "EPILEPSY", label: t("epilepsyDisease", language) },
];

const calculateAge = (dob) => {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age >= 0 ? age : "";
};

const isFamilyMemberComplete = (m) =>
  m.firstName?.trim() &&
  m.lastName?.trim() &&
  m.nationalId?.trim() &&
  m.dateOfBirth &&
  m.gender &&
  m.relationType;

const buildFullName = (firstName, middleName, lastName) =>
  [firstName, middleName, lastName]
    .map((x) => (x || "").trim())
    .filter(Boolean)
    .join(" ");

const isValidEmail = (value) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);

const isValidPassword = (value) => {
  if (!value) return false;
  const clean = value.trim();
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]{8,}$/;
  return regex.test(clean);
};


const isValidPhone = (value) => /^05\d{8}$/.test(value);

const SignUp = memo(function SignUp({ setMode, setPendingEmail }) {
  const { language, isRTL } = useLanguage();
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [view, setView] = useState("USER");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = () => password === confirmPassword;
  const [chronicDocuments, setChronicDocuments] = useState([]);
  const [labCode, setLabCode] = useState("");
  const [labName, setLabName] = useState("");
  const [labLocation, setLabLocation] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [hasChronicDiseases, setHasChronicDiseases] = useState(false);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [radiologyCode, setRadiologyCode] = useState("");
  const [radiologyName, setRadiologyName] = useState("");
  const [radiologyLocation, setRadiologyLocation] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
const [gender, setGender] = useState("");  
  const universityCardRef = useRef(null);
  const chronicDocsRef = useRef(null);

  const hasUniversityCard = uploadedFiles.length > 0;

  // Fetch specializations from API when DOCTOR
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (selectedRole === "DOCTOR") {
        setLoadingSpecializations(true);
        try {
          const res = await api.get(API_ENDPOINTS.DOCTOR.SPECIALIZATIONS);
          setSpecializations(res.data || []);
        } catch (err) {
          console.error("Error fetching specializations:", err);
          setSpecializations([]);
        } finally {
          setLoadingSpecializations(false);
        }
      } else {
        setSpecializations([]);
        setSelectedSpecialization("");
      }
    };
    fetchSpecializations();
  }, [selectedRole]);

  const passwordStatus = () => {
    if (password === "") return "empty";
    if (isValidPassword(password)) return "valid";
    return "invalid";
  };

  const generatePreviewInsuranceNumber = (index) => {
    if (!employeeId) return t("autoGenerated", language);
    return `${employeeId}.${String(index + 1).padStart(2, "0")}`;
  };

  const addFamilyMember = () => {
    if (familyMembers.length > 0) {
      const last = familyMembers[familyMembers.length - 1];
      if (!isFamilyMemberComplete(last)) {
        alert(t("completeCurrentMemberFirst", language));
        return;
      }
    }
    setFamilyMembers((prev) => [
      ...prev,
      {
        firstName: "",
        middleName: "",
        lastName: "",
        nationalId: "",
        dateOfBirth: "",
        gender: "",
        relationType: "",
        documents: [],
      },
    ]);
  };

  const updateFamilyMember = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullName = buildFullName(firstName, middleName, lastName);

    if (!firstName.trim() || !lastName.trim()) {
      alert(t("firstLastNameRequired", language));
      return;
    }

    if (!gender) {
      alert(t("pleaseSelectGender", language));
      return;
    }


    if (!dateOfBirth) {
      alert(t("enterDateOfBirth", language));
      return;
    }

    if (calculateAge(dateOfBirth) < 18) {
      alert(t("ageMustBe18", language));
      return;
    }

    if (!nationalId || nationalId.trim().length < 9) {
      alert(t("enterValidNationalId", language));
      return;
    }

    if (!isValidEmail(email)) {
      alert(t("enterValidEmail", language));
      return;
    }

    if (!isValidPhone(phone)) {
      alert(t("phoneMustBe10Digits", language));
      return;
    }

    if (!isValidPassword(password)) {
      alert(t("passwordNotMeetRequirements", language));
      return;
    }
    if (!passwordsMatch()) {
      alert(t("passwordConfirmNoMatch", language));
      return;
    }

    if (selectedRole === "INSURANCE_CLIENT") {
      if (!agreeToPolicy) {
        alert(t("mustAgreeToPolicy", language));
        return;
      }
      if (!hasUniversityCard) {
        alert(t("universityCardMandatory", language));
        return;
      }
      if (hasChronicDiseases && chronicDiseases.length === 0) {
        alert(t("selectAtLeastOneChronicDisease", language));
        return;
      }
      if (hasChronicDiseases && chronicDocuments.length === 0) {
        alert(t("uploadChronicDiseaseProof", language));
        return;
      }
    }

    if (selectedRole === "LAB_TECH") {
      if (!labCode.trim() || !labName.trim()) {
        alert(t("fillLabCodeAndName", language));
        return;
      }
    }

    if (selectedRole === "RADIOLOGIST") {
      if (!radiologyCode.trim() || !radiologyName.trim()) {
        alert(t("fillRadiologyCodeAndName", language));
        return;
      }
    }

    if (selectedRole === "INSURANCE_CLIENT" && familyMembers.length > 0) {
      for (const m of familyMembers) {
        if (!isFamilyMemberComplete(m)) {
          alert(t("completeFamilyMemberFields", language));
          return;
        }
      }

      for (const m of familyMembers) {
        const age = calculateAge(m.dateOfBirth);

        if (age === "") continue;

        // Children
        if (["SON", "DAUGHTER"].includes(m.relationType)) {
          if (age > 22) {
            alert(t("childrenAllowedUpTo22", language));
            return;
          }
        }

        // Parents
        if (["FATHER", "MOTHER"].includes(m.relationType)) {
          if (age > 100) {
            alert(t("parentsAllowedUpTo100", language));
            return;
          }
        }

        // Wife -> no age restriction
      }


      const ids = familyMembers.map((m) => m.nationalId);
      if (new Set(ids).size !== ids.length) {
        alert(t("familyNationalIdUnique", language));
        return;
      }
      if (ids.includes(nationalId)) {
        alert(t("familyNationalIdCannotMatchMain", language));
        return;
      }
    }

    const payload = {
      fullName,
      nationalId: nationalId.trim(),
      email: email.trim(),
      phone,
      password,
      desiredRole: selectedRole,
      dateOfBirth,
        gender,  
    };

    if (selectedRole === "INSURANCE_CLIENT") {
      payload.agreeToPolicy = agreeToPolicy;
      payload.employeeId = employeeId;
      payload.department = event.currentTarget.department?.value || "";
      payload.faculty = event.currentTarget.faculty?.value || "";
      payload.hasChronicDiseases = hasChronicDiseases;
      payload.chronicDiseases = chronicDiseases;
    } else if (selectedRole === "DOCTOR") {
      payload.employeeId = employeeId;
      payload.specialization = selectedSpecialization;
      payload.clinicLocation = event.currentTarget.clinicLocation?.value || "";
      payload.agreeToPolicy = false;
    } else if (selectedRole === "PHARMACIST") {
      payload.employeeId = employeeId.trim(); // ✅ إضافة Employee ID للصيدلي
      payload.pharmacyCode = event.currentTarget.pharmacyCode?.value || "";
      payload.pharmacyName = event.currentTarget.pharmacyName?.value || "";
      payload.pharmacyLocation = event.currentTarget.pharmacyLocation?.value || "";
      payload.agreeToPolicy = false;
    } else if (selectedRole === "LAB_TECH") {
      payload.employeeId = employeeId.trim(); // ✅ إضافة Employee ID لموظف المختبر
      payload.labCode = labCode.trim();
      payload.labName = labName.trim();
      if (labLocation) payload.labLocation = labLocation.trim();
      payload.agreeToPolicy = false;
    } else if (selectedRole === "RADIOLOGIST") {
      payload.employeeId = employeeId.trim(); // ✅ إضافة Employee ID لأخصائي الأشعة
      payload.radiologyCode = radiologyCode.trim();
      payload.radiologyName = radiologyName.trim();
      if (radiologyLocation) payload.radiologyLocation = radiologyLocation.trim();
      payload.agreeToPolicy = false;
    }

    payload.familyMembers = familyMembers
      .filter(isFamilyMemberComplete)
      .map((m) => ({
        fullName: buildFullName(m.firstName, m.middleName, m.lastName),
        nationalId: m.nationalId,
        dateOfBirth: m.dateOfBirth,
        gender: m.gender,
        relation: m.relationType,
      }));

    try {
      const data = new FormData();

      uploadedFiles.forEach((f) => data.append("universityCard", f));

      data.append(
        "data",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        })
      );

      const owners = [];
      familyMembers
        .filter(isFamilyMemberComplete)
        .forEach((m) => {
          (m.documents || []).forEach((file) => {
            data.append("familyDocuments", file);
            owners.push(m.nationalId);
          });
        });

      if (owners.length > 0) {
        data.append("familyDocumentsOwners", JSON.stringify(owners));
      }

      chronicDocuments.forEach((f) => {
        data.append("chronicDocuments", f);
      });

      await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
setPendingEmail(email);   // ⬅️ هذا السطر الجديد
setMode("verify-email");


    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "";

      if (msg.includes("not verified")) {
        alert(t("emailAlreadyRegisteredNotVerified", language));
        setPendingEmail(email);
        setMode("verify-email");
        return;
      }

      if (msg.includes("already exists")) {
        alert(t("emailAlreadyRegistered", language));
        setMode("signin");
        return;
      }

      alert(t("registrationFailed", language));
    }
  };

  return (
    <Container component="main" maxWidth={false} disableGutters dir={isRTL ? "rtl" : "ltr"}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(145deg, #FFFFFF, #E8EDE0)",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: "12px", sm: "15px", md: "18px" },
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: { xs: "100%", sm: "420px", md: "460px" },
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#556B2F", width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
          <LockOutlinedIcon fontSize="medium" />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ mb: { xs: 2, md: 3 }, fontWeight: "bold", color: "#556B2F", fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" } }}>
          {t("signUp", language)}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <Collapse in={view === "USER"} timeout={400}>
            <Box>
              {/* First / Middle / Last Name */}
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                label={t("firstName", language)}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                fullWidth
                label={t("middleName", language)}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                label={t("lastName", language)}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                label={t("nationalId", language)}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                id="email"
                label={t("emailAddress", language)}
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                error={email !== "" && !isValidEmail(email)}
                helperText={
                  email !== "" && !isValidEmail(email) ? t("validEmailFormat", language) : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                id="phone"
                label={t("phoneNumber", language)}
                name="phone"
                value={phone}
                placeholder="05XXXXXXXX"
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 10) val = val.slice(0, 10);
                  setPhone(val);
                }}
                error={phone !== "" && !isValidPhone(phone)}
                helperText={phone !== "" && !isValidPhone(phone) ? t("mustBe10DigitsStartWith05", language) : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                  inputMode: "numeric",
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />

              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                id="dateOfBirth"
                label={t("dateOfBirthLabel", language)}
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              />
              <TextField
                select
                fullWidth
                size="small"
                label={t("gender", language)}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                sx={{ mb: 1 }}
              >
                {getGenders(language).map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </TextField>


              {/* Desired Role */}
              <TextField
                margin="normal"
                size="small"
                select
                fullWidth
                id="desiredRole"
                label={t("desiredRole", language)}
                name="desiredRole"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon sx={{ color: "#7B8B5E" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
              >
                <MenuItem value="">{t("selectRoleOption", language)}</MenuItem>
                <MenuItem value="INSURANCE_CLIENT">{t("insuranceClient", language)}</MenuItem>
                <MenuItem value="DOCTOR">{t("doctor", language)}</MenuItem>
                <MenuItem value="PHARMACIST">{t("pharmacist", language)}</MenuItem>
                <MenuItem value="LAB_TECH">{t("labEmployee", language)}</MenuItem>
                <MenuItem value="RADIOLOGIST">{t("radiologist", language)}</MenuItem>
              </TextField>

              {/* INSURANCE_CLIENT extra fields */}
              <Collapse in={selectedRole === "INSURANCE_CLIENT"}>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="employeeId"
                  label={t("employeeId", language)}
                  name="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="department"
                  label={t("department", language)}
                  name="department"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="faculty"
                  label={t("faculty", language)}
                  name="faculty"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />

                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Checkbox
                      checked={hasChronicDiseases}
                      onChange={(e) => {
                        setHasChronicDiseases(e.target.checked);
                        if (!e.target.checked) {
                          setChronicDiseases([]);
                          setChronicDocuments([]);
                          if (chronicDocsRef.current) chronicDocsRef.current.value = "";
                        }
                      }}
                    />
                  }
                  label={t("doYouHaveChronicDiseases", language)}
                />
                <Collapse in={hasChronicDiseases}>
                  <Box sx={{ mt: 2 }}>
                    <Autocomplete
                      multiple
                      options={getChronicDiseasesList(language)}
                      value={getChronicDiseasesList(language).filter((x) => chronicDiseases.includes(x.value))}
                      onChange={(_, newValues) => {
                        setChronicDiseases(newValues.map((x) => x.value));
                      }}
                      getOptionLabel={(option) => option.label}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option.label}
                              {...tagProps}
                              sx={{ borderRadius: 2, fontWeight: "bold" }}
                            />
                          );
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("chronicDiseases", language)}
                          placeholder={t("typeAndSelect", language)}
                          size="small"
                          margin="normal"
                          helperText={t("selectOneOrMoreDiseases", language)}
                        />
                      )}
                    />

                    {/* Upload Chronic Docs */}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button
                        component="label"
                        variant={chronicDocuments.length ? "contained" : "outlined"}
                        fullWidth
                        sx={{
                          borderColor: chronicDocuments.length ? "success.main" : "#7B8B5E",
                          color: chronicDocuments.length ? "#fff" : "#7B8B5E",
                          backgroundColor: chronicDocuments.length ? "success.main" : "transparent",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: chronicDocuments.length ? "success.dark" : "#f4f7ff",
                          },
                        }}
                      >
                        {chronicDocuments.length
                          ? `${chronicDocuments.length} ${t("filesSelected", language)}`
                          : t("uploadChronicDocuments", language)}
                        <input
                          hidden
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          ref={chronicDocsRef}
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;
                            setChronicDocuments((prev) => [...prev, ...files]);
                            if (chronicDocsRef.current) chronicDocsRef.current.value = "";
                          }}
                        />
                      </Button>

                      {chronicDocuments.length > 0 && (
                        <Tooltip title={t("clearAll", language)}>
                          <Button
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: "90px", fontWeight: "bold" }}
                            onClick={() => {
                              setChronicDocuments([]);
                              if (chronicDocsRef.current) chronicDocsRef.current.value = "";
                            }}
                          >
                            X
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>

                    {chronicDocuments.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {chronicDocuments.map((f, idx) => (
                          <Stack
                            key={`${f.name}-${idx}`}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{
                              p: 1,
                              mb: 1,
                              border: "1px solid #E8EDE0",
                              borderRadius: 2,
                              backgroundColor: "#fff",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {f.name}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setChronicDocuments((prev) => prev.filter((_, i) => i !== idx))
                              }
                            >
                              {t("remove", language)}
                            </Button>
                          </Stack>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Collapse>

              {/* DOCTOR */}
              <Collapse in={selectedRole === "DOCTOR"}>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="employeeId"
                  label={t("employeeId", language)}
                  name="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  select
                  fullWidth
                  id="specialization"
                  label={t("specialization", language)}
                  name="specialization"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  disabled={loadingSpecializations}
                  helperText={loadingSpecializations ? t("loadingSpecializations", language) : ""}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                >
                  <MenuItem value="">{t("selectSpecializationPlaceholder", language)}</MenuItem>
                  {specializations.map((spec) => (
                    <MenuItem key={spec.id || spec.displayName || spec.name} value={spec.name || spec.displayName}>
                      {spec.displayName || spec.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="clinicLocation"
                  label={t("clinicLocation", language)}
                  name="clinicLocation"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
              </Collapse>

              {/* PHARMACIST */}
              <Collapse in={selectedRole === "PHARMACIST"}>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="employeeId"
                  label={t("employeeId", language)}
                  name="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="pharmacyCode"
                  label={t("pharmacyCode", language)}
                  name="pharmacyCode"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="pharmacyName"
                  label={t("pharmacyName", language)}
                  name="pharmacyName"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="pharmacyLocation"
                  label={t("pharmacyLocation", language)}
                  name="pharmacyLocation"
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
              </Collapse>

              {/* LAB_TECH */}
              <Collapse in={selectedRole === "LAB_TECH"}>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="employeeId"
                  label={t("employeeId", language)}
                  name="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  required
                  fullWidth
                  id="labCode"
                  label={t("labCode", language)}
                  name="labCode"
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  required
                  fullWidth
                  id="labName"
                  label={t("labName", language)}
                  name="labName"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="labLocation"
                  label={t("labLocation", language)}
                  name="labLocation"
                  value={labLocation}
                  onChange={(e) => setLabLocation(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
              </Collapse>

              {/* RADIOLOGIST */}
              <Collapse in={selectedRole === "RADIOLOGIST"}>
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="employeeId"
                  label={t("employeeId", language)}
                  name="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  required
                  fullWidth
                  id="radiologyCode"
                  label={t("radiologyCode", language)}
                  name="radiologyCode"
                  value={radiologyCode}
                  onChange={(e) => setRadiologyCode(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  required
                  fullWidth
                  id="radiologyName"
                  label={t("radiologyCenterName", language)}
                  name="radiologyName"
                  value={radiologyName}
                  onChange={(e) => setRadiologyName(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
                <TextField
                  margin="normal"
                  size="small"
                  fullWidth
                  id="radiologyLocation"
                  label={t("radiologyCenterLocation", language)}
                  name="radiologyLocation"
                  value={radiologyLocation}
                  onChange={(e) => setRadiologyLocation(e.target.value)}
                  InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
                />
              </Collapse>

              {/* Password with tooltip/validation */}
              <Tooltip
                title={
                  passwordStatus() === "invalid"
                    ? t("passwordInvalidMsg", language)
                    : passwordStatus() === "valid"
                    ? t("strongPassword", language)
                    : ""
                }
                placement="right"
                arrow
              >
                <TextField
                  margin="normal"
                  size="small"
                  required
                  fullWidth
                  label={t("password", language)}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                  error={passwordStatus() === "invalid"}
                  helperText={passwordStatus() === "valid" ? t("passwordValidMsg", language) : ""}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon
                          sx={{
                            color:
                              passwordStatus() === "empty"
                                ? "#7B8B5E"
                                : passwordStatus() === "valid"
                                ? "success.main"
                                : "error.main",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor:
                          passwordStatus() === "empty"
                            ? "#7B8B5E"
                            : passwordStatus() === "valid"
                            ? "success.main"
                            : "error.main",
                      },
                      "&:hover fieldset": {
                        borderColor:
                          passwordStatus() === "valid" ? "success.dark" : "error.dark",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor:
                          passwordStatus() === "valid" ? "success.main" : "error.main",
                      },
                    },
                  }}
                />

              </Tooltip>
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                label={t("confirmPassword", language)}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
                error={confirmPassword !== "" && !passwordsMatch()}
                helperText={
                  confirmPassword !== "" && !passwordsMatch()
                    ? t("passwordsDoNotMatch", language)
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color:
                            confirmPassword === ""
                              ? "#7B8B5E"
                              : passwordsMatch()
                              ? "success.main"
                              : "error.main",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Upload University Card (multi) */}
              <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 3 }, mb: 2 }}>
                <Button
                  component="label"
                  variant={hasUniversityCard ? "contained" : "outlined"}
                  fullWidth
                  sx={{
                    borderColor: hasUniversityCard ? "success.main" : "#7B8B5E",
                    color: hasUniversityCard ? "#fff" : "#7B8B5E",
                    backgroundColor: hasUniversityCard ? "success.main" : "transparent",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    textTransform: "none",
                    minHeight: { xs: 48, md: 44 },
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                    "&:hover": {
                      backgroundColor: hasUniversityCard ? "success.dark" : "#f4f7ff",
                    },
                  }}
                >
                  {hasUniversityCard
                    ? `${uploadedFiles.length} ${t("filesSelected", language)}`
                    : t("uploadUniversityCard", language)}

                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    ref={universityCardRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setUploadedFiles((prev) => [...prev, ...files]);
                      if (universityCardRef.current) universityCardRef.current.value = "";
                    }}
                  />
                </Button>

                {hasUniversityCard && (
                  <Tooltip title={t("clearAll", language)}>
                    <Button
                      variant="outlined"
                      color="error"
                      sx={{ minWidth: { xs: "60px", md: "90px" }, minHeight: { xs: 48, md: 44 }, fontWeight: "bold" }}
                      onClick={() => {
                        setUploadedFiles([]);
                        if (universityCardRef.current) universityCardRef.current.value = "";
                      }}
                    >
                      X
                    </Button>
                  </Tooltip>
                )}
              </Stack>

              {/* Agree Policy (only for Clients) */}
              {selectedRole === "INSURANCE_CLIENT" && view === "USER" && (
                <FormControl
                  error={selectedRole === "INSURANCE_CLIENT" && !agreeToPolicy}
                  component="fieldset"
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={agreeToPolicy}
                        onChange={(e) => setAgreeToPolicy(e.target.checked)}
                        sx={{
                          color: "#7B8B5E",
                          "&.Mui-checked": { color: "#556B2F" },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "#2E3D2F" }}>
                        {t("agreeToPolicy", language)}
                      </Typography>
                    }
                  />
                  {!agreeToPolicy && (
                    <FormHelperText>{t("mustAgreeBeforeSignUp", language)}</FormHelperText>
                  )}
                </FormControl>
              )}

              {/* Go to Family view */}
              {selectedRole === "INSURANCE_CLIENT" && view === "USER" && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 2,
                    mb: 1,
                    minHeight: { xs: 48, md: 44 },
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                  onClick={() => {
                    if (!nationalId || !dateOfBirth) {
                      alert(t("completePersonalInfoFirst", language));
                      return;
                    }
                    if (calculateAge(dateOfBirth) < 18) {
                      alert(t("ageMustBe18", language));
                      return;
                    }
                    if (!agreeToPolicy) {
                      alert(t("mustAgreeToInsuranceFirst", language));
                      return;
                    }
                    if (!hasUniversityCard) {
                      alert(t("universityCardRequiredForFamily", language));
                      return;
                    }
                    setView("FAMILY");
                  }}
                >
                  {t("nextAddFamilyMembers", language)}
                </Button>
              )}
            </Box>
          </Collapse>

          {/* Family Members */}
          <Collapse in={view === "FAMILY" && selectedRole === "INSURANCE_CLIENT"} timeout={400}>
            <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px dashed #7B8B5E", borderRadius: 2, mt: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", fontSize: { xs: "0.95rem", md: "1rem" } }}>
                {t("familyMembers", language)}
              </Typography>

              {familyMembers.length === 0 && (
                <Typography variant="body2" sx={{ color: "#5d6b5d" }}>
                  {t("noFamilyMembersAdded", language)}
                </Typography>
              )}

              {familyMembers.map((member, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {t("memberNumber", language)} #{index + 1}
                    </Typography>
                    {familyMembers.length > 1 && (
                      <Tooltip title={t("removeMember", language)}>
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ minWidth: "50px", fontWeight: "bold" }}
                          onClick={() => removeFamilyMember(index)}
                        >
                          X
                        </Button>
                      </Tooltip>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label={t("insuranceNumberLabel", language)}
                    value={generatePreviewInsuranceNumber(index)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 18, color: "#7B8B5E" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t("firstName", language)}
                    value={member.firstName || ""}
                    onChange={(e) => updateFamilyMember(index, "firstName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t("middleName", language)}
                    value={member.middleName || ""}
                    onChange={(e) => updateFamilyMember(index, "middleName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t("lastName", language)}
                    value={member.lastName || ""}
                    onChange={(e) => updateFamilyMember(index, "lastName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t("nationalId", language)}
                    value={member.nationalId}
                    onChange={(e) => updateFamilyMember(index, "nationalId", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label={t("dateOfBirthLabel", language)}
                    InputLabelProps={{ shrink: true }}
                    value={member.dateOfBirth}
                    onChange={(e) => updateFamilyMember(index, "dateOfBirth", e.target.value)}
                    helperText={member.dateOfBirth ? `${t("age", language)}: ${calculateAge(member.dateOfBirth)}` : ""}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("gender", language)}
                    value={member.gender}
                    onChange={(e) => updateFamilyMember(index, "gender", e.target.value)}
                    sx={{ mb: 1 }}
                  >
                    {getGenders(language).map((g) => (
                      <MenuItem key={g.value} value={g.value}>
                        {g.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={t("relation", language)}
                    value={member.relationType}
                    onChange={(e) => updateFamilyMember(index, "relationType", e.target.value)}
                    sx={{ mb: 1 }}
                  >
                    {getRelationTypes(language).map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      component="label"
                      variant={(member.documents?.length || 0) > 0 ? "contained" : "outlined"}
                      fullWidth
                      sx={{
                        borderColor: (member.documents?.length || 0) > 0 ? "success.main" : "#7B8B5E",
                        color: (member.documents?.length || 0) > 0 ? "#fff" : "#7B8B5E",
                        backgroundColor: (member.documents?.length || 0) > 0 ? "success.main" : "transparent",
                        fontWeight: "bold",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor:
                            (member.documents?.length || 0) > 0 ? "success.dark" : "#f4f7ff",
                        },
                      }}
                    >
                      {member.documents?.length ? `${member.documents.length} ${t("filesSelected", language)}` : t("uploadDocuments", language)}
                      <input
                        hidden
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          updateFamilyMember(index, "documents", [
                            ...(member.documents || []),
                            ...files,
                          ]);
                          e.target.value = "";
                        }}
                      />
                    </Button>

                    {(member.documents?.length || 0) > 0 && (
                      <Tooltip title={t("clearAll", language)}>
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ minWidth: "90px", fontWeight: "bold" }}
                          onClick={() => updateFamilyMember(index, "documents", [])}
                        >
                          X
                        </Button>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              ))}

              <Button
                variant="contained"
                onClick={addFamilyMember}
                sx={{ mt: 1, minHeight: { xs: 44, md: 40 }, fontSize: { xs: "0.9rem", md: "1rem" } }}
                disabled={
                  familyMembers.length > 0 &&
                  !isFamilyMemberComplete(familyMembers[familyMembers.length - 1])
                }
              >
                {t("addMemberBtn", language)}
              </Button>
            </Box>
          </Collapse>

          <Box sx={{ mt: 2 }}>
            {view === "FAMILY" && (
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1, minHeight: { xs: 48, md: 44 }, fontSize: { xs: "0.9rem", md: "1rem" } }}
                onClick={() => setView("USER")}
              >
                {t("backToPersonalInfo", language)}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                minHeight: { xs: 48, md: 44 },
                fontSize: { xs: "0.95rem", md: "1rem" },
                py: { xs: 1.5, md: 1.25 },
              }}
            >
              {t("completeRegistration", language)}
            </Button>
          </Box>

          {/* Already have account */}
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: "0.85rem", md: "0.875rem" } }}>
                {t("alreadyHaveAccount", language)}{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("signin");
                  }}
                  style={{ color: "#556B2F", fontWeight: "600", textDecoration: "none" }}
                >
                  {t("signIn", language)}
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
});

SignUp.propTypes = {
  setMode: PropTypes.func.isRequired,
  setPendingEmail: PropTypes.func.isRequired,
};

export default SignUp;