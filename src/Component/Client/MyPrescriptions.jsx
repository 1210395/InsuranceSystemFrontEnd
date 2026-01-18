// src/Component/Client/MyPrescriptions.jsx
import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Divider,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const MyPrescriptions = memo(({ prescriptions = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const { language, isRTL } = useLanguage();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get family member info from DTO (extracted by mapper) or parse from notes/treatment field
  const getFamilyMemberInfo = (prescription) => {
    // First, try to use DTO fields (if mapper has extracted them)
    if (prescription.isFamilyMember === true && prescription.familyMemberName) {
      const info = {
        name: prescription.familyMemberName,
        relation: prescription.familyMemberRelation,
        insuranceNumber: prescription.familyMemberInsuranceNumber,
        age: prescription.familyMemberAge || null,
        gender: prescription.familyMemberGender || null,
      };
      return info;
    }
    
    // Fallback: Parse from notes or treatment field
    const textToParse = prescription.notes || prescription.treatment || "";
    
    if (textToParse) {
      // Pattern 1: With age and gender (new format)
      let familyMemberPattern = /Family\s+Member:\s*([^-]+?)\s*\(([^)]+)\)\s*-\s*Insurance:\s*([^-]+?)\s*-\s*Age:\s*([^-]+?)\s*-\s*Gender:\s*([^\n\r]+?)(?:\n|$|$)/i;
      let match = textToParse.match(familyMemberPattern);
      
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
      match = textToParse.match(familyMemberPattern);
      
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
          icon: "⏳"
        };
      case "billed":
        return {
          color: "success",
          label: t("billed", language),
          bgcolor: "#E8F5E9",
          textColor: "#2E7D32",
          icon: "💊"
        };
      case "rejected":
        return {
          color: "error",
          label: t("rejected", language),
          bgcolor: "#FFEBEE",
          textColor: "#C62828",
          icon: "❌"
        };
      default:
        return {
          color: "default",
          label: t("unknown", language),
          bgcolor: "#FAF8F5",
          textColor: "#5d6b5d",
          icon: "❓"
        };
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Box dir={isRTL ? "rtl" : "ltr"} sx={{ textAlign: "center", py: 6, color: "gray" }}>
        <Typography variant="h5" fontWeight="bold">
          {t("noPrescriptionsFound", language)}
        </Typography>
      </Box>
    );
  }

  // ✅ ترتيب الوصفات حسب التاريخ (الأحدث أولاً)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // ✅ تصفية الوصفات حسب البحث والحالة (استبعاد VERIFIED)
  const filteredPrescriptions = sortedPrescriptions
    .filter((p) => p.status?.toLowerCase() !== "verified") // ✅ Exclude VERIFIED
    .filter((p) => {
      // البحث
      const matchesSearch =
        p.items?.some(item => 
          item.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        p.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pharmacistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      // تصفية الحالة
      const matchesStatus =
        filterStatus === "ALL" ||
        p.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

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
            <DescriptionIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
              {t("myPrescriptions", language)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t("viewManagePrescriptions", language)}
            </Typography>
          </Box>
        </Stack>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {prescriptions.filter(p => p.status?.toLowerCase() !== "verified").length}
              </Typography>
              <Typography variant="body2">{t("totalPrescriptions", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {prescriptions.filter(p => p.status?.toLowerCase() === "billed").length}
              </Typography>
              <Typography variant="body2">{t("billed", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {prescriptions.filter(p => p.status?.toLowerCase() === "pending").length}
              </Typography>
              <Typography variant="body2">{t("pending", language)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: 2,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="h4" fontWeight="700">
                {prescriptions.filter(p => p.status?.toLowerCase() === "rejected").length}
              </Typography>
              <Typography variant="body2">{t("rejected", language)}</Typography>
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
              placeholder={t("searchByMedicineDoctorPharmacist", language)}
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
                  { status: "ALL", label: t("all", language), count: prescriptions.filter((p) => p.status?.toLowerCase() !== "verified").length },
                  { status: "PENDING", label: t("pending", language), count: prescriptions.filter((p) => p.status?.toLowerCase() === "pending").length },
                  { status: "REJECTED", label: t("rejected", language), count: prescriptions.filter((p) => p.status?.toLowerCase() === "rejected").length },
                  { status: "BILLED", label: t("billed", language), count: prescriptions.filter((p) => p.status?.toLowerCase() === "billed").length },
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
                        : status === "REJECTED"
                        ? "error"
                        : status === "BILLED"
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
        {t("showing", language)} <strong>{filteredPrescriptions.length}</strong> {t("prescription", language)}{filteredPrescriptions.length !== 1 && language === "en" ? 's' : ''}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        }}
      >
        {filteredPrescriptions.map((p) => {
          const status = getStatusStyle(p.status);

          return (
            <Card
              key={p.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                height: "100%",
                minHeight: 400,
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
                    background: `linear-gradient(135deg, ${status.bgcolor} 0%, ${status.bgcolor}dd 100%)`,
                    p: 2,
                    borderBottom: `3px solid ${status.textColor}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar
                        sx={{
                          bgcolor: status.textColor,
                          width: 44,
                          height: 44,
                        }}
                      >
                        <MedicationIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            color: status.textColor,
                            fontSize: "1rem",
                          }}
                        >
                          {p.items?.length || 0} {t("medicines", language)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: status.textColor,
                            opacity: 0.8,
                            fontSize: "0.8rem",
                          }}
                        >
                          {t("prescription", language)}
                        </Typography>
                        {/* ✅ عرض الكمية للوصفات المزمنة في الكارد */}
                        {p.isChronic && p.items && p.items.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {p.items.map((item, idx) => (
                              item.calculatedQuantity && (
                                <Typography
                                  key={idx}
                                  variant="caption"
                                  sx={{
                                    color: "#dc2626",
                                    fontWeight: "700",
                                    fontSize: "0.75rem",
                                    display: "block",
                                  }}
                                >
                                  {item.medicineName}: {item.calculatedQuantity} {item.form?.toUpperCase() === "TABLET" || item.form?.toUpperCase() === "CAPSULE" ? "pill(s)" : item.form?.toUpperCase() === "INJECTION" ? "injection(s)" : "unit(s)"}
                                </Typography>
                              )
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {/* ✅ عرض علامة Chronic Disease للوصفات المزمنة */}
                      {p.isChronic && (
                        <Chip
                          label={t("chronicDisease", language)}
                          sx={{
                            bgcolor: "#dc2626",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "0.7rem",
                            height: 24,
                            border: "2px solid #991b1b",
                          }}
                          icon={
                            <Box component="span" sx={{ fontSize: "12px", ml: 0.5 }}>
                              ⚠️
                            </Box>
                          }
                        />
                      )}
                      <Chip
                        label={status.label}
                        sx={{
                          bgcolor: status.textColor,
                          color: "white",
                          fontWeight: "600",
                          fontSize: "0.75rem",
                          height: 26,
                        }}
                        icon={
                          <Box component="span" sx={{ fontSize: "14px", ml: 0.5 }}>
                            {status.icon}
                          </Box>
                        }
                      />
                    </Stack>
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Doctor & Pharmacist Info */}
                  <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                    {/* Doctor */}
                    <Grid item xs={12} sm={p.pharmacistName ? 6 : 12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "#F5F5DC",
                          border: "2px solid #E8EDE0",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            bgcolor: "#E8EDE0",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: "#556B2F",
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
                                color: "#556B2F",
                                fontWeight: "700",
                                fontSize: "0.65rem",
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
                                fontSize: "0.9rem",
                              }}
                            >
                              {t("doctor", language)} {p.doctorName || t("unknown", language)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Pharmacist */}
                    {p.pharmacistName && (
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
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
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                bgcolor: "#10b981",
                                width: 45,
                                height: 45,
                              }}
                            >
                              <LocalPharmacyIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#10b981",
                                  fontWeight: "700",
                                  fontSize: "0.65rem",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {t("pharmacist", language)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {p.pharmacistName}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {/* Patient Info - Show only for family members when pharmacist has approved (status is not pending) */}
                  {p.status?.toLowerCase() !== "pending" && (() => {
                    const familyMemberInfo = getFamilyMemberInfo(p);
                    return familyMemberInfo ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: "#fff7ed",
                          border: "2px solid #fb923c",
                          mb: 2.5,
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
                                {familyMemberInfo.relation} of {p.memberName}
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
                                {p.memberName}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </Paper>
                    ) : null;
                  })()}

                  {/* Medicines Accordion */}
                  <Accordion elevation={0} sx={{ bgcolor: "#FAF8F5", mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MedicationIcon sx={{ color: "#556B2F" }} />
                        <Typography variant="body2" fontWeight={600}>
                          {t("viewMedicines", language)}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={1.5}>
                        {p.items && p.items.length > 0 ? (
                          p.items.map((item, idx) => (
                            <Paper
                              key={idx}
                              elevation={0}
                              sx={{ p: 1.5, bgcolor: "#fff", border: "1px solid #E8EDE0" }}
                            >
                              <Typography variant="body2" fontWeight={600}>
                                {item.medicineName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.scientificName}
                              </Typography>
                              <Divider sx={{ my: 0.5 }} />
                              {/* ✅ للوصفات المزمنة: عرض الكمية و Valid until فقط */}
                              {p.isChronic ? (
                                <>
                                  {item.calculatedQuantity && (
                                    <Typography variant="caption" display="block" sx={{ color: "#dc2626", fontWeight: 600 }}>
                                      <b>Quantity:</b> {item.calculatedQuantity} {item.form?.toUpperCase() === "TABLET" || item.form?.toUpperCase() === "CAPSULE" ? "pill(s)" : item.form?.toUpperCase() === "INJECTION" ? "injection(s)" : "unit(s)"}
                                    </Typography>
                                  )}
                                  {item.expiryDate && (
                                    <Typography variant="caption" display="block" color="warning.main">
                                      <b>Valid until:</b> {formatDate(item.expiryDate)}
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Typography variant="caption" display="block">
                                    <b>Dosage:</b> {item.dosage} pill(s) • {item.timesPerDay} times/day • {item.dosage * item.timesPerDay} pills/day
                                  </Typography>
                                  {item.expiryDate && (
                                    <Typography variant="caption" display="block" color="warning.main">
                                      <b>Valid until:</b> {formatDate(item.expiryDate)}
                                    </Typography>
                                  )}
                                </>
                              )}
                            </Paper>
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t("noMedicines", language)}
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>

                  {/* Notes */}
                  {p.notes && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: "#fff3e0" }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <StickyNote2Icon sx={{ color: "#f57c00", fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} color="#f57c00" display="block">
                            {t("notes", language)}:
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.notes}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Date */}
                  <Paper elevation={0} sx={{ p: 1.5, mt: 2, bgcolor: "#fef9f3", border: "1px solid #fed7aa" }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                      <Typography variant="caption" color="text.secondary">
                        <b>{t("issued", language)}:</b> {formatDate(p.createdAt)}
                      </Typography>
                    </Stack>
                  </Paper>
                </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* No Results Message */}
      {filteredPrescriptions.length === 0 && searchTerm && (
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
            {t("noPrescriptionsFound", language)}
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

MyPrescriptions.propTypes = {
  prescriptions: PropTypes.array,
};

export default MyPrescriptions;