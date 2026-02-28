import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BiotechIcon from "@mui/icons-material/Biotech";
import Divider from "@mui/material/Divider";
import { API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const MyLabRequests = memo(function MyLabRequests({ labRequests = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const { language, isRTL } = useLanguage();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get family member info from DTO (extracted by mapper) or parse from notes field
  const getFamilyMemberInfo = (request) => {
    // First, try to use DTO fields (if mapper has extracted them)
    if (request.isFamilyMember === true && request.familyMemberName) {
      const info = {
        name: request.familyMemberName,
        relation: request.familyMemberRelation,
        insuranceNumber: request.familyMemberInsuranceNumber,
        age: request.familyMemberAge || null,
        gender: request.familyMemberGender || null,
      };
      return info;
    }
    
    // Fallback: Parse from notes field
    if (request.notes) {
      // Pattern 1: With age and gender (new format)
      let familyMemberPattern = /Family\s+Member:\s*([^-]+?)\s*\(([^)]+)\)\s*-\s*Insurance:\s*([^-]+?)\s*-\s*Age:\s*([^-]+?)\s*-\s*Gender:\s*([^\n\r]+?)(?:\n|$|$)/i;
      let match = request.notes.match(familyMemberPattern);
      
      if (match && match.length >= 6) {
        let age = match[4] ? match[4].trim() : null;
        let gender = match[5] ? match[5].trim() : null;
        
        // Handle "N/A" or empty values
        if (!age || age === "N/A" || age === "N/A years" || age === "null" || age === "") age = null;
        if (!gender || gender === "N/A" || gender === "null" || gender === "") gender = null;
        
        return {
          name: match[1].trim(),
          relation: match[2].trim(),
          insuranceNumber: match[3].trim(),
          age: age,
          gender: gender,
        };
      }
      
      // Pattern 2: Without age and gender (old format)
      familyMemberPattern = /Family\s+Member:\s*([^-]+?)\s*\(([^)]+)\)\s*-\s*Insurance:\s*([^\n\r]+?)(?:\n|$)/i;
      match = request.notes.match(familyMemberPattern);
      
      if (match) {
        return {
          name: match[1].trim(),
          relation: match[2].trim(),
          insuranceNumber: match[3].trim(),
          age: null,
          gender: null,
        };
      }
    }
    
    return null;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          color: "warning",
          label: t("pending", language),
          bgcolor: "#FFF3E0",
          textColor: "#E65100",
          icon: "⏳",
        };
      case "completed":
        return {
          color: "success",
          label: t("completed", language),
          bgcolor: "#E8F5E9",
          textColor: "#2E7D32",
          icon: "✅",
        };
      case "rejected":
        return {
          color: "error",
          label: t("rejected", language),
          bgcolor: "#FFEBEE",
          textColor: "#C62828",
          icon: "❌",
        };
      default:
        return {
          color: "default",
          label: t("unknown", language),
          bgcolor: "#FAF8F5",
          textColor: "#5d6b5d",
          icon: "❓",
        };
    }
  };

  if (!labRequests || labRequests.length === 0) {
    return (
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ textAlign: "center", py: 6, color: "gray" }}>
        <Typography variant="h5" fontWeight="bold">
          {t("noLabRequestsFound", language)}
        </Typography>
      </Box>
    );
  }

  // ✅ ترتيب الطلبات حسب التاريخ (الأحدث أولاً)
  const sortedLabRequests = [...labRequests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // ✅ تصفية حسب البحث والحالة
  const filteredLabRequests = sortedLabRequests.filter(
    (r) => {
      // البحث
      const matchesSearch =
        r.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.labTechName?.toLowerCase().includes(searchTerm.toLowerCase());

      // تصفية الحالة
      const matchesStatus =
        filterStatus === "ALL" ||
        r.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    }
  );

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: { xs: 2, md: 4 }, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Box>
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
            <ScienceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
              {t("myLabRequests", language)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t("viewTrackLabRequests", language)}
            </Typography>
          </Box>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {labRequests.length}
              </Typography>
              <Typography variant="body2">{t("totalRequests", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {
                  labRequests.filter((r) => r.status?.toLowerCase() === "completed")
                    .length
                }
              </Typography>
              <Typography variant="body2">{t("completed", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {
                  labRequests.filter((r) => r.status?.toLowerCase() === "pending")
                    .length
                }
              </Typography>
              <Typography variant="body2">{t("pending", language)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filter & Search Section */}
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8EDE0", mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Search Bar */}
            <TextField
              placeholder={t("searchByTestDoctorLabTech", language)}
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

            {/* Filter Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                }}
              >
                {t("filterByStatus", language)}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  { status: "ALL", label: t("all", language), count: labRequests.length },
                  { status: "PENDING", label: t("pending", language), count: labRequests.filter((r) => r.status?.toLowerCase() === "pending").length },
                  { status: "COMPLETED", label: t("completed", language), count: labRequests.filter((r) => r.status?.toLowerCase() === "completed").length },
                ].map(({ status, label, count }) => (
                  <Chip
                    key={status}
                    label={`${label} (${count})`}
                    onClick={() => setFilterStatus(status)}
                    variant={filterStatus === status ? "filled" : "outlined"}
                    color={
                      status === "ALL"
                        ? filterStatus === "ALL"
                          ? "primary"
                          : "default"
                        : status === "COMPLETED"
                        ? "success"
                        : "warning"
                    }
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        {t("showing", language)} <strong>{filteredLabRequests.length}</strong> {t("labRequests", language).toLowerCase()}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        }}
      >
        {filteredLabRequests.map((r) => {
          const status = getStatusStyle(r.status);

          return (
            <Card
              key={r.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                height: "100%",
                minHeight: 310,
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
                {/* Card Header with Status */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${status.bgcolor} 0%, ${status.bgcolor}cc 100%)`,
                    p: 1.4,
                    borderBottom: `2px solid ${status.textColor}`,
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
                          bgcolor: status.textColor,
                          width: 36,
                          height: 36,
                        }}
                      >
                        <BiotechIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "700",
                            color: status.textColor,
                            fontSize: "0.9rem",
                          }}
                        >
                          {r.testName || "N/A"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: status.textColor,
                            opacity: 0.8,
                            fontSize: "0.7rem",
                          }}
                        >
                          {t("labTest", language)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={status.label}
                      sx={{
                        bgcolor: status.textColor,
                        color: "white",
                        fontWeight: "600",
                        fontSize: "0.65rem",
                        height: 24,
                      }}
                      icon={
                        <Box component="span" sx={{ fontSize: "12px", ml: 0.5 }}>
                          {status.icon}
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
                  {/* Doctor & Lab Tech Info */}
                  <Grid container spacing={2}>
                    {/* Doctor */}
                    <Grid item xs={12} sm={r.labTechName ? 6 : 12}>
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
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.4}>
                          <Avatar
                            sx={{
                              bgcolor: "#556B2F",
                              width: 38,
                              height: 38,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#556B2F",
                                fontWeight: "700",
                                fontSize: "0.58rem",
                                letterSpacing: "0.3px",
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
                              {t("doctor", language)} {r.doctorName || t("unknown", language)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Lab Tech */}
                    {r.labTechName && (
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
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.4}>
                            <Avatar
                              sx={{
                                bgcolor: "#7B8B5E",
                                width: 38,
                                height: 38,
                              }}
                            >
                              <ScienceIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#7B8B5E",
                                  fontWeight: "700",
                                  fontSize: "0.58rem",
                                  letterSpacing: "0.3px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("labTechnician", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {r.labTechName}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {/* Patient Info - Show only for family members when request is not pending */}
                  {r.status?.toLowerCase() !== "pending" && (() => {
                    const familyMemberInfo = getFamilyMemberInfo(r);
                    return familyMemberInfo ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "#fff7ed",
                          border: "2px solid #fb923c",
                          mb: 1.8,
                        }}
                      >
                        {/* Family Member Info */}
                        <Stack spacing={1.5}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                bgcolor: "#fb923c",
                                width: 45,
                                height: 45,
                              }}
                            >
                              <PersonIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#fb923c",
                                  fontWeight: "700",
                                  fontSize: "0.65rem",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("familyMember", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {familyMemberInfo.name}
                              </Typography>
                            </Box>
                          </Stack>
                          <Divider />
                          <Stack spacing={1}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#9a3412",
                                  fontWeight: "600",
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("relation", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  fontSize: "0.85rem",
                                  mt: 0.25,
                                }}
                              >
                                {familyMemberInfo.relation} {t("of", language)} {r.memberName || t("mainClient", language)}
                              </Typography>
                            </Box>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#9a3412",
                                    fontWeight: "600",
                                    fontSize: "0.7rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {t("age", language)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "600",
                                    color: familyMemberInfo.age ? "#1e293b" : "#94a3b8",
                                    fontSize: "0.85rem",
                                    mt: 0.25,
                                    fontStyle: familyMemberInfo.age ? "normal" : "italic",
                                  }}
                                >
                                  {familyMemberInfo.age || t("notAvailable", language)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#9a3412",
                                    fontWeight: "600",
                                    fontSize: "0.7rem",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {t("gender", language)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: "600",
                                    color: familyMemberInfo.gender ? "#1e293b" : "#94a3b8",
                                    fontSize: "0.85rem",
                                    mt: 0.25,
                                    fontStyle: familyMemberInfo.gender ? "normal" : "italic",
                                  }}
                                >
                                  {familyMemberInfo.gender || t("notAvailable", language)}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#9a3412",
                                  fontWeight: "600",
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("insuranceNumber", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  fontSize: "0.85rem",
                                  mt: 0.25,
                                }}
                              >
                                {familyMemberInfo.insuranceNumber}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#9a3412",
                                  fontWeight: "600",
                                  fontSize: "0.7rem",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("mainClient", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "500",
                                  color: "#64748b",
                                  fontSize: "0.8rem",
                                  mt: 0.25,
                                }}
                              >
                                {r.memberName || t("unknown", language)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    ) : null;
                  })()}

                  {/* Approved Price - يظهر فقط بعد الرفع */}
                  {r.approvedPrice && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f0fdf4",
                        border: "2px solid #86efac",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "700",
                          color: "#22c55e",
                          fontSize: "0.6rem",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("approvedPrice", language)}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          color: "#16a34a",
                          fontSize: "1.1rem",
                          mt: 0.5,
                        }}
                      >
                        {r.approvedPrice} د.ك
                      </Typography>
                    </Paper>
                  )}

                  {/* Date */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: 2,
                      bgcolor: "#fef9f3",
                      border: "1px solid #fed7aa",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "700",
                          color: "#f59e0b",
                          fontSize: "0.58rem",
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                        }}
                      >
                        {t("requestDate", language)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "0.82rem",
                      }}
                    >
                      {formatDate(r.createdAt)}
                    </Typography>
                  </Paper>

                  <Box sx={{ mt: "auto" }}>
                    {r.resultUrl ? (
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<InsertDriveFileIcon />}
                        href={
                          r.resultUrl.startsWith("http")
                            ? r.resultUrl
                            : `${API_BASE_URL}${r.resultUrl}`
                        }
                        target="_blank"
                        sx={{
                          mt: 0.5,
                          py: 1.1,
                          textTransform: "none",
                          fontWeight: "600",
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
                          },
                        }}
                      >
                        {t("downloadResult", language)}
                      </Button>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.6,
                          mt: 0.5,
                          borderRadius: 2,
                          bgcolor: "#FAF8F5",
                          border: "1px dashed #d1d5db",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          {t("noResultAvailableYet", language)}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* No Results Message */}
      {filteredLabRequests.length === 0 && searchTerm && (
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
            {t("noLabRequestsFound", language)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("tryAdjustingSearch", language)}
          </Typography>
        </Paper>
      )}
      </Box>
    </Box>
  );
});

MyLabRequests.propTypes = {
  labRequests: PropTypes.array,
};

export default MyLabRequests;