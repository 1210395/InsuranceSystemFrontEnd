import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Avatar,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const RadiologyRequestCard = memo(({
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

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "100%",
        minHeight: 480,
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
      {/* Card Header with Title */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
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
          <LocalHospitalIcon sx={{ fontSize: 80 }} />
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
            {t("radiologyTest", language)} {index + 1}
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
          />
        </Stack>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Patient Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: familyMemberInfo ? "#FAF8F5" : "#F5F5DC",
            border: familyMemberInfo ? "2px solid #8B9A46" : "2px solid #A8B56B",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: familyMemberInfo ? "#E8E8D0" : "#E8E8D0",
              transform: "translateY(-2px)",
            },
            mb: 2,
          }}
        >
          {familyMemberInfo ? (
            // Family Member Info
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar
                  sx={{
                    bgcolor: "#8B9A46",
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
                      color: "#8B9A46",
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
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "600",
                      color: "#1e293b",
                      fontSize: "0.85rem",
                      mt: 0.25,
                    }}
                  >
                    {familyMemberInfo.relation} of {request.memberName}
                  </Typography>
                </Box>
              </Stack>
              <Divider />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#3D4F23",
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
                      color: "#3D4F23",
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
                    color: "#3D4F23",
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
              <Divider />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#3D4F23",
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
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "0.9rem",
                    mt: 0.25,
                  }}
                >
                  {request.memberName}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#3D4F23",
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
                    color: patientEmployeeId ? "#1e293b" : "#94a3b8",
                    fontSize: "0.85rem",
                    mt: 0.25,
                    fontStyle: patientEmployeeId ? "normal" : "italic",
                  }}
                >
                  {patientEmployeeId || t("notAvailable", language)}
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#3D4F23",
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
                      color: "#3D4F23",
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
              {/* University Card of Main Client */}
              {universityCardImage && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#F5F5DC", borderRadius: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#556B2F",
                      fontWeight: "600",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    {t("universityCardOfMainClient", language)}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
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
                        bgcolor: "#7B8B5E",
                        width: 80,
                        height: 80,
                        cursor: "pointer",
                        border: "2px solid #556B2F",
                        "&:hover": {
                          opacity: 0.8,
                          transform: "scale(1.05)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 48 }} />
                    </Avatar>
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : (
            // Main Client Info
            <Stack spacing={1.5}>
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
                    {t("patient", language)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: "600",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                    }}
                  >
                    {request.memberName || t("unknown", language)}
                  </Typography>
                </Box>
              </Stack>
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
                      Employee ID
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
                {/* University Card of Main Client */}
                {universityCardImage && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "#F5F5DC", borderRadius: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#556B2F",
                        fontWeight: "600",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      University Card of Main Client
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
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
                          bgcolor: "#7B8B5E",
                          width: 80,
                          height: 80,
                          cursor: "pointer",
                          border: "2px solid #556B2F",
                          "&:hover": {
                            opacity: 0.8,
                            transform: "scale(1.05)",
                            transition: "all 0.2s ease",
                          },
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 48 }} />
                      </Avatar>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Stack>
          )}
        </Paper>

        {/* Doctor Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: "#FAF8F5",
            border: "2px solid #8B9A46",
            mb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "#556B2F",
                width: 40,
                height: 40,
              }}
            >
              👨‍⚕️
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
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
                {t("requestingDoctor", language)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                {request.doctorName || "N/A"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Exam Type / Test Name */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: "#F5F5DC",
            border: "2px solid #A8B56B",
            mb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "#7B8B5E",
                width: 40,
                height: 40,
              }}
            >
              📋
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
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
                {t("examType", language)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                {request.testName || t("generalRadiology", language)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Request Date */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: "#FAF8F5",
            border: "2px solid #7B8B5E",
            mb: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              sx={{
                bgcolor: "#556B2F",
                width: 40,
                height: 40,
              }}
            >
              <EventIcon sx={{ fontSize: 20 }} />
            </Avatar>
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
                {t("requestDate", language)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                {formatDate(request.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Action Buttons */}
        {status.label === "Pending" && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={() => onOpenUploadDialog(request)}
            sx={{
              borderRadius: 2,
              py: 1.5,
              textTransform: "none",
              fontWeight: "600",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
              boxShadow: "0 4px 14px rgba(85, 107, 47, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #3D4F23 0%, #556B2F 100%)",
                boxShadow: "0 6px 20px rgba(85, 107, 47, 0.5)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {t("uploadResult", language)}
          </Button>
        )}

        {/* Uploaded Result Info */}
        {request.resultFilePath && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: "#f0fdf4",
              border: "2px solid #86efac",
              mt: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  bgcolor: "#16a34a",
                  width: 40,
                  height: 40,
                }}
              >
                <DescriptionIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
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
                  {t("resultUploaded", language)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "0.85rem",
                  }}
                >
                  {request.approvedPrice ? `${t("price", language)}: ${request.approvedPrice}` : t("completed", language)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Upload Time */}
        {request.uploadedAt && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#fef3c7",
              border: "2px solid #fde047",
              mt: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  bgcolor: "#eab308",
                  width: 35,
                  height: 35,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 18 }} />
              </Avatar>
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
                  {t("uploadedAt", language)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    color: "#1e293b",
                    fontSize: "0.85rem",
                  }}
                >
                  {formatDate(request.uploadedAt)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
});

RadiologyRequestCard.propTypes = {
  request: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  status: PropTypes.shape({
    label: PropTypes.string,
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

export default RadiologyRequestCard;
