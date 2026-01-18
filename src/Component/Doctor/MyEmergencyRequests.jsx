import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EventIcon from "@mui/icons-material/Event";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { api, getToken } from "../../utils/apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const MyEmergencyRequests = ({ emergencyRequests = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const _isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { language, isRTL } = useLanguage();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [_searchResults, setSearchResults] = useState([]); // Store found clients by employee ID
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchRequests = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    try {
      const data = await api.get(API_ENDPOINTS.EMERGENCIES.DOCTOR_MY_REQUESTS);
      console.log("✅ Emergency Requests fetched:", data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching emergency requests:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load emergency requests. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Search for client by employee ID or name
  useEffect(() => {
    const searchClient = async () => {
      if (!searchTerm || searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      const trimmedSearch = searchTerm.trim();

      // If it looks like an employee ID (numbers), search by employee ID
      if (/^\d+$/.test(trimmedSearch)) {
        setSearchLoading(true);
        const token = getToken();
        if (!token) {
          setSearchLoading(false);
          return;
        }

        try {
          const data = await api.get(API_ENDPOINTS.CLIENTS.SEARCH_BY_EMPLOYEE_ID(trimmedSearch));

          if (data && data.fullName) {
            setSearchResults([data]);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.error("❌ Error searching by employee ID:", err);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        // For text search, we'll filter by name in the frontend
        setSearchResults([]);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(searchClient, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // استخدم البيانات من الـ API أو الـ prop
  const displayRequests = requests.length > 0 ? requests : emergencyRequests;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING_MEDICAL":
        return {
          color: "warning",
          label: "PENDING_MEDICAL",
          bgcolor: "#FFF3E0",
          textColor: "#E65100",
          icon: "⏳",
        };
      case "APPROVED_BY_MEDICAL":
        return {
          color: "success",
          label: "APPROVED_BY_MEDICAL",
          bgcolor: "#E8F5E9",
          textColor: "#2E7D32",
          icon: "✅",
        };
      case "REJECTED_BY_MEDICAL":
        return {
          color: "error",
          label: "REJECTED_BY_MEDICAL",
          bgcolor: "#FFEBEE",
          textColor: "#C62828",
          icon: "❌",
        };
      default:
        return {
          color: "default",
          label: status || "Unknown",
          bgcolor: "#F5F5F5",
          textColor: "#757575",
          icon: "❓",
        };
    }
  };

  // ✅ ترتيب حسب التاريخ (الأحدث أولاً)
  const sortedRequests = [...(displayRequests || [])].sort((a, b) => {
    const dateA = a?.submittedAt || a?.incidentDate;
    const dateB = b?.submittedAt || b?.incidentDate;
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateB) - new Date(dateA);
  });

  // ✅ تصفية حسب البحث والحالة
  const filteredRequests = sortedRequests.filter(
    (r) => {
      // Normalize status for comparison
      const reqStatus = r.status?.toUpperCase();
      const filterStatusUpper = filterStatus.toUpperCase();
      const statusMatches = filterStatus === "ALL" || reqStatus === filterStatusUpper;

      // Search by patient name and national ID
      if (!searchTerm || searchTerm.trim() === "") {
        // If no search term, show all (filtered by status only)
        return statusMatches;
      }

      const searchLower = searchTerm.toLowerCase().trim();
      
      // Search by member name (case-insensitive, partial match)
      const matchesName = r.memberName?.toLowerCase().includes(searchLower) || false;
      
      // Search by National ID (main client)
      const matchesNationalId = r.memberNationalId?.toLowerCase().includes(searchLower) || false;
      
      // Search by family member info if exists
      const matchesFamilyMemberName = (r.isFamilyMember && r.familyMemberName?.toLowerCase().includes(searchLower)) || false;
      const matchesFamilyMemberNationalId = (r.isFamilyMember && r.familyMemberNationalId?.toLowerCase().includes(searchLower)) || false;
      
      const matchesSearch = matchesName || matchesNationalId || matchesFamilyMemberName || matchesFamilyMemberNationalId;

      return matchesSearch && statusMatches;
    }
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("loadingEmergencyRequests", language)}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!displayRequests || displayRequests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "#4A5D4A" }}>
        <Typography variant="h5" fontWeight="bold">
          {t("noEmergencyRequests", language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: { xs: 1.5, sm: 2, md: 4 }, py: { xs: 2, md: 3 }, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Box>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: { xs: 2, md: 4 },
            borderRadius: { xs: 2, md: 4 },
            background: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
            color: "white",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={{ xs: 1.5, md: 2 }} mb={2}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: { xs: 44, md: 56 },
                height: { xs: 44, md: 56 },
                display: { xs: "none", sm: "flex" },
              }}
            >
              <WarningIcon sx={{ fontSize: { xs: 26, md: 32 } }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5, fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                {t("emergencyRequestsTitle", language)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: "0.8rem", sm: "0.875rem", md: "1rem" }, display: { xs: "none", sm: "block" } }}>
                {t("viewAndManageEmergency", language)}
              </Typography>
            </Box>
          </Stack>

          {/* Stats Summary */}
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mt: { xs: 1, md: 2 } }}>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                  {displayRequests.length}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" } }}>{t("total", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                  {
                    displayRequests.filter(
                      (r) => r.status?.toUpperCase() === "PENDING_MEDICAL"
                    ).length
                  }
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" } }}>{t("pending", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                  {
                    displayRequests.filter(
                      (r) => r.status?.toUpperCase() === "APPROVED_BY_MEDICAL"
                    ).length
                  }
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" } }}>{t("approved", language)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: { xs: 1.5, md: 2 },
                  borderRadius: { xs: 1.5, md: 2 },
                  backdropFilter: "blur(10px)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" } }}>
                  {
                    displayRequests.filter(
                      (r) => r.status?.toUpperCase() === "REJECTED_BY_MEDICAL"
                    ).length
                  }
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.875rem" } }}>{t("rejected", language)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Filter & Search Section */}
        <Card elevation={0} sx={{ borderRadius: { xs: 2, md: 4 }, border: "1px solid #E8EDE0", mb: { xs: 2, md: 4 } }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {/* Search Bar */}
              <TextField
                placeholder={isMobile ? t("searchPlaceholderMobile", language) : t("searchPlaceholder", language)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? (
                        <CircularProgress size={isMobile ? 16 : 20} sx={{ color: "text.secondary" }} />
                      ) : (
                        <SearchIcon sx={{ color: "text.secondary", fontSize: { xs: 20, md: 24 } }} />
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: { xs: 1.5, md: 2 },
                    bgcolor: "#FAF8F5",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  },
                }}
              />

              {/* Filter Section */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: { xs: 1, md: 1.5 },
                    color: "#1e293b",
                    textTransform: "uppercase",
                    fontSize: { xs: "0.65rem", md: "0.75rem" },
                    letterSpacing: "0.5px",
                  }}
                >
                  {t("filterByStatus", language)}
                </Typography>
                <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} flexWrap="wrap" useFlexGap sx={{ gap: { xs: "6px", md: "8px" } }}>
                  {[
                    { status: "ALL", count: displayRequests.length, label: "ALL" },
                    { 
                      status: "PENDING_MEDICAL", 
                      count: displayRequests.filter((r) => 
                        r.status?.toUpperCase() === "PENDING_MEDICAL"
                      ).length,
                      label: "PENDING MEDICAL"
                    },
                    { 
                      status: "APPROVED_BY_MEDICAL", 
                      count: displayRequests.filter((r) => 
                        r.status?.toUpperCase() === "APPROVED_BY_MEDICAL"
                      ).length,
                      label: "APPROVED BY MEDICAL"
                    },
                    { 
                      status: "REJECTED_BY_MEDICAL", 
                      count: displayRequests.filter((r) => 
                        r.status?.toUpperCase() === "REJECTED_BY_MEDICAL"
                      ).length,
                      label: "REJECTED BY MEDICAL"
                    },
                  ].map(({ status, count, label }) => (
                      <Chip
                        key={status}
                        label={isMobile ? `${label.split(" ")[0]} (${count})` : `${label} (${count})`}
                        onClick={() => setFilterStatus(status)}
                        variant={filterStatus === status ? "filled" : "outlined"}
                        size={isMobile ? "small" : "medium"}
                        color={
                          status === "ALL"
                            ? filterStatus === "ALL"
                              ? "primary"
                              : "default"
                            : status === "APPROVED_BY_MEDICAL"
                            ? "success"
                            : status === "REJECTED_BY_MEDICAL"
                            ? "error"
                            : "warning"
                        }
                        sx={{
                          fontWeight: 600,
                          borderRadius: { xs: 1.5, md: 2 },
                          cursor: "pointer",
                          fontSize: { xs: "0.65rem", md: "0.8rem" },
                          "& .MuiChip-label": {
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            maxWidth: { xs: "100px", md: "200px" },
                            px: { xs: 1, md: 1.5 },
                          },
                        }}
                      />
                    ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Results Count */}
        <Typography variant="body1" sx={{ mb: { xs: 2, md: 3 }, color: "#4A5D4A", fontSize: { xs: "0.85rem", md: "1rem" } }}>
          {t("showingResults", language)} <strong>{filteredRequests.length}</strong> {filteredRequests.length !== 1 ? t("emergencyRequestPlural", language) : t("emergencyRequestSingular", language)}
        </Typography>

        {/* Grid of Cards - Responsive */}
        <Box
          sx={{
            display: "grid",
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {filteredRequests.map((r) => {
            const status = getStatusStyle(r.status);
            
            // Get family member info from DTO
            const isFamilyMember = r.isFamilyMember === true && r.familyMemberName;
            
            // Get university card image
            const universityCardImage = r.universityCardImage || 
                                      (r.universityCardImages && r.universityCardImages.length > 0 ? r.universityCardImages[0] : null);
            
            // Format age and gender
            let displayAge = r.memberAge || null;
            let displayGender = r.memberGender || null;
            
            if (displayAge && typeof displayAge === 'string') {
              displayAge = displayAge.trim();
              if (/^\d+$/.test(displayAge)) {
                displayAge = `${displayAge} years`;
              }
            }
            
            if (displayGender && typeof displayGender === 'string') {
              displayGender = displayGender.trim();
              if (displayGender.length > 0) {
                displayGender = displayGender.charAt(0).toUpperCase() + displayGender.slice(1).toLowerCase();
              }
            }

            return (
              <Card
                key={r.id}
                elevation={0}
                sx={{
                  borderRadius: { xs: 2, md: 3 },
                  height: "100%",
                  minHeight: { xs: "auto", md: 420 },
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #E8EDE0",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: { xs: "none", md: "translateY(-8px)" },
                    boxShadow: { xs: "0 4px 20px rgba(220, 38, 38, 0.15)", md: "0 12px 40px rgba(220, 38, 38, 0.2)" },
                    borderColor: "#DC2626",
                  },
                }}
              >
                {/* Card Header with Status */}
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${status.bgcolor} 0%, ${status.bgcolor}dd 100%)`,
                    p: { xs: 1.5, md: 2 },
                    borderBottom: `3px solid ${status.textColor}`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: status.textColor,
                          width: { xs: 36, md: 44 },
                          height: { xs: 36, md: 44 },
                        }}
                      >
                        <WarningIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            color: status.textColor,
                            fontSize: { xs: "0.85rem", md: "1rem" },
                          }}
                        >
                          {t("emergencyCardTitle", language)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: status.textColor,
                            opacity: 0.8,
                            fontSize: { xs: "0.7rem", md: "0.8rem" },
                          }}
                        >
                          {t("emergencyCardSubtitle", language)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        maxWidth: "200px",
                      }}
                    >
                      <Chip
                        label={status.label}
                        sx={{
                          bgcolor: status.textColor,
                          color: "white",
                          fontWeight: "600",
                          fontSize: "0.65rem",
                          height: "auto",
                          minHeight: 28,
                          maxWidth: "100%",
                          "& .MuiChip-label": {
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            padding: "6px 10px",
                            lineHeight: 1.3,
                            display: "block",
                            textAlign: "center",
                          },
                        }}
                        icon={
                          <Box component="span" sx={{ fontSize: "12px", ml: 0.5 }}>
                            {status.icon}
                          </Box>
                        }
                      />
                    </Box>
                  </Stack>
                </Box>

                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                  {/* Patient Info */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.5, md: 2.5 },
                      borderRadius: { xs: 1.5, md: 2 },
                      bgcolor: isFamilyMember ? "#fff7ed" : "#fee2e2",
                      border: isFamilyMember ? "2px solid #fb923c" : "2px solid #fecaca",
                      mb: { xs: 2, md: 2.5 },
                    }}
                  >
                    {isFamilyMember ? (
                      // Family Member Info
                      <Stack spacing={1.5}>
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
                          {t("familyMemberLabel", language)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b" }}>
                          {r.familyMemberName || "-"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                          {t("relationLabel", language)}: {r.familyMemberRelation || "-"}
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("ageLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {r.familyMemberAge || t("notAvailable", language)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("genderLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {r.familyMemberGender || t("notAvailable", language)}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Main Client Info */}
                        <Divider sx={{ my: 1.5 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#dc2626",
                            fontWeight: "700",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("mainClientLabel", language)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b" }}>
                          {r.memberName || "-"}
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("ageLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {displayAge || t("notAvailable", language)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("genderLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {displayGender || t("notAvailable", language)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#dc2626",
                              fontWeight: "600",
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              mb: 1,
                              display: "block",
                            }}
                          >
                            {t("universityCardLabel", language)}
                          </Typography>
                          <Avatar
                            src={
                              universityCardImage
                                ? universityCardImage.startsWith("http")
                                  ? universityCardImage
                                  : `${API_BASE_URL}${universityCardImage}`
                                : null
                            }
                            onClick={() => {
                              if (universityCardImage) {
                                const imageUrl = universityCardImage.startsWith("http")
                                  ? universityCardImage
                                  : `${API_BASE_URL}${universityCardImage}`;
                                setSelectedImage(imageUrl);
                                setImageViewerOpen(true);
                              }
                            }}
                            sx={{
                              width: 80,
                              height: 80,
                              cursor: universityCardImage ? "pointer" : "default",
                              border: universityCardImage ? "2px solid #dc2626" : "2px solid #d1d5db",
                              "&:hover": universityCardImage ? {
                                opacity: 0.9,
                                transform: "scale(1.05)",
                                transition: "all 0.2s ease",
                                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                              } : {},
                            }}
                          >
                            {universityCardImage ? null : <PersonIcon sx={{ fontSize: 40 }} />}
                          </Avatar>
                        </Box>
                      </Stack>
                    ) : (
                      // Main Client Info
                      <Stack spacing={1.5}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#DC2626",
                            fontWeight: "700",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("patientName", language)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600", color: "#1e293b" }}>
                          {r.memberName || "-"}
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("ageLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {displayAge || t("notAvailable", language)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {t("genderLabel", language)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                              {displayGender || t("notAvailable", language)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#dc2626",
                              fontWeight: "600",
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              mb: 1,
                              display: "block",
                            }}
                          >
                            {t("universityCardLabel", language)}
                          </Typography>
                          <Avatar
                            src={
                              universityCardImage
                                ? universityCardImage.startsWith("http")
                                  ? universityCardImage
                                  : `${API_BASE_URL}${universityCardImage}`
                                : null
                            }
                            onClick={() => {
                              if (universityCardImage) {
                                const imageUrl = universityCardImage.startsWith("http")
                                  ? universityCardImage
                                  : `${API_BASE_URL}${universityCardImage}`;
                                setSelectedImage(imageUrl);
                                setImageViewerOpen(true);
                              }
                            }}
                            sx={{
                              width: 80,
                              height: 80,
                              cursor: universityCardImage ? "pointer" : "default",
                              border: universityCardImage ? "2px solid #dc2626" : "2px solid #d1d5db",
                              "&:hover": universityCardImage ? {
                                opacity: 0.9,
                                transform: "scale(1.05)",
                                transition: "all 0.2s ease",
                                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                              } : {},
                            }}
                          >
                            {universityCardImage ? null : <PersonIcon sx={{ fontSize: 40 }} />}
                          </Avatar>
                        </Box>
                      </Stack>
                    )}
                  </Paper>

                  <Divider sx={{ my: 2 }} />

                  {/* Details */}
                  <Stack spacing={1.8}>
                    {/* Location */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#7c3aed",
                          fontWeight: "700",
                          fontSize: "0.65rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <LocationOnIcon
                          sx={{
                            fontSize: 14,
                            mr: isRTL ? 0 : 0.5,
                            ml: isRTL ? 0.5 : 0,
                            verticalAlign: "middle",
                          }}
                        />
                        {t("locationLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#475569",
                          fontSize: "0.9rem",
                          mt: 0.3,
                        }}
                      >
                        {r.location || "-"}
                      </Typography>
                    </Box>

                    {/* Contact Phone */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#059669",
                          fontWeight: "700",
                          fontSize: "0.65rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <PhoneIcon
                          sx={{
                            fontSize: 14,
                            mr: isRTL ? 0 : 0.5,
                            ml: isRTL ? 0.5 : 0,
                            verticalAlign: "middle",
                          }}
                        />
                        {t("contactLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#475569",
                          fontSize: "0.9rem",
                          mt: 0.3,
                        }}
                      >
                        {r.contactPhone || "-"}
                      </Typography>
                    </Box>

                    {/* Incident Date */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#f59e0b",
                          fontWeight: "700",
                          fontSize: "0.65rem",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        <EventIcon
                          sx={{
                            fontSize: 14,
                            mr: isRTL ? 0 : 0.5,
                            ml: isRTL ? 0.5 : 0,
                            verticalAlign: "middle",
                          }}
                        />
                        {t("incidentDateLabel", language)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          color: "#475569",
                          fontSize: "0.9rem",
                          mt: 0.3,
                        }}
                      >
                        {formatDate(r.incidentDate)}
                      </Typography>
                    </Box>

                    {/* Description */}
                    {r.description && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#e11d48",
                            fontWeight: "700",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {t("descriptionLabelCard", language)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "500",
                            color: "#475569",
                            fontSize: "0.85rem",
                            mt: 0.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.description}
                        </Typography>
                      </Box>
                    )}

                    {/* Notes */}
                    {r.notes && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#2563eb",
                            fontWeight: "700",
                            fontSize: "0.65rem",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          <NotesIcon
                            sx={{
                              fontSize: 14,
                              mr: isRTL ? 0 : 0.5,
                              ml: isRTL ? 0.5 : 0,
                              verticalAlign: "middle",
                            }}
                          />
                          {t("notesLabel", language)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "500",
                            color: "#475569",
                            fontSize: "0.85rem",
                            mt: 0.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageViewerOpen}
        onClose={() => {
          setImageViewerOpen(false);
          setSelectedImage(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0,0,0,0.9)",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
          }}
        >
          <IconButton
            onClick={() => {
              setImageViewerOpen(false);
              setSelectedImage(null);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(255,255,255,0.1)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="University Card"
              sx={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MyEmergencyRequests;
