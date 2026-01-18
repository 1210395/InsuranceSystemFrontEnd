// src/Component/Shared/ConsultationPrices.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const ConsultationPrices = () => {
  const { language, isRTL } = useLanguage();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_ENDPOINTS.DOCTOR.SPECIALIZATIONS);
        setSpecializations(res || []);
      } catch (err) {
        console.error("Error fetching specializations:", err);
        setSpecializations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecializations();
  }, []);

  const filteredSpecializations = useMemo(() => {
    if (!searchTerm) return specializations;
    return specializations.filter((spec) =>
      spec.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [specializations, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    if (specializations.length === 0) return { count: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 };
    const prices = specializations.map((s) => s.consultationPrice || 0);
    return {
      count: specializations.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    };
  }, [specializations]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress sx={{ color: "#556B2F" }} />
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#2d3748",
            mb: 1,
          }}
        >
          {t("consultationPrices", language)}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("consultationPricesDesc", language)}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Paper
          sx={{
            p: 2,
            flex: "1 1 200px",
            background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
            color: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(85, 107, 47, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocalHospitalIcon />
            <Typography variant="subtitle2">{t("totalSpecializations", language)}</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {stats.count}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            flex: "1 1 200px",
            background: "linear-gradient(135deg, #8B9A46 0%, #A8B56B 100%)",
            color: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(139, 154, 70, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AttachMoneyIcon />
            <Typography variant="subtitle2">{t("priceRange", language)}</Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold">
            {stats.minPrice} - {stats.maxPrice} ₪
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            flex: "1 1 200px",
            background: "linear-gradient(135deg, #C9A646 0%, #DDB85C 100%)",
            color: "#fff",
            borderRadius: 3,
            boxShadow: "0 4px 15px rgba(201, 166, 70, 0.3)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AttachMoneyIcon />
            <Typography variant="subtitle2">{t("averagePrice", language)}</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {stats.avgPrice} ₪
          </Typography>
        </Paper>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("searchSpecialization", language)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#556B2F" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: "#556B2F",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#556B2F",
              },
            },
          }}
        />
      </Box>

      {/* Table */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f7fa" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#2d3748",
                  py: 2,
                }}
              >
                {t("specialization", language)}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#2d3748",
                  py: 2,
                }}
              >
                {t("consultationPrice", language)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSpecializations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {t("noSpecializationsFound", language)}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSpecializations.map((spec) => (
                <TableRow
                  key={spec.id}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#FAF8F5",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fafbfc",
                    },
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <LocalHospitalIcon sx={{ color: "#556B2F", fontSize: 24 }} />
                      <Typography variant="body1" fontWeight={500}>
                        {spec.displayName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={`${spec.consultationPrice} ₪`}
                      sx={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        px: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Footer note */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, fontStyle: "italic" }}
      >
        {t("consultationPricesNote", language)}
      </Typography>
    </Box>
  );
};

export default ConsultationPrices;
