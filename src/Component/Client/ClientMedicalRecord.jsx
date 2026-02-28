// src/Component/Client/ClientMedicalRecord.jsx
import React, { useEffect, useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { api, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import HealingIcon from "@mui/icons-material/Healing";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ClientMedicalRecord = memo(function ClientMedicalRecord({ user }) {
  const { language, isRTL } = useLanguage();
  const [records, setRecords] = useState(
    JSON.parse(localStorage.getItem("clientMedicalRecords")) || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      const token = getToken();
      if (!token || !user?.id) return;
      const res = await api.get(`${API_ENDPOINTS.MEDICAL_RECORDS.BY_MEMBER}/${user.id}`);
      setRecords(res.data);
      localStorage.setItem("clientMedicalRecords", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching medical records:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ✅ تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // ✅ ترتيب حسب التاريخ (الأحدث أولاً)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // ✅ تصفية حسب البحث
  const filteredRecords = sortedRecords.filter(
    (rec) =>
      rec.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!records || records.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6, color: "gray" }} dir={isRTL ? "rtl" : "ltr"}>
        <Typography variant="h5" fontWeight="bold">
          {t("noMedicalRecordsFound", language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* 📌 Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
            }}
          >
            <MedicalServicesIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
              {t("myMedicalRecords", language)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t("completeHistoryOfMedicalRecords", language)}
            </Typography>
          </Box>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {records.length}
              </Typography>
              <Typography variant="body2">{t("totalRecords", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {new Set(records.map((r) => r.doctorName)).size}
              </Typography>
              <Typography variant="body2">{t("doctors", language)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Section - No Filters */}
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8EDE0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            placeholder={t("searchMedicalRecords", language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#FAF8F5",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Results Count */}
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        {t("showing", language)} <strong>{filteredRecords.length}</strong> {t("medicalRecordCount", language)}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        {filteredRecords.map((rec) => (
          <Card
            key={rec.id}
            elevation={0}
            sx={{
              borderRadius: 3,
              height: "100%",
              minHeight: 320,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #E8EDE0",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 40px rgba(85, 107, 47, 0.2)",
                borderColor: "#556B2F",
              },
            }}
          >
              {/* Card Header */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, #E8EDE0 0%, #F5F5DC 100%)",
                  p: 1.5,
                  borderBottom: "2px solid #556B2F",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={1.2}>
                    <Avatar
                      sx={{
                        bgcolor: "#556B2F",
                        width: 38,
                        height: 38,
                      }}
                    >
                      <MedicalServicesIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          color: "#3D4F23",
                          fontSize: "0.95rem",
                        }}
                      >
                        {rec.diagnosis || t("medicalRecord", language)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#3D4F23",
                          opacity: 0.8,
                          fontSize: "0.72rem",
                        }}
                      >
                        {t("diagnosis", language)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip
                    label={t("recorded", language)}
                    sx={{
                      bgcolor: "#556B2F",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "0.65rem",
                      height: 22,
                    }}
                    icon={
                      <Box component="span" sx={{ fontSize: "12px", ml: 0.4 }}>
                        ✅
                      </Box>
                    }
                  />
                </Stack>
              </Box>

              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 2.2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.8,
                }}
              >
                {/* Doctor & Treatment Info */}
                <Grid container spacing={1.8}>
                  {/* Doctor */}
                  <Grid item xs={12} sm={rec.treatment ? 6 : 12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: "#E8EDE0",
                        border: "2px solid #7B8B5E",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "#F5F5DC",
                          transform: "translateY(-2px)",
                        },
                        minHeight: 80,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.4}>
                        <Avatar
                          sx={{
                            bgcolor: "#556B2F",
                            width: 36,
                            height: 36,
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#556B2F",
                              fontWeight: "700",
                              fontSize: "0.58rem",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                            }}
                          >
                            {t("doctor", language)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "600",
                              color: "#1e293b",
                              fontSize: "0.8rem",
                            }}
                          >
                            {t("dr", language)} {rec.doctorName || t("unknown", language)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Treatment */}
                  {rec.treatment && (
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.8,
                          borderRadius: 2,
                          bgcolor: "#f0fdf4",
                          border: "2px solid #d1fae5",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: "#d1fae5",
                            transform: "translateY(-2px)",
                          },
                          minHeight: 80,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.4}>
                          <Avatar
                            sx={{
                              bgcolor: "#10b981",
                              width: 36,
                              height: 36,
                            }}
                          >
                            <HealingIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#10b981",
                                fontWeight: "700",
                                fontSize: "0.58rem",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                              }}
                            >
                              {t("treatment", language)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "600",
                                color: "#1e293b",
                                fontSize: "0.8rem",
                              }}
                            >
                              {rec.treatment}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* Diagnosis & Date */}
                <Grid container spacing={1.8}>
                  {/* Diagnosis */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: "#fef3f2",
                        border: "2px solid #fee2e2",
                        minHeight: 90,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <MedicalServicesIcon sx={{ fontSize: 18, color: "#dc2626" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: "700",
                            color: "#dc2626",
                            fontSize: "0.58rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("diagnosis", language)}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "600",
                          color: "#1e293b",
                          fontSize: "0.8rem",
                        }}
                      >
                        {rec.diagnosis || t("notSpecified", language)}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Date */}
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        borderRadius: 2,
                        bgcolor: "#fef9f3",
                        border: "2px solid #fed7aa",
                        minHeight: 90,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: "700",
                            color: "#f59e0b",
                            fontSize: "0.58rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("recordDate", language)}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "600",
                          color: "#1e293b",
                          fontSize: "0.8rem",
                        }}
                      >
                        {formatDate(rec.createdAt)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Notes */}
                {rec.notes && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      bgcolor: "#FAF8F5",
                      border: "1px dashed #d1d5db",
                      minHeight: 70,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "700",
                        color: "#64748b",
                        fontSize: "0.58rem",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {t("notes", language)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#334155",
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {rec.notes}
                    </Typography>
                  </Paper>
                )}

                {/* Files */}
                {rec.files && rec.files.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.6,
                      borderRadius: 2,
                      bgcolor: "#f1f5f9",
                      border: "1px dashed #cbd5f5",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "700",
                        color: "#475569",
                        fontSize: "0.58rem",
                        letterSpacing: "0.3px",
                        textTransform: "uppercase",
                        mb: 0.6,
                      }}
                    >
                      {t("files", language)}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {rec.files.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                )}
              </CardContent>
          </Card>
        ))}
      </Box>

      {/* No Results Message */}
      {filteredRecords.length === 0 && searchTerm && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #d1d5db",
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: "#cbd5e0", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("noMedicalRecordsFound", language)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("tryAdjustingSearchTerms", language)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
});

ClientMedicalRecord.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullName: PropTypes.string,
  }),
};

export default ClientMedicalRecord;
