import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const LabRequestCard = memo(({
  request,
  index,
  status,
  familyMemberInfo,
  patientEmployeeId,
  universityCardImage,
  displayAge,
  displayGender,
  formatDate,
  onOpenUploadDialog,
  onImageClick,
}) => {
  const { language, isRTL } = useLanguage();

  // ✅ Get status-based styling for visual differences
  const getStatusCardStyle = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case "pending":
        return {
          borderColor: "#FF9800", // Orange
          bgColor: "#FFF8E1", // Light orange tint
          headerBg: "linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)",
          hoverShadow: "0 12px 40px rgba(255, 152, 0, 0.3)",
        };
      case "in_progress":
        return {
          borderColor: "#2196F3", // Blue
          bgColor: "#E3F2FD", // Light blue tint
          headerBg: "linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)",
          hoverShadow: "0 12px 40px rgba(33, 150, 243, 0.3)",
        };
      case "completed":
        return {
          borderColor: "#4CAF50", // Green
          bgColor: "#E8F5E9", // Light green tint
          headerBg: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
          hoverShadow: "0 12px 40px rgba(76, 175, 80, 0.3)",
        };
      case "rejected":
        return {
          borderColor: "#F44336", // Red
          bgColor: "#FFEBEE", // Light red tint
          headerBg: "linear-gradient(135deg, #F44336 0%, #E57373 100%)",
          hoverShadow: "0 12px 40px rgba(244, 67, 54, 0.3)",
        };
      default:
        return {
          borderColor: "#556B2F", // Default olive
          bgColor: "#FAF8F5",
          headerBg: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
          hoverShadow: "0 12px 40px rgba(85, 107, 47, 0.2)",
        };
    }
  };

  const cardStyle = getStatusCardStyle(request.status);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "100%",
        minHeight: 450,
        display: "flex",
        flexDirection: "column",
        borderLeft: `6px solid ${cardStyle.borderColor}`,
        borderTop: "1px solid #E8EDE0",
        borderRight: "1px solid #E8EDE0",
        borderBottom: "1px solid #E8EDE0",
        backgroundColor: cardStyle.bgColor,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: cardStyle.hoverShadow,
          borderLeftColor: cardStyle.borderColor,
        },
      }}
    >
      {/* Card Header with Title - uses status-based color */}
      <Box
        sx={{
          background: cardStyle.headerBg,
          p: 2,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Icon Background */}
        <Box
          sx={{
            position: "absolute",
            right: -10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "3rem",
            opacity: 0.15,
          }}
        >
          <ScienceIcon sx={{ fontSize: 80 }} />
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "700",
              fontSize: "1.1rem",
              color: "white",
            }}
          >
            {t("labTest", language)} {index + 1}
          </Typography>
          <Chip
            label={status.label}
            sx={{
              bgcolor: "white",
              color: "#556B2F",
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
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Patient Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#F5F5DC",
            border: "1px solid #A8B56B",
            borderRadius: 2,
          }}
        >
          {familyMemberInfo ? (
            <Stack spacing={1.5}>
              <Box>
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
                  {t("familyMember", language)} ({t("patientLabel", language)})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "0.9rem",
                    mt: 0.25,
                  }}
                >
                  {familyMemberInfo.name || "Unknown"}
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={1}>
                {familyMemberInfo.relation && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
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
                      {familyMemberInfo.relation}
                    </Typography>
                  </Box>
                )}
                {familyMemberInfo.insuranceNumber && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
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
                )}
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
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
                        color: "#7B8B5E",
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
              </Stack>
              <Divider />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7B8B5E",
                    fontWeight: "600",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    mb: 0.5,
                    display: "block",
                  }}
                >
                  {t("mainClient", language)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color: "#64748b",
                    fontSize: "0.85rem",
                  }}
                >
                  {request.memberName || "Unknown"}
                </Typography>
              </Box>
              {patientEmployeeId && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#7B8B5E",
                      fontWeight: "600",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {t("employeeId", language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "600",
                      color: "#64748b",
                      fontSize: "0.85rem",
                      mt: 0.25,
                    }}
                  >
                    {patientEmployeeId}
                  </Typography>
                </Box>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#7B8B5E",
                    fontWeight: "600",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    mb: 1,
                    display: "block",
                  }}
                >
                  {t("universityCard", language)}
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
                      onImageClick(imageUrl);
                    }
                  }}
                  sx={{
                    bgcolor: "#10b981",
                    width: 80,
                    height: 80,
                    cursor: universityCardImage ? "pointer" : "default",
                    border: universityCardImage ? "2px solid #10b981" : "2px solid #d1d5db",
                    "&:hover": universityCardImage ? {
                      opacity: 0.9,
                      transform: "scale(1.05)",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
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
              <Box>
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
                  {t("patientLabel", language)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "0.9rem",
                    mt: 0.25,
                  }}
                >
                  {request.memberName || "Unknown"}
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={1}>
                {patientEmployeeId && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
                        fontWeight: "600",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("employeeId", language)}
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
                      {patientEmployeeId}
                    </Typography>
                  </Box>
                )}
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
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
                        color: displayAge ? "#1e293b" : "#94a3b8",
                        fontSize: "0.85rem",
                        mt: 0.25,
                        fontStyle: displayAge ? "normal" : "italic",
                      }}
                    >
                      {displayAge || t("notAvailable", language)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#7B8B5E",
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
                        color: displayGender ? "#1e293b" : "#94a3b8",
                        fontSize: "0.85rem",
                        mt: 0.25,
                        fontStyle: displayGender ? "normal" : "italic",
                      }}
                    >
                      {displayGender || t("notAvailable", language)}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#7B8B5E",
                      fontWeight: "600",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    {t("universityCard", language)}
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
                        onImageClick(imageUrl);
                      }
                    }}
                    sx={{
                      bgcolor: "#556B2F",
                      width: 80,
                      height: 80,
                      cursor: universityCardImage ? "pointer" : "default",
                      border: universityCardImage ? "2px solid #556B2F" : "2px solid #d1d5db",
                      "&:hover": universityCardImage ? {
                        opacity: 0.9,
                        transform: "scale(1.05)",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(85, 107, 47, 0.3)",
                      } : {},
                    }}
                  >
                    {universityCardImage ? null : <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                </Box>
              </Stack>
            </Stack>
          )}
        </Paper>

        {/* Test Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#F5F5DC",
            border: "1px solid #8B9A46",
            borderRadius: 2,
          }}
        >
          <Stack spacing={1.5}>
            <Box>
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
                {t("testName", language)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                  mt: 0.25,
                }}
              >
                {request.testName || "Unknown Test"}
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#7B8B5E",
                  fontWeight: "600",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                }}
              >
                {t("testType", language)}
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
                {request.testType || "General"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Doctor Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#FAF8F5",
            border: "1px solid #8B9A46",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 20, color: "#556B2F" }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "#3D4F23",
                  fontWeight: "700",
                  fontSize: "0.65rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {t("requestedBy", language)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.85rem",
                }}
              >
                Dr. {request.doctorName || "Unknown"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Date */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: "#FAF8F5",
            border: "1px solid #A8B56B",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "#7B8B5E" }} />
            <Typography variant="caption" color="text.secondary">
              <b>{t("requestDate", language)}:</b> {formatDate(request.createdAt)}
            </Typography>
          </Stack>
        </Paper>
      </CardContent>

      {/* Action Buttons */}
      {request.status?.toLowerCase() === "pending" ||
      request.status?.toLowerCase() === "in_progress" ? (
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            fullWidth
            startIcon={<FileUploadIcon />}
            onClick={() => onOpenUploadDialog(request)}
          >
            {t("uploadResult", language)}
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <Chip
            label={t("resultsSubmitted", language)}
            color="success"
            variant="outlined"
            sx={{ width: "100%" }}
          />
        </Box>
      )}
    </Card>
  );
});

LabRequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  status: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.node,
  }).isRequired,
  familyMemberInfo: PropTypes.object,
  patientEmployeeId: PropTypes.string,
  universityCardImage: PropTypes.string,
  displayAge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  displayGender: PropTypes.string,
  formatDate: PropTypes.func.isRequired,
  onOpenUploadDialog: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default LabRequestCard;
