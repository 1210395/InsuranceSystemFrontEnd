import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const PendingProviderRegistrations = () => {
  const { language, isRTL } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [filterRole, setFilterRole] = useState("ALL");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch pending healthcare provider registrations
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.CLIENTS.LIST);
        const data = res || [];
        const filtered = data.filter(
          (u) =>
            u.roleRequestStatus === "PENDING" &&
            ["DOCTOR", "PHARMACIST", "LAB_TECH", "RADIOLOGIST"].includes(
              u.requestedRole?.toUpperCase()
            )
        );

        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setAllProviders(sorted);
        setProviders(sorted);
      } catch (err) {
        console.error("❌ Fetch failed:", err.response?.data || err.message);
      }
    };

    fetchProviders();
  }, []);

  // Filter by role
  useEffect(() => {
    if (filterRole === "ALL") {
      setProviders(allProviders);
    } else {
      setProviders(
        allProviders.filter(
          (provider) => provider.requestedRole?.toUpperCase() === filterRole
        )
      );
    }
  }, [filterRole, allProviders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    const iconStyle = { fontSize: 40, color: "#556B2F" };
    switch (role?.toUpperCase()) {
      case "DOCTOR":
        return <LocalHospitalIcon sx={iconStyle} />;
      case "PHARMACIST":
        return <LocalPharmacyIcon sx={iconStyle} />;
      case "LAB_TECH":
        return <ScienceIcon sx={iconStyle} />;
      case "RADIOLOGIST":
        return <MonitorHeartIcon sx={iconStyle} />;
      default:
        return <MedicalServicesIcon sx={iconStyle} />;
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      DOCTOR: t("doctor", language) || "Doctor",
      PHARMACIST: t("pharmacist", language) || "Pharmacist",
      LAB_TECH: t("labTechnician", language) || "Lab Technician",
      RADIOLOGIST: t("radiologist", language) || "Radiologist",
    };
    return roles[role?.toUpperCase()] || role;
  };

  const handleApprove = async (provider) => {
    setLoadingId(provider.id);
    try {
      await api.patch(`/api/clients/${provider.id}/role-requests/approve`);

      setAllProviders((prev) => prev.filter((c) => c.id !== provider.id));
      setProviders((prev) => prev.filter((c) => c.id !== provider.id));

      setSnackbar({
        open: true,
        message: t("requestApprovedFor", language).replace(
          "{name}",
          provider.fullName
        ),
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Approval failed:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: t("approvalFailed", language),
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectClick = (provider) => {
    setSelectedProvider(provider);
    setOpenDialog(true);
  };

  const handleRejectConfirm = async () => {
    setLoadingId(selectedProvider.id);
    try {
      await api.patch(API_ENDPOINTS.CLIENTS.REJECT(selectedProvider.id), {
        reason: rejectReason,
      });

      setAllProviders((prev) => prev.filter((c) => c.id !== selectedProvider.id));
      setProviders((prev) => prev.filter((c) => c.id !== selectedProvider.id));

      setSnackbar({
        open: true,
        message: t("requestRejectedFor", language).replace(
          "{name}",
          selectedProvider.fullName
        ),
        severity: "error",
      });
    } catch (err) {
      console.error("❌ Reject failed:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: t("rejectFailed", language),
        severity: "error",
      });
    } finally {
      setLoadingId(null);
      setOpenDialog(false);
      setRejectReason("");
    }
  };

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#FAF8F5",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
          pt: { xs: "56px", sm: 0 },
          transition: "margin 0.3s ease",
        }}
      >
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#3D4F23",
              display: "flex",
              alignItems: "center",
            }}
          >
            <PendingActionsIcon
              sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 35, color: "#556B2F" }}
            />
            {t("healthcareProviderRegistrations", language) || "Healthcare Provider Registrations"}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("reviewProviderRegistrations", language) || "Review and approve healthcare provider account registrations"}
          </Typography>

          {/* Role Filter */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
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
              {t("filterByRole", language) || "Filter by Role"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {[
                {
                  role: "ALL",
                  label: t("allRoles", language) || "All",
                  count: allProviders.length,
                },
                {
                  role: "DOCTOR",
                  label: t("doctors", language) || "Doctors",
                  count: allProviders.filter(
                    (c) => c.requestedRole?.toUpperCase() === "DOCTOR"
                  ).length,
                },
                {
                  role: "PHARMACIST",
                  label: t("pharmacists", language) || "Pharmacists",
                  count: allProviders.filter(
                    (c) => c.requestedRole?.toUpperCase() === "PHARMACIST"
                  ).length,
                },
                {
                  role: "LAB_TECH",
                  label: t("labTechnicians", language) || "Lab Techs",
                  count: allProviders.filter(
                    (c) => c.requestedRole?.toUpperCase() === "LAB_TECH"
                  ).length,
                },
                {
                  role: "RADIOLOGIST",
                  label: t("radiologists", language) || "Radiologists",
                  count: allProviders.filter(
                    (c) => c.requestedRole?.toUpperCase() === "RADIOLOGIST"
                  ).length,
                },
              ].map(({ role, label, count }) => (
                <Chip
                  key={role}
                  label={`${label} (${count})`}
                  onClick={() => setFilterRole(role)}
                  variant={filterRole === role ? "filled" : "outlined"}
                  color={filterRole === role ? "primary" : "default"}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Stack>
          </Paper>

          {/* Results Count */}
          <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
            {t("showing", language) || "Showing"} <strong>{providers.length}</strong>{" "}
            {providers.length !== 1
              ? t("requests", language) || "requests"
              : t("request", language) || "request"}
          </Typography>

          {providers.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("noPendingRequestsFound", language) || "No pending requests found"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("noPendingProviderRequests", language) || "No pending healthcare provider registration requests"}
              </Typography>
            </Paper>
          ) : (
            providers.map((provider) => (
              <Paper
                key={provider.id}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 4,
                  mb: 4,
                  borderLeft: `6px solid #1E8EAB`,
                  backgroundColor: "white",
                  transition: "0.3s ease-in-out",
                }}
              >
                <Grid container spacing={3}>
                  {/* General Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#556B2F" }}
                      >
                        {t("generalInformationTitle", language) || "General Information"}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getRoleIcon(provider.requestedRole)}
                          <Chip
                            label={getRoleLabel(provider.requestedRole)}
                            color="primary"
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2">
                          <PersonIcon
                            sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }}
                          />
                          <b>{t("nameLabel", language) || "Name"}:</b> {provider.fullName}
                        </Typography>

                        <Typography variant="body2">
                          <EmailIcon
                            sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }}
                          />
                          <b>{t("emailLabel", language) || "Email"}:</b> {provider.email}
                        </Typography>

                        <Typography variant="body2">
                          <PhoneIcon
                            sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }}
                          />
                          <b>{t("phoneLabel", language) || "Phone"}:</b> {provider.phone}
                        </Typography>

                        <Typography variant="body2">
                          <b>{t("nationalIdLabel", language) || "National ID"}:</b>{" "}
                          {provider.nationalId}
                        </Typography>

                        <Typography variant="body2">
                          <b>{t("genderLabel", language) || "Gender"}:</b> {provider.gender}
                        </Typography>

                        <Typography variant="body2">
                          <b>{t("dateOfBirthLabel", language) || "Date of Birth"}:</b>{" "}
                          {provider.dateOfBirth
                            ? new Date(provider.dateOfBirth).toLocaleDateString()
                            : t("notAvailable", language) || "N/A"}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Role-specific Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#556B2F" }}
                      >
                        {t("professionalDetails", language) || "Professional Details"}
                      </Typography>
                      <Stack spacing={1}>
                        {provider.requestedRole === "DOCTOR" && (
                          <>
                            <Typography variant="body2">
                              <b>{t("specialization", language) || "Specialization"}:</b>{" "}
                              {provider.specialization || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("clinicLocation", language) || "Clinic Location"}:</b>{" "}
                              {provider.clinicLocation || t("notProvided", language)}
                            </Typography>
                          </>
                        )}

                        {provider.requestedRole === "PHARMACIST" && (
                          <>
                            <Typography variant="body2">
                              <b>{t("pharmacyCode", language) || "Pharmacy Code"}:</b>{" "}
                              {provider.pharmacyCode || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("pharmacyName", language) || "Pharmacy Name"}:</b>{" "}
                              {provider.pharmacyName || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("pharmacyLocation", language) || "Location"}:</b>{" "}
                              {provider.pharmacyLocation || t("notProvided", language)}
                            </Typography>
                          </>
                        )}

                        {provider.requestedRole === "LAB_TECH" && (
                          <>
                            <Typography variant="body2">
                              <b>{t("labCode", language) || "Lab Code"}:</b>{" "}
                              {provider.labCode || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("labName", language) || "Lab Name"}:</b>{" "}
                              {provider.labName || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("labLocation", language) || "Location"}:</b>{" "}
                              {provider.labLocation || t("notProvided", language)}
                            </Typography>
                          </>
                        )}

                        {provider.requestedRole === "RADIOLOGIST" && (
                          <>
                            <Typography variant="body2">
                              <b>{t("radiologyCode", language) || "Radiology Code"}:</b>{" "}
                              {provider.radiologyCode || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("radiologyName", language) || "Radiology Center Name"}:</b>{" "}
                              {provider.radiologyName || t("notProvided", language)}
                            </Typography>
                            <Typography variant="body2">
                              <b>{t("radiologyLocation", language) || "Location"}:</b>{" "}
                              {provider.radiologyLocation || t("notProvided", language)}
                            </Typography>
                          </>
                        )}

                        {/* Status */}
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={provider.roleRequestStatus}
                            color={getStatusColor(provider.roleRequestStatus)}
                            size="small"
                          />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Medical License Documents (for Doctors) */}
                  {provider.requestedRole === "DOCTOR" &&
                    provider.doctorDocumentPaths &&
                    provider.doctorDocumentPaths.length > 0 && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, borderRadius: 2 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ mb: 1, color: "#556B2F" }}
                          >
                            {t("medicalLicense", language) || "Medical License & Certifications"}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {provider.doctorDocumentPaths.map((doc, index) => (
                              <Avatar
                                key={index}
                                src={`${API_BASE_URL}${doc}`}
                                alt={`${t("document", language)} ${index + 1}`}
                                variant="rounded"
                                sx={{
                                  width: 100,
                                  height: 100,
                                  cursor: "pointer",
                                  border: "2px solid #556B2F",
                                }}
                                onClick={() => {
                                  setPreviewImage(`${API_BASE_URL}${doc}`);
                                  setOpenImageDialog(true);
                                }}
                              />
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    )}
                </Grid>

                {provider.roleRequestStatus === "PENDING" && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: isRTL ? "flex-start" : "flex-end",
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        disabled={loadingId === provider.id}
                        onClick={() => handleApprove(provider)}
                        startIcon={
                          loadingId === provider.id ? (
                            <CircularProgress size={18} />
                          ) : null
                        }
                      >
                        {loadingId === provider.id
                          ? t("approving", language) || "Approving..."
                          : t("approve", language) || "Approve"}
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRejectClick(provider)}
                      >
                        {t("reject", language) || "Reject"}
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            ))
          )}
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("rejectRequest", language) || "Reject Request"}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t("pleaseProvideReasonRejecting", language) ||
              "Please provide a reason for rejecting"}{" "}
            <strong>{selectedProvider?.fullName}</strong>:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t("reasonLabel", language) || "Reason"}
            type="text"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t("cancel", language) || "Cancel"}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRejectConfirm}
          >
            {t("confirmReject", language) || "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Preview Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>{t("documentPreview", language) || "Document Preview"}</DialogTitle>
        <DialogContent dividers>
          {previewImage && (
            <img
              src={previewImage}
              alt={t("documentPreview", language) || "Document"}
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)} color="primary">
            {t("close", language) || "Close"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingProviderRegistrations;
