// src/Component/Pharmacist/PrescriptionCard.jsx
import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { API_BASE_URL } from "../../config/api";

const PrescriptionCard = memo(({
  prescription,
  index,
  status,
  patientEmployeeId,
  familyMemberInfo,
  isFamilyMember,
  universityCardImage,
  displayAge,
  displayGender,
  formatDate,
  getDosageUnit,
  getDailyUnit,
  getQuantityUnit,
  onVerify,
  onReject,
  onBill,
  onImageClick,
}) => {
  const { language } = useLanguage();
  const p = prescription;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "100%",
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
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
                {t("prescriptions", language)} {index + 1}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
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

      <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Patient Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: isFamilyMember ? "#FAF8F5" : "#F5F5DC",
            border: isFamilyMember ? "2px solid #8B9A46" : "2px solid #A8B56B",
            mb: 2.5,
          }}
        >
          {isFamilyMember ? (
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
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={1}>
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
                      {familyMemberInfo.age || "Not available"}
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
                      {familyMemberInfo.gender || "Not available"}
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
                <Divider sx={{ my: 1 }} />
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
                    {p.memberName}
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
                      color: "#1e293b",
                      fontSize: "0.85rem",
                      mt: 0.25,
                    }}
                  >
                    {p.employeeId || patientEmployeeId || "Not available"}
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
                      {displayAge || "Not available"}
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
                      {displayGender || "Not available"}
                    </Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#3D4F23",
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
                      border: universityCardImage ? "2px solid #10b981" : "2px solid #d1d5db",
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
          ) : (
            // {t("mainClient", language)} Info
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
                  {t("patient", language)}
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
                  {p.memberName || "Unknown"}
                </Typography>
              </Box>
              <Divider />
              <Stack spacing={1}>
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
                        fontSize: "0.9rem",
                        mt: 0.5,
                        fontStyle: displayAge ? "normal" : "italic",
                      }}
                    >
                      {displayAge || "Not available"}
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
                        fontSize: "0.9rem",
                        mt: 0.5,
                        fontStyle: displayGender ? "normal" : "italic",
                      }}
                    >
                      {displayGender || "Not available"}
                    </Typography>
                  </Grid>
                </Grid>
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
                      color: patientEmployeeId ? "#1e293b" : "#94a3b8",
                      fontSize: "0.9rem",
                      mt: 0.5,
                      fontStyle: patientEmployeeId ? "normal" : "italic",
                    }}
                  >
                    {patientEmployeeId || "Not available"}
                  </Typography>
                </Box>
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
                      border: universityCardImage ? "2px solid #10b981" : "2px solid #d1d5db",
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

        {/* Doctor/Medical Admin Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: "#FAF8F5",
            border: "2px solid #8B9A46",
            mb: 2.5,
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
              <LocalHospitalIcon sx={{ fontSize: 24 }} />
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
                {(() => {
                  const isChronic = p.isChronic === true || p.isChronic === "true";
                  return isChronic ? "Medical Admin" : "Doctor";
                })()}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "0.9rem",
                }}
              >
                {p.doctorName || "Unknown"}
              </Typography>
            </Box>
          </Stack>
        </Paper>

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
                p.items.map((item, idx) => {
                  return (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: "#fff",
                      border: "1px solid #E8EDE0",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {item.medicineName}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.scientificName}
                    </Typography>
                    <Divider sx={{ my: 0.5 }} />
                    {p.isChronic && item.calculatedQuantity != null && item.calculatedQuantity > 0 ? (
                      <Typography variant="caption" display="block" sx={{ color: "#dc2626", fontWeight: 600 }}>
                        <b>Quantity:</b> {item.calculatedQuantity} {(() => {
                          const formUpper = (item.form || "").toUpperCase();
                          if (formUpper === "TABLET" || formUpper === "CAPSULE") return "pill(s)";
                          if (formUpper === "INJECTION") return "injection(s)";
                          if (formUpper === "SYRUP" || formUpper === "DROPS") return "bottle(s)";
                          if (formUpper === "CREAM" || formUpper === "OINTMENT") return "tube(s)";
                          return "unit(s)";
                        })()}
                      </Typography>
                    ) : (
                      <>
                        {(() => {
                          const formUpper = (item.form || "").toUpperCase();
                          const isCream = formUpper === "CREAM" || formUpper === "OINTMENT";
                          const isInjection = formUpper === "INJECTION";
                          
                          if (isCream && item.timesPerDay != null && item.timesPerDay !== 0 && item.duration != null && item.duration !== 0) {
                            return (
                              <Typography variant="caption" display="block">
                                {item.timesPerDay} times/day • <b>Duration:</b> {item.duration} days
                              </Typography>
                            );
                          }
                          
                          if (isInjection && item.dosage != null && item.dosage !== 0 && item.duration != null && item.duration !== 0) {
                            return (
                              <Typography variant="caption" display="block">
                                <b>Quantity:</b> {item.dosage} {getQuantityUnit(item.form, item.medicineName).en} • <b>Duration:</b> {item.duration} days
                              </Typography>
                            );
                          }
                          
                          const isSyrup = formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID";
                          if (isSyrup && (!item.noDosage) && item.dosage != null && item.dosage !== 0 && item.timesPerDay != null && item.timesPerDay !== 0) {
                            return (
                              <Typography variant="caption" display="block">
                                <b>Dosage:</b> {item.dosage} {getDosageUnit(item.form, item.medicineName).en} •{" "}
                                <b>Times per day:</b> {item.timesPerDay} •{" "}
                                {item.duration && item.duration !== 0 && (
                                  <> <b>Duration:</b> {item.duration} days</>
                                )}
                              </Typography>
                            );
                          }
                          
                          if (!isCream && !isInjection && !isSyrup && (!item.noDosage) && item.dosage != null && item.dosage !== 0 && item.timesPerDay != null && item.timesPerDay !== 0) {
                            return (
                              <Typography variant="caption" display="block">
                                <b>Dosage:</b> {item.dosage} {getDosageUnit(item.form, item.medicineName).en} •{" "}
                                {item.timesPerDay} times/day •{" "}
                                {item.dosage * item.timesPerDay} {getDailyUnit(item.form, item.medicineName).en}
                                {item.duration && item.duration !== 0 && (
                                  <> • <b>Duration:</b> {item.duration} days</>
                                )}
                              </Typography>
                            );
                          }
                          return null;
                        })()}
                        {(() => {
                          const formUpper = (item.form || "").toUpperCase();
                          const isCream = formUpper === "CREAM" || formUpper === "OINTMENT";
                          const isInjection = formUpper === "INJECTION";
                          if (isCream || isInjection) return null;
                          
                          if ((item.noDosage || item.dosage == null || item.dosage === 0 || item.timesPerDay == null || item.timesPerDay === 0) && item.duration != null && item.duration !== 0) {
                            return (
                              <Typography variant="caption" display="block">
                                <b>Duration:</b> {item.duration} days
                              </Typography>
                            );
                          }
                          return null;
                        })()}
                        {(item.noDosage || item.dosage == null || item.dosage === 0 || item.timesPerDay == null || item.timesPerDay === 0) && (item.duration == null || item.duration === 0) && (
                          <Typography variant="caption" display="block" color="text.secondary" fontStyle="italic">
                            No dosage information required
                          </Typography>
                        )}
                      </>
                    )}
                  </Paper>
                  );
                })
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {t("noMedicines", language)}
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Notes */}
        {p.notes && (
          <Paper elevation={0} sx={{ p: 2, bgcolor: "#fff3e0", mb: 2 }}>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <StickyNote2Icon
                sx={{ color: "#f57c00", fontSize: 18 }}
              />
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="#f57c00"
                  display="block"
                >
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
              <b>Issued:</b> {formatDate(p.createdAt)}
            </Typography>
          </Stack>
        </Paper>
      </CardContent>

      {/* Action Buttons */}
      {p.status?.toLowerCase() === "pending" && (
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            fullWidth
            onClick={() => onVerify(p)}
          >
            ✅ {t("verify", language)}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            fullWidth
            onClick={() => onReject(p.id)}
          >
            ❌ {t("reject", language)}
          </Button>
        </Box>
      )}

      {/* {t("markAsBilled", language)} Button for VERIFIED prescriptions */}
      {p.status?.toLowerCase() === "verified" && (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            fullWidth
            onClick={() => onBill(p.id)}
            sx={{
              background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
              fontWeight: 600,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)",
              },
            }}
          >
            💰 {t("markAsBilled", language)}
          </Button>
        </Box>
      )}
    </Card>
  );
});

PrescriptionCard.propTypes = {
  prescription: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  status: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.node,
    bgcolor: PropTypes.string,
    textColor: PropTypes.string,
  }).isRequired,
  patientEmployeeId: PropTypes.string,
  familyMemberInfo: PropTypes.object,
  isFamilyMember: PropTypes.bool,
  universityCardImage: PropTypes.string,
  displayAge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  displayGender: PropTypes.string,
  formatDate: PropTypes.func.isRequired,
  getDosageUnit: PropTypes.func.isRequired,
  getDailyUnit: PropTypes.func.isRequired,
  getQuantityUnit: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onBill: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default PrescriptionCard;
