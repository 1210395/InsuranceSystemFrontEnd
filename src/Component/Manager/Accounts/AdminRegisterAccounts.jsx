import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Collapse,
  Stack,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

// Icons
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import SchoolIcon from "@mui/icons-material/School";

const getGenders = (language) => [
  { value: "MALE", label: t("male", language) || "ذكر" },
  { value: "FEMALE", label: t("female", language) || "أنثى" },
];

const getRelationTypes = (language) => [
  { value: "WIFE", label: t("wife", language) || "زوجة" },
  { value: "HUSBAND", label: "زوج" },
  { value: "SON", label: t("son", language) || "ابن" },
  { value: "DAUGHTER", label: t("daughter", language) || "ابنة" },
  { value: "FATHER", label: t("fatherRelation", language) || "أب" },
  { value: "MOTHER", label: t("motherRelation", language) || "أم" },
];

const getRoles = (language) => [
  { value: "INSURANCE_CLIENT", label: t("insuranceClient", language) || "عميل تأمين", icon: <SchoolIcon /> },
  { value: "DOCTOR", label: t("doctor", language) || "طبيب", icon: <LocalHospitalIcon /> },
  { value: "PHARMACIST", label: t("pharmacist", language) || "صيدلي", icon: <LocalPharmacyIcon /> },
  { value: "LAB_TECH", label: t("labEmployee", language) || "فني مختبر", icon: <ScienceIcon /> },
  { value: "RADIOLOGIST", label: t("radiologist", language) || "أخصائي أشعة", icon: <ScienceIcon /> },
  { value: "MEDICAL_ADMIN", label: "مسؤول طبي", icon: <WorkIcon /> },
  { value: "COORDINATION_ADMIN", label: "مسؤول تنسيق", icon: <WorkIcon /> },
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
  m.relation;

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
const isValidNationalId = (value) => /^\d{9}$/.test(value);

const getStepLabels = (language) => [
  t("personalInfo", language) || "المعلومات الشخصية",
  t("accountInfo", language) || "معلومات الحساب",
  t("roleSelection", language) || "اختيار الدور",
  t("documents", language) || "المستندات",
];

const AdminRegisterAccounts = () => {
  const { language, isRTL } = useLanguage();

  // Current step (0-3)
  const [activeStep, setActiveStep] = useState(0);

  // Form state - Step 1
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  // Form state - Step 2
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form state - Step 3
  const [selectedRole, setSelectedRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [pharmacyCode, setPharmacyCode] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyLocation, setPharmacyLocation] = useState("");
  const [labCode, setLabCode] = useState("");
  const [labName, setLabName] = useState("");
  const [labLocation, setLabLocation] = useState("");
  const [radiologyCode, setRadiologyCode] = useState("");
  const [radiologyName, setRadiologyName] = useState("");
  const [radiologyLocation, setRadiologyLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");

  // Form state - Step 4
  const [hasChronicDiseases, setHasChronicDiseases] = useState(false);
  const [chronicDiseases, setChronicDiseases] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [chronicDocuments, setChronicDocuments] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showFamilySection, setShowFamilySection] = useState(false);

  // Data lists
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [chronicDiseasesOptions, setChronicDiseasesOptions] = useState([]);
  const [loadingChronic, setLoadingChronic] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  const universityCardRef = useRef(null);
  const chronicDocsRef = useRef(null);

  const hasUniversityCard = uploadedFiles.length > 0;
  const passwordsMatch = () => password === confirmPassword;

  // Fetch specializations when DOCTOR selected
  useEffect(() => {
    const fetchSpecializations = async () => {
      if (selectedRole === "DOCTOR") {
        setLoadingSpecializations(true);
        try {
          const data = await api.get(API_ENDPOINTS.DOCTOR.SPECIALIZATIONS);
          setSpecializations(data || []);
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

  // Fetch chronic diseases when needed
  useEffect(() => {
    if (selectedRole === "INSURANCE_CLIENT" && hasChronicDiseases) {
      const fetchChronicDiseases = async () => {
        setLoadingChronic(true);
        try {
          const res = await api.get("/api/chronic-diseases");
          setChronicDiseasesOptions(res || []);
        } catch (err) {
          console.error("Failed to load chronic diseases", err);
          setChronicDiseasesOptions([]);
        } finally {
          setLoadingChronic(false);
        }
      };
      fetchChronicDiseases();
    }
  }, [selectedRole, hasChronicDiseases]);

  // Reset role-specific fields when role changes
  useEffect(() => {
    if (selectedRole !== "INSURANCE_CLIENT") {
      setFamilyMembers([]);
      setHasChronicDiseases(false);
      setChronicDiseases([]);
      setChronicDocuments([]);
    }
  }, [selectedRole]);

  const passwordStatus = () => {
    if (password === "") return "empty";
    if (isValidPassword(password)) return "valid";
    return "invalid";
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "اسم العائلة مطلوب";
    }
    if (!nationalId || !isValidNationalId(nationalId)) {
      newErrors.nationalId = "رقم الهوية يجب أن يتكون من 9 أرقام";
    }
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "تاريخ الميلاد مطلوب";
    } else if (calculateAge(dateOfBirth) < 18) {
      newErrors.dateOfBirth = "يجب أن يكون العمر 18 سنة على الأقل";
    }
    if (!gender) {
      newErrors.gender = "يرجى اختيار الجنس";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!isValidEmail(email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
    }
    if (!phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    }
    if (!password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (!isValidPassword(password)) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف وأرقام ورموز";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (!passwordsMatch()) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.selectedRole = "يرجى اختيار الدور";
      setErrors(newErrors);
      return false;
    }

    if (selectedRole === "LAB_TECH") {
      if (!labCode.trim()) newErrors.labCode = "كود المختبر مطلوب";
      if (!labName.trim()) newErrors.labName = "اسم المختبر مطلوب";
    }

    if (selectedRole === "RADIOLOGIST") {
      if (!radiologyCode.trim()) newErrors.radiologyCode = "كود الأشعة مطلوب";
      if (!radiologyName.trim()) newErrors.radiologyName = "اسم مركز الأشعة مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};

    if (selectedRole === "INSURANCE_CLIENT") {
      if (hasChronicDiseases && chronicDiseases.length === 0) {
        newErrors.chronicDiseases = "يرجى اختيار مرض مزمن واحد على الأقل";
      }
      if (hasChronicDiseases && chronicDocuments.length === 0) {
        newErrors.chronicDocuments = "يرجى رفع وثائق الأمراض المزمنة";
      }

      // Validate family members
      if (familyMembers.length > 0) {
        for (let i = 0; i < familyMembers.length; i++) {
          const m = familyMembers[i];
          if (!isFamilyMemberComplete(m)) {
            newErrors.familyMembers = "يرجى إكمال جميع حقول أفراد العائلة";
            break;
          }

          const age = calculateAge(m.dateOfBirth);
          if (age !== "") {
            if (["SON", "DAUGHTER"].includes(m.relation) && age > 25) {
              newErrors.familyMembers = "يجب أن يكون عمر الابن/الابنة أقل من 25 سنة";
              break;
            }
            if (!["SON", "DAUGHTER"].includes(m.relation) && age < 18) {
              newErrors.familyMembers = "يجب أن يكون عمر فرد العائلة البالغ 18 سنة على الأقل";
              break;
            }
          }
        }

        const ids = familyMembers.map((m) => m.nationalId);
        if (new Set(ids).size !== ids.length) {
          newErrors.familyMembers = "يوجد رقم هوية مكرر بين أفراد العائلة";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      case 2:
        isValid = validateStep3();
        break;
      case 3:
        isValid = validateStep4();
        if (isValid) {
          handleSubmit();
          return;
        }
        break;
      default:
        isValid = true;
    }

    if (isValid && activeStep < 3) {
      setActiveStep((prev) => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const addFamilyMember = () => {
    if (familyMembers.length > 0) {
      const last = familyMembers[familyMembers.length - 1];
      if (!isFamilyMemberComplete(last)) {
        setErrorMsg("يرجى إكمال بيانات فرد العائلة الحالي قبل إضافة فرد جديد");
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
        relation: "",
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

  const resetForm = () => {
    setActiveStep(0);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setNationalId("");
    setDateOfBirth("");
    setGender("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setSelectedRole("");
    setEmployeeId("");
    setSelectedSpecialization("");
    setClinicLocation("");
    setPharmacyCode("");
    setPharmacyName("");
    setPharmacyLocation("");
    setLabCode("");
    setLabName("");
    setLabLocation("");
    setRadiologyCode("");
    setRadiologyName("");
    setRadiologyLocation("");
    setDepartment("");
    setFaculty("");
    setHasChronicDiseases(false);
    setChronicDiseases([]);
    setUploadedFiles([]);
    setChronicDocuments([]);
    setFamilyMembers([]);
    setShowFamilySection(false);
    setErrors({});
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const fullName = buildFullName(firstName, middleName, lastName);

    const payload = {
      fullName,
      nationalId: nationalId.trim(),
      email: email.trim(),
      phone,
      password,
      desiredRole: selectedRole,
      dateOfBirth,
      gender,
      employeeId: employeeId || `EMP${nationalId}`,
    };

    if (selectedRole === "INSURANCE_CLIENT") {
      payload.department = department;
      payload.faculty = faculty;
      payload.hasChronicDiseases = hasChronicDiseases;
      payload.chronicDiseases = chronicDiseases;
    } else if (selectedRole === "DOCTOR") {
      payload.specialization = selectedSpecialization;
      payload.clinicLocation = clinicLocation;
    } else if (selectedRole === "PHARMACIST") {
      payload.pharmacyCode = pharmacyCode;
      payload.pharmacyName = pharmacyName;
      payload.pharmacyLocation = pharmacyLocation;
    } else if (selectedRole === "LAB_TECH") {
      payload.labCode = labCode.trim();
      payload.labName = labName.trim();
      if (labLocation) payload.labLocation = labLocation.trim();
    } else if (selectedRole === "RADIOLOGIST") {
      payload.radiologyCode = radiologyCode.trim();
      payload.radiologyName = radiologyName.trim();
      if (radiologyLocation) payload.radiologyLocation = radiologyLocation.trim();
    }

    payload.familyMembers = familyMembers
      .filter(isFamilyMemberComplete)
      .map((m) => ({
        fullName: buildFullName(m.firstName, m.middleName, m.lastName),
        nationalId: m.nationalId,
        dateOfBirth: m.dateOfBirth,
        gender: m.gender,
        relation: m.relation,
      }));

    try {
      const data = new FormData();

      uploadedFiles.forEach((f) => data.append("universityCard", f));

      data.append("data", JSON.stringify(payload));

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

      await api.post(`${API_ENDPOINTS.AUTH.REGISTER}/admin`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("✅ تم إنشاء الحساب بنجاح!");
      resetForm();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "فشل التسجيل. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#1E8EAB" }}>
        المعلومات الشخصية
      </Typography>

      <TextField
        margin="normal"
        size="small"
        required
        fullWidth
        label="الاسم الأول"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={!!errors.firstName}
        helperText={errors.firstName}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: "#1E8EAB" }} />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        label="الاسم الأوسط"
        value={middleName}
        onChange={(e) => setMiddleName(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: "#1E8EAB" }} />
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
        label="اسم العائلة"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={!!errors.lastName}
        helperText={errors.lastName}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon sx={{ color: "#1E8EAB" }} />
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
        label="رقم الهوية"
        value={nationalId}
        onChange={(e) => {
          let val = e.target.value.replace(/\D/g, "");
          if (val.length > 9) val = val.slice(0, 9);
          setNationalId(val);
        }}
        error={!!errors.nationalId}
        helperText={errors.nationalId}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BadgeIcon sx={{ color: "#1E8EAB" }} />
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
        label="تاريخ الميلاد"
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        error={!!errors.dateOfBirth}
        helperText={errors.dateOfBirth || (dateOfBirth ? `العمر: ${calculateAge(dateOfBirth)}` : "")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonthIcon sx={{ color: "#1E8EAB" }} />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      />

      <TextField
        select
        fullWidth
        size="small"
        margin="normal"
        label="الجنس"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        error={!!errors.gender}
        helperText={errors.gender}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      >
        <MenuItem value="">-- اختر الجنس --</MenuItem>
        {getGenders(language).map((g) => (
          <MenuItem key={g.value} value={g.value}>
            {g.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  // Step 2: Account Information
  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#1E8EAB" }}>
        معلومات الحساب
      </Typography>

      <TextField
        margin="normal"
        size="small"
        required
        fullWidth
        label="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        error={!!errors.email}
        helperText={errors.email}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon sx={{ color: "#1E8EAB" }} />
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
        label="رقم الهاتف"
        value={phone}
        placeholder="05XXXXXXXX"
        onChange={(e) => {
          let val = e.target.value.replace(/\D/g, "");
          if (val.length > 10) val = val.slice(0, 10);
          setPhone(val);
        }}
        error={!!errors.phone}
        helperText={errors.phone}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon sx={{ color: "#1E8EAB" }} />
            </InputAdornment>
          ),
          inputMode: "numeric",
        }}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      />

      <Tooltip
        title={
          passwordStatus() === "invalid"
            ? "كلمة المرور ضعيفة"
            : passwordStatus() === "valid"
            ? "كلمة المرور قوية ✓"
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
          label="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
          error={!!errors.password || passwordStatus() === "invalid"}
          helperText={errors.password || (passwordStatus() === "valid" ? "كلمة المرور قوية ✓" : "")}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon
                  sx={{
                    color:
                      passwordStatus() === "empty"
                        ? "#1E8EAB"
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
                    ? undefined
                    : passwordStatus() === "valid"
                    ? "success.main"
                    : "error.main",
              },
            },
          }}
          InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
        />
      </Tooltip>

      <TextField
        margin="normal"
        size="small"
        required
        fullWidth
        label="تأكيد كلمة المرور"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ""))}
        error={!!errors.confirmPassword || (confirmPassword !== "" && !passwordsMatch())}
        helperText={errors.confirmPassword || (confirmPassword !== "" && !passwordsMatch() ? "كلمتا المرور غير متطابقتين" : "")}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon
                sx={{
                  color:
                    confirmPassword === ""
                      ? "#1E8EAB"
                      : passwordsMatch()
                      ? "success.main"
                      : "error.main",
                }}
              />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      />
    </Box>
  );

  // Step 3: Role Selection
  const renderStep3 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#1E8EAB" }}>
        اختيار الدور
      </Typography>

      <TextField
        margin="normal"
        size="small"
        select
        fullWidth
        required
        label="الدور المطلوب"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        error={!!errors.selectedRole}
        helperText={errors.selectedRole}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <WorkIcon sx={{ color: "#1E8EAB" }} />
            </InputAdornment>
          ),
        }}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      >
        <MenuItem value="">-- اختر الدور --</MenuItem>
        {getRoles(language).map((r) => (
          <MenuItem key={r.value} value={r.value}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {r.icon}
              {r.label}
            </Box>
          </MenuItem>
        ))}
      </TextField>

      {/* Employee ID - for all roles */}
      <TextField
        margin="normal"
        size="small"
        fullWidth
        label="رقم الموظف"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
      />

      {/* INSURANCE_CLIENT fields */}
      <Collapse in={selectedRole === "INSURANCE_CLIENT"}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}>
            تفاصيل العميل
          </Typography>

          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="القسم"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="الكلية"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
        </Box>
      </Collapse>

      {/* DOCTOR fields */}
      <Collapse in={selectedRole === "DOCTOR"}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}>
            تفاصيل الطبيب
          </Typography>

          <TextField
            margin="normal"
            size="small"
            select
            fullWidth
            label="التخصص"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            disabled={loadingSpecializations}
            helperText={loadingSpecializations ? "جاري تحميل التخصصات..." : ""}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          >
            <MenuItem value="">-- اختر التخصص --</MenuItem>
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
            label="موقع العيادة"
            value={clinicLocation}
            onChange={(e) => setClinicLocation(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
        </Box>
      </Collapse>

      {/* PHARMACIST fields */}
      <Collapse in={selectedRole === "PHARMACIST"}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}>
            تفاصيل الصيدلي
          </Typography>

          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="كود الصيدلية"
            value={pharmacyCode}
            onChange={(e) => setPharmacyCode(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="اسم الصيدلية"
            value={pharmacyName}
            onChange={(e) => setPharmacyName(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="موقع الصيدلية"
            value={pharmacyLocation}
            onChange={(e) => setPharmacyLocation(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
        </Box>
      </Collapse>

      {/* LAB_TECH fields */}
      <Collapse in={selectedRole === "LAB_TECH"}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}>
            تفاصيل فني المختبر
          </Typography>

          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="كود المختبر"
            value={labCode}
            onChange={(e) => setLabCode(e.target.value)}
            error={!!errors.labCode}
            helperText={errors.labCode}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="اسم المختبر"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            error={!!errors.labName}
            helperText={errors.labName}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="موقع المختبر"
            value={labLocation}
            onChange={(e) => setLabLocation(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
        </Box>
      </Collapse>

      {/* RADIOLOGIST fields */}
      <Collapse in={selectedRole === "RADIOLOGIST"}>
        <Box sx={{ mt: 2, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}>
            تفاصيل أخصائي الأشعة
          </Typography>

          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="كود الأشعة"
            value={radiologyCode}
            onChange={(e) => setRadiologyCode(e.target.value)}
            error={!!errors.radiologyCode}
            helperText={errors.radiologyCode}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            label="اسم مركز الأشعة"
            value={radiologyName}
            onChange={(e) => setRadiologyName(e.target.value)}
            error={!!errors.radiologyName}
            helperText={errors.radiologyName}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            label="موقع مركز الأشعة"
            value={radiologyLocation}
            onChange={(e) => setRadiologyLocation(e.target.value)}
            InputLabelProps={{ shrink: true, style: { color: "#000", fontWeight: "bold" } }}
          />
        </Box>
      </Collapse>
    </Box>
  );

  // Step 4: Documents
  const renderStep4 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#1E8EAB" }}>
        رفع المستندات
      </Typography>

      {/* University Card Upload */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          البطاقة الجامعية
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            component="label"
            variant={hasUniversityCard ? "contained" : "outlined"}
            fullWidth
            sx={{
              borderColor: hasUniversityCard ? "success.main" : "#1E8EAB",
              color: hasUniversityCard ? "#fff" : "#1E8EAB",
              backgroundColor: hasUniversityCard ? "success.main" : "transparent",
              borderRadius: "10px",
              fontWeight: "bold",
              textTransform: "none",
              minHeight: { xs: 48, md: 44 },
              "&:hover": {
                backgroundColor: hasUniversityCard ? "success.dark" : "#f4f7ff",
              },
            }}
          >
            {hasUniversityCard
              ? `${uploadedFiles.length} ملفات مختارة`
              : "رفع البطاقة الجامعية"}

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
            <Tooltip title="مسح الكل">
              <Button
                variant="outlined"
                color="error"
                sx={{ minWidth: { xs: "60px", md: "90px" }, fontWeight: "bold" }}
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
      </Box>

      {/* Insurance Client specific documents */}
      {selectedRole === "INSURANCE_CLIENT" && (
        <>
          {/* Chronic Diseases Section */}
          <Box sx={{ mb: 3, p: 2, border: "1px solid #E8EDE0", borderRadius: 2 }}>
            <FormControlLabel
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
              label="هل يعاني من أمراض مزمنة؟"
            />

            <Collapse in={hasChronicDiseases}>
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  multiple
                  loading={loadingChronic}
                  options={chronicDiseasesOptions}
                  value={chronicDiseasesOptions.filter((d) => chronicDiseases.includes(d.code))}
                  onChange={(_, values) => setChronicDiseases(values.map((v) => v.code))}
                  getOptionLabel={(option) => option.name}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option.name}
                          {...tagProps}
                          sx={{ borderRadius: 2, fontWeight: "bold" }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="الأمراض المزمنة"
                      placeholder="اختر الأمراض"
                      size="small"
                      error={!!errors.chronicDiseases}
                      helperText={errors.chronicDiseases}
                    />
                  )}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    component="label"
                    variant={chronicDocuments.length ? "contained" : "outlined"}
                    fullWidth
                    sx={{
                      borderColor: chronicDocuments.length ? "success.main" : errors.chronicDocuments ? "error.main" : "#1E8EAB",
                      color: chronicDocuments.length ? "#fff" : "#1E8EAB",
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
                      ? `${chronicDocuments.length} ملفات مختارة`
                      : "رفع وثائق الأمراض المزمنة"}
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
                    <Tooltip title="مسح الكل">
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
                {errors.chronicDocuments && (
                  <FormHelperText error>{errors.chronicDocuments}</FormHelperText>
                )}
              </Box>
            </Collapse>
          </Box>

          {/* Family Members Section */}
          <Box sx={{ mb: 3, p: 2, border: "1px dashed #1E8EAB", borderRadius: 2 }}>
            <Button
              variant="text"
              onClick={() => setShowFamilySection(!showFamilySection)}
              sx={{ mb: 1, fontWeight: "bold", color: "#1E8EAB" }}
            >
              {showFamilySection ? "▼" : "►"} أفراد العائلة ({familyMembers.length})
            </Button>

            <Collapse in={showFamilySection}>
              {familyMembers.length === 0 && (
                <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                  لم يتم إضافة أفراد العائلة بعد
                </Typography>
              )}

              {familyMembers.map((member, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      فرد العائلة #{index + 1}
                    </Typography>
                    <Tooltip title="حذف">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => removeFamilyMember(index)}
                      >
                        X
                      </Button>
                    </Tooltip>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="الاسم الأول"
                    value={member.firstName || ""}
                    onChange={(e) => updateFamilyMember(index, "firstName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="الاسم الأوسط"
                    value={member.middleName || ""}
                    onChange={(e) => updateFamilyMember(index, "middleName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="اسم العائلة"
                    value={member.lastName || ""}
                    onChange={(e) => updateFamilyMember(index, "lastName", e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="رقم الهوية"
                    value={member.nationalId}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 9) val = val.slice(0, 9);
                      updateFamilyMember(index, "nationalId", val);
                    }}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="تاريخ الميلاد"
                    InputLabelProps={{ shrink: true }}
                    value={member.dateOfBirth}
                    onChange={(e) => updateFamilyMember(index, "dateOfBirth", e.target.value)}
                    helperText={member.dateOfBirth ? `العمر: ${calculateAge(member.dateOfBirth)}` : ""}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="الجنس"
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
                    label="صلة القرابة"
                    value={member.relation}
                    onChange={(e) => updateFamilyMember(index, "relation", e.target.value)}
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
                        borderColor: (member.documents?.length || 0) > 0 ? "success.main" : "#1E8EAB",
                        color: (member.documents?.length || 0) > 0 ? "#fff" : "#1E8EAB",
                        backgroundColor: (member.documents?.length || 0) > 0 ? "success.main" : "transparent",
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                    >
                      {member.documents?.length ? `${member.documents.length} ملفات` : "رفع المستندات"}
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
                      <Tooltip title="مسح الكل">
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

              {errors.familyMembers && (
                <FormHelperText error sx={{ mb: 1 }}>{errors.familyMembers}</FormHelperText>
              )}

              <Button
                variant="contained"
                onClick={addFamilyMember}
                sx={{ mt: 1, backgroundColor: "#1E8EAB", "&:hover": { backgroundColor: "#156a80" } }}
                disabled={
                  familyMembers.length > 0 &&
                  !isFamilyMemberComplete(familyMembers[familyMembers.length - 1])
                }
              >
                ➕ إضافة فرد عائلة
              </Button>
            </Collapse>
          </Box>
        </>
      )}
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      default:
        return null;
    }
  };

  const stepLabels = getStepLabels(language);

  return (
    <Box sx={{ display: "flex" }} dir="rtl">
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          background: "linear-gradient(180deg, #f3f7ff 0%, #e8effc 100%)",
          minHeight: "100vh",
          mr: "240px",
        }}
      >
        <Header />

        <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={10}
            sx={{
              p: { xs: 2, md: 4 },
              width: "100%",
              maxWidth: "650px",
              borderRadius: 4,
              background: "linear-gradient(145deg, #FFFFFF, #f3f7ff)",
              boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
              border: "1px solid rgba(30,142,171,0.15)",
            }}
          >
            {/* Header */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: "#1E8EAB", width: 56, height: 56, mb: 1 }}>
                <PersonAddAlt1Icon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" color="#150380">
                تسجيل حساب جديد
              </Typography>
              <Typography variant="body2" color="#666">
                المدير - إدارة الحسابات
              </Typography>
            </Box>

            {/* Stepper Progress Indicator */}
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                width: "100%",
                mb: 3,
                "& .MuiStepLabel-label": {
                  fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.875rem" },
                },
                "& .MuiStepIcon-root.Mui-active": {
                  color: "#1E8EAB",
                },
                "& .MuiStepIcon-root.Mui-completed": {
                  color: "#1E8EAB",
                },
              }}
            >
              {stepLabels.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: "350px" }}>
              {renderStepContent()}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  flex: 1,
                  minHeight: 48,
                  fontWeight: "bold",
                  borderColor: "#1E8EAB",
                  color: "#1E8EAB",
                  "&:hover": {
                    borderColor: "#150380",
                    backgroundColor: "#f4f7ff",
                  },
                  "&:disabled": {
                    borderColor: "#ccc",
                    color: "#ccc",
                  },
                }}
              >
                السابق
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{
                  flex: 1,
                  minHeight: 48,
                  fontWeight: "bold",
                  background: "linear-gradient(90deg,#150380,#1E8EAB)",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={26} color="inherit" />
                ) : activeStep === 3 ? (
                  "إنشاء الحساب"
                ) : (
                  "التالي"
                )}
              </Button>
            </Box>
          </Paper>
        </Box>

        <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg("")}>
          <Alert severity="success">{successMsg}</Alert>
        </Snackbar>
        <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg("")}>
          <Alert severity="error">{errorMsg}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminRegisterAccounts;
