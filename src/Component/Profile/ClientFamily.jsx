import React, { useEffect, useState } from "react";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const buildFullName = (first, middle, last) =>
  `${first} ${middle} ${last}`.replace(/\s+/g, " ").trim();


const relations = ["WIFE", "SON", "DAUGHTER", "FATHER", "MOTHER"];
const genders = ["MALE", "FEMALE"];

const ClientFamily = () => {
  const { language, isRTL } = useLanguage();
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const [formData, setFormData] = useState({
     firstName: "",
  middleName: "",
  lastName: "",

    fullName: "",
    nationalId: "",
    dateOfBirth: "",
    gender: "",
    relation: "",
documents: [], // Array<File>
  });

  /* ================= FETCH ================= */
  const fetchFamily = async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.MY);
      // api.get returns response.data directly
      setFamily(res || []);
    } catch (err) {
      console.error("Failed to fetch family:", err);
      setFamily([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  /* ================= STATUS CHIP ================= */
  const renderStatusChip = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Chip
            icon={<VerifiedUserIcon />}
            label={t("active", language)}
            color="success"
            size="small"
          />
        );
      case "PENDING":
        return (
          <Chip
            label={t("pendingMedicalReview", language)}
            color="warning"
            size="small"
          />
        );
      case "REJECTED":
        return (
          <Chip
            label={t("rejected", language)}
            color="error"
            size="small"
          />
        );
      default:
        return null;
    }
  };
const handleChange = (e) => {
  const updated = { ...formData, [e.target.name]: e.target.value };

  updated.fullName = buildFullName(
    updated.firstName,
    updated.middleName,
    updated.lastName
  );

  setFormData(updated);
};

const validateAge = () => {
  if (!formData.dateOfBirth || !formData.relation) return true;

  const birth = new Date(formData.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (
    (formData.relation === "SON" || formData.relation === "DAUGHTER") &&
    age > 22
  ) {
    alert(t("childrenAgeLimit", language));
    return false;
  }

  if (
    (formData.relation === "FATHER" || formData.relation === "MOTHER") &&
    age > 100
  ) {
    alert(t("parentsAgeLimit", language));
    return false;
  }

  return true;
};

  const handleSubmit = async () => {
      if (!validateAge()) return;
    const data = new FormData();
    data.append(
      "data",
      new Blob(
        [
          JSON.stringify({
            fullName: formData.fullName,
            nationalId: formData.nationalId,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            relation: formData.relation,
          }),
        ],
        { type: "application/json" }
      )
    );

formData.documents.forEach((file) => {
  data.append("documents", file);
});

    try {
      await api.post("/api/family-members/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOpenAdd(false);
     setFormData({
  firstName: "",
  middleName: "",
  lastName: "",
  fullName: "",
  nationalId: "",
  dateOfBirth: "",
  gender: "",
  relation: "",
documents: [],
});


      fetchFamily();
    } catch (err) {
      alert(err.response?.data?.message || t("failedToAddFamilyMember", language));
    }
  };

  /* ================= UI ================= */
  return (
    <Box sx={{ mt: 2 }} dir={isRTL ? "rtl" : "ltr"}>
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    mb={4}
  >
            <Typography variant="h4" fontWeight="bold">
              👨‍👩‍👧‍👦 {t("familyMembers", language)}
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setOpenAdd(true)}
              sx={{
                background: "linear-gradient(90deg,#150380,#1E8EAB)",
              }}
            >
              {t("addMember", language)}
            </Button>
          </Stack>

          {loading ? (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
          {(family || []).map((member) => {
  const status = member.status?.trim().toUpperCase();
  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";

  return (
    <Grid item xs={12} sm={6} lg={4} key={member.id}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isPending && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              backgroundColor: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Chip
              label={`⏳ ${t("pendingMedicalReview", language)}`}
              color="warning"
              sx={{ fontWeight: "bold", fontSize: 14 }}
            />
          </Box>
        )}

        <Box
          sx={{
            filter: isPending ? "blur(2px)" : "none",
            pointerEvents: isPending ? "none" : "auto",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Avatar sx={{ bgcolor: "#1E8EAB" }}>
              <PersonIcon />
            </Avatar>

            <Box flexGrow={1}>
              <Typography fontWeight="bold">
                {member.fullName}
              </Typography>
              <Chip
                size="small"
                icon={<FamilyRestroomIcon />}
                label={member.relation}
              />
            </Box>

            {renderStatusChip(status)}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {isApproved ? (
            <>
              <Typography variant="body2">
                <BadgeIcon fontSize="small" />{" "}
                <strong>{t("nationalIdLabel", language)}</strong> {member.nationalId}
              </Typography>

              <Typography variant="body2">
                <CalendarMonthIcon fontSize="small" />{" "}
                <strong>{t("dateOfBirthLabel", language)}</strong> {member.dateOfBirth}
              </Typography>

              <Typography variant="body2">
                {member.gender === "MALE" ? <MaleIcon /> : <FemaleIcon />}{" "}
                <strong>{t("genderLabel", language)}</strong> {member.gender}
              </Typography>

              <Chip
                sx={{ mt: 1 }}
                color="info"
                label={`${t("insuranceNumberLabel", language)} ${member.insuranceNumber}`}
              />

            {member.documentImages?.map((img, i) => (
  <Button
    key={i}
    fullWidth
    sx={{ mt: 1 }}
    startIcon={<DescriptionIcon />}
    href={`${API_BASE_URL}${img}`}
    target="_blank"
  >
    {t("viewDocument", language)} {i + 1}
  </Button>
))}

            </>
          ) : (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: "gray",
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              {t("waitingForMedicalApproval", language)}
              <br />
              {t("detailsVisibleAfterApproval", language)}
            </Typography>
          )}
        </Box>
      </Paper>
    </Grid>
  );
})}
</Grid>  
)}


      {/* ADD DIALOG */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth>
        <DialogTitle>➕ {t("addFamilyMember", language)}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
<TextField
  label={t("firstName", language)}
  name="firstName"
  onChange={handleChange}
  required
/>

<TextField
  label={t("middleName", language)}
  name="middleName"
  onChange={handleChange}
/>

<TextField
  label={t("lastName", language)}
  name="lastName"
  onChange={handleChange}
  required
/>
            <TextField label={t("nationalId", language)} name="nationalId" onChange={handleChange} />
            <TextField type="date" name="dateOfBirth" onChange={handleChange} />
            <TextField select name="gender" label={t("gender", language)} onChange={handleChange}>
              {genders.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </TextField>
            <TextField select name="relation" label={t("relation", language)} onChange={handleChange}>
              {relations.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <Button component="label" startIcon={<UploadFileIcon />}>
              {t("uploadDocument", language)}
             <input
  hidden
  type="file"
  multiple
  accept="image/*"
  onChange={(e) =>
    setFormData({
      ...formData,
      documents: [...formData.documents, ...Array.from(e.target.files)],
    })
  }
/>
{formData.documents.length > 0 && (
  <Stack direction="row" spacing={2} flexWrap="wrap">
    {formData.documents.map((file, index) => (
      <Box key={index} sx={{ position: "relative" }}>
        <Avatar
          src={URL.createObjectURL(file)}
          variant="rounded"
          sx={{ width: 90, height: 90 }}
        />
        <Button
          size="small"
          color="error"
          onClick={() =>
            setFormData({
              ...formData,
              documents: formData.documents.filter((_, i) => i !== index),
            })
          }
        >
          {t("delete", language)}
        </Button>
      </Box>
    ))}
  </Stack>
)}

            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>{t("cancel", language)}</Button>
          <Button variant="contained" onClick={handleSubmit}>{t("submit", language)}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientFamily;
