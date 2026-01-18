// src/Component/Manager/AdminFunctions/ManagerClaimsManage.jsx
// Manager wrapper for ClaimsManage (Coordination Admin) with Manager Sidebar and Header
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";

// Manager-specific imports
import Header from "../Header";
import Sidebar from "../Sidebar";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RefreshIcon from "@mui/icons-material/Refresh";

import { api } from "../../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../../config/api";
import { CLAIM_STATUS, isValidTransition } from "../../../config/claimStateMachine";
import { ROLES } from "../../../config/roles";
import { timeSince as timeSinceUtil, formatDate } from "../../../utils/helpers";
import { sanitizeString } from "../../../utils/sanitize";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ManagerClaimsManage = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openFinalRejectDialog, setOpenFinalRejectDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [finalRejectReason, setFinalRejectReason] = useState("");
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Prevent double-clicks on action buttons
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use centralized time formatter
  const timeSince = useCallback((timestamp) => {
    return timeSinceUtil(timestamp);
  }, []);

  // Fetch claims using centralized API service
  const fetchClaims = useCallback(async (withSpinner = false) => {
    if (withSpinner) {
      setLoading(true);
    }

    try {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.COORDINATION_REVIEW);

      // api.get returns response.data directly, so res is already the array
      setClaims(
        (res || []).sort(
          (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
        )
      );
    } catch {
      setSnackbar({
        open: true,
        message: t("failedLoadClaims", language),
        severity: "error",
      });
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  }, [language]);

  useEffect(() => {
    let isMounted = true;
    let interval;

    const fetchWithCheck = async (withSpinner = false) => {
      if (!isMounted) return;
      await fetchClaims(withSpinner);
    };

    fetchWithCheck(true);

    interval = setInterval(() => {
      fetchWithCheck();
    }, 20000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [fetchClaims]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchClaims();
    } finally {
      setRefreshing(false);
    }
  };

  // Memoized handler to open reject dialog
  const handleOpenReject = useCallback((claim) => {
    setSelectedClaim(claim);
    setRejectReason("");
    setOpenRejectDialog(true);
  }, []);

  // Handler for final approval
  const handleApproveFinal = async (claimId) => {
    // Find the claim to validate its status
    const claim = claims.find(c => c.id === claimId);
    if (!claim) {
      setSnackbar({ open: true, message: t("claimNotFound", language), severity: "error" });
      return;
    }

    // Validate state transition before approving
    if (!isValidTransition(claim.status, CLAIM_STATUS.APPROVED_FINAL)) {
      setSnackbar({ open: true, message: t("invalidStatusTransition", language), severity: "error" });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.patch(API_ENDPOINTS.HEALTHCARE_CLAIMS.APPROVE_FINAL(claimId));
      setClaims(prev => prev.filter(c => c.id !== claimId));
      setSnackbar({ open: true, message: t("claimApprovedSuccess", language), severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t("failedToApproveClaim", language), severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for final rejection
  const handleRejectFinal = async () => {
    if (!selectedClaim) return;

    if (!finalRejectReason.trim()) {
      setSnackbar({ open: true, message: t("pleaseEnterReason", language), severity: "error" });
      return;
    }

    // Validate state transition before rejecting
    if (!isValidTransition(selectedClaim.status, CLAIM_STATUS.REJECTED_FINAL)) {
      setSnackbar({ open: true, message: t("invalidStatusTransition", language), severity: "error" });
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.patch(API_ENDPOINTS.HEALTHCARE_CLAIMS.REJECT_FINAL(selectedClaim.id), { reason: finalRejectReason });
      setClaims(prev => prev.filter(c => c.id !== selectedClaim.id));
      setSnackbar({ open: true, message: t("claimRejectedSuccess", language), severity: "warning" });
      setOpenFinalRejectDialog(false);
      setFinalRejectReason("");
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t("failedToRejectClaim", language), severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnForReview = async () => {
    if (!selectedClaim) return;

    const sanitizedReason = sanitizeString(rejectReason);

    if (!sanitizedReason.trim()) {
      return setSnackbar({
        open: true,
        message: t("pleaseEnterReviewNote", language),
        severity: "error",
      });
    }

    // Validate state transition
    if (!isValidTransition(selectedClaim.status, CLAIM_STATUS.RETURNED_FOR_REVIEW)) {
      return setSnackbar({
        open: true,
        message: t("invalidStatusTransition", language),
        severity: "error",
      });
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await api.patch(
        `${API_ENDPOINTS.HEALTHCARE_CLAIMS.BASE}/${selectedClaim.id}/return-to-medical`,
        { reason: sanitizedReason }
      );

      setClaims((prev) =>
        prev.filter((c) => c.id !== selectedClaim.id)
      );

      setSnackbar({
        open: true,
        message: t("claimReturnedToMedical", language),
        severity: "info",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedReturnClaim", language),
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }

    setOpenRejectDialog(false);
  };

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#FAF8F5",
          minHeight: "100vh",
          ml: isRTL ? 0 : "240px",
          mr: isRTL ? "240px" : 0,
        }}
      >
        <Header />

        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#3D4F23" }}>
                {t("administrativeClaimsReview", language)}
              </Typography>

              <Typography sx={{ color: "#6B7280" }}>
                {t("reviewAdminFinancialInfo", language)}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
              onClick={handleManualRefresh}
              disabled={refreshing}
              sx={{ borderColor: "#556B2F", color: "#556B2F" }}
            >
              {refreshing ? t("refreshing", language) : t("refresh", language)}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress sx={{ color: "#556B2F" }} />
            </Box>
          ) : claims.length === 0 ? (
            <Typography sx={{ mt: 10, textAlign: "center" }}>
              {t("noClaimsForReview", language)}
            </Typography>
          ) : (
            claims.map((claim) => (
              <Paper
                key={claim.id}
                sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 3,
                  boxShadow: "0px 2px 15px rgba(0,0,0,0.1)",
                  borderLeft: "8px solid #556B2F",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={t("approvedByMedicalPendingCoordination", language)}
                    sx={{
                      backgroundColor: "#7B8B5E",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography>
                          <PersonIcon sx={{ mr: 1 }} />
                          <b>{t("provider", language)}:</b> {claim.providerName} (
                          {claim.providerRole})
                        </Typography>
                        {claim.providerRole === ROLES.INSURANCE_CLIENT && (
                          <Chip
                            label={t("outOfInsuranceNetwork", language)}
                            sx={{
                              backgroundColor: "#FFA500",
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: "0.85rem",
                            }}
                          />
                        )}
                      </Box>

                      <Typography>
                        <PersonIcon sx={{ mr: 1 }} />
                        <b>{t("patient", language)}:</b> {claim.clientName}
                      </Typography>

                      {claim.employeeId !== null && claim.employeeId !== undefined && (
                        <Typography>
                          <PersonIcon sx={{ mr: 1 }} />
                          <b>{t("employeeId", language)}:</b> {claim.employeeId}
                        </Typography>
                      )}

                      {claim.diagnosis && (
                        <Typography sx={{ mt: 1 }}>
                          <b>{t("diagnosis", language)}:</b> {claim.diagnosis}
                        </Typography>
                      )}

                      <Typography component="div" sx={{ mt: 1 }}>
                        <b>{t("description", language)}:</b>
                        <Box
                          sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: 2,
                            whiteSpace: "pre-wrap",
                            fontSize: "0.95rem",
                            color: "#333",
                            border:
                              claim.providerRole === ROLES.INSURANCE_CLIENT
                                ? "1px solid #FFA500"
                                : "none",
                            bgcolor:
                              claim.providerRole === ROLES.INSURANCE_CLIENT
                                ? "#FFF8E1"
                                : "#E8EDE0",
                          }}
                        >
                          {sanitizeString(claim.description)}
                        </Box>
                      </Typography>

                      <Typography>
                        <EventIcon sx={{ mr: 1 }} />
                        <b>{t("serviceDate", language)}:</b>{" "}
                        {formatDate(claim.serviceDate, 'short')}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography>
                        <MonetizationOnIcon sx={{ mr: 1, color: "#556B2F" }} />
                        <b>{t("amount", language)}:</b> {claim.amount} {CURRENCY.CODE}
                      </Typography>

                      {claim.invoiceImagePath && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {t("invoiceImage", language)}
                          </Typography>

                          <Box
                            component="img"
                            src={claim.invoiceImagePath}
                            alt="Invoice"
                            sx={{
                              mt: 1,
                              width: 120,
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid #ddd",
                              cursor: "zoom-in",
                            }}
                            onClick={() => {
                              setSelectedImage(claim.invoiceImagePath);
                              setOpenImageDialog(true);
                            }}
                          />
                        </Box>
                      )}

                      <Typography>
                        <AccessTimeIcon sx={{ mr: 1 }} />
                        <b>{t("submitted", language)}:</b> {timeSince(claim.submittedAt)}
                      </Typography>

                      <Typography>
                        <VerifiedUserIcon sx={{ mr: 1 }} />
                        {t("approvedBy", language)}{" "}
                        <b>{claim.medicalReviewerName || t("medicalAdmin", language)}</b>
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveFinal(claim.id)}
                    sx={{ textTransform: "none", mr: 1 }}
                  >
                    {t("approveFinal", language)}
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => { setSelectedClaim(claim); setFinalRejectReason(""); setOpenFinalRejectDialog(true); }}
                    sx={{ textTransform: "none", mr: 1 }}
                  >
                    {t("rejectFinal", language)}
                  </Button>

                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleOpenReject(claim)}
                  >
                    {t("returnForReview", language)}
                  </Button>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Box>

      {/* Reject Dialog - Return for Review */}
      <Dialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("returnClaimForMedicalReview", language)}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("reason", language)}
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>{t("cancel", language)}</Button>

          <Button
            variant="contained"
            color="warning"
            onClick={handleReturnForReview}
          >
            {t("returnForReview", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Reject Dialog */}
      <Dialog open={openFinalRejectDialog} onClose={() => setOpenFinalRejectDialog(false)}>
        <DialogTitle>{t("rejectClaim", language)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("rejectionReason", language)}
            fullWidth
            multiline
            rows={3}
            value={finalRejectReason}
            onChange={(e) => setFinalRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFinalRejectDialog(false)}>{t("cancel", language)}</Button>
          <Button onClick={handleRejectFinal} color="error">{t("reject", language)}</Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("invoiceImage", language)}</DialogTitle>

        <DialogContent dividers>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Invoice Full"
              sx={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>
            {t("close", language)}
          </Button>

          {selectedImage && (
            <Button
              variant="contained"
              onClick={() => window.open(selectedImage, "_blank")}
            >
              {t("openInNewTab", language)}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Box>
  );
};

export default ManagerClaimsManage;
