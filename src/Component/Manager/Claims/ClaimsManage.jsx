import React, { useEffect, useState } from "react";
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
import Header from "../Header";
import Sidebar from "../Sidebar";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PolicyIcon from "@mui/icons-material/Description";
import axios from "axios";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ClaimsManage = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ جلب المطالبات من الباك اند
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/claims/allClaimsByManager",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClaims(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch claims:", err);
        setSnackbar({
          open: true,
          message: t("failedToLoadClaims", language),
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // ✅ موافقة على مطالبة
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:8080/api/claims/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // تحديث القائمة
      setClaims(claims.map((c) => (c.id === id ? res.data : c)));
      setSnackbar({
        open: true,
        message: t("claimApprovedSuccess", language),
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Approve failed:", err);
      setSnackbar({
        open: true,
        message: t("failedToApproveClaim", language),
        severity: "error",
      });
    }
  };

  // ✅ فتح نافذة الرفض
  const handleOpenReject = (claim) => {
    setSelectedClaim(claim);
    setRejectReason("");
    setOpenRejectDialog(true);
  };

  // ✅ تأكيد رفض مطالبة
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: t("rejectionReasonRequired", language),
        severity: "error",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:8080/api/claims/${selectedClaim.id}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClaims(claims.map((c) => (c.id === selectedClaim.id ? res.data : c)));
      setSnackbar({
        open: true,
        message: t("claimRejectedSuccess", language),
        severity: "warning",
      });
    } catch (err) {
      console.error("❌ Reject failed:", err);
      setSnackbar({
        open: true,
        message: t("failedToRejectClaim", language),
        severity: "error",
      });
    } finally {
      setOpenRejectDialog(false);
    }
  };

  const filteredClaims = claims.filter(
    (c) =>
      c.memberName?.toLowerCase().includes(search.toLowerCase()) ||
      c.policyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        dir={isRTL ? "rtl" : "ltr"}
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
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
            gutterBottom
            sx={{ color: "#120460" }}
          >
            {t("claimsManagementTitle", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("reviewManageClaims", language)}
          </Typography>

          {/* Loading */}
          {loading ? (
            <CircularProgress sx={{ color: "#120460" }} />
          ) : (
            filteredClaims.map((claim) => (
              <Paper
                key={claim.id}
                sx={{ p: 4, borderRadius: 3, boxShadow: 4, mb: 4 }}
              >
                <Grid container spacing={3}>
                  {/* General Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#1E8EAB" }}
                      >
                        {t("generalInformationTitle", language)}
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <PersonIcon sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />
                          <b>{t("memberLabel", language)}</b> {claim.memberName}
                        </Typography>
                        <Typography variant="body2">
                          <PolicyIcon sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />
                          <b>{t("policyLabel", language)}</b> {claim.policyName}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("descriptionLabelColon", language)}</b> {claim.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Medical Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#1E8EAB" }}
                      >
                        {t("medicalDetails", language)}
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <b>{t("diagnosisLabel", language)}</b> {claim.diagnosis}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("treatmentLabel", language)}</b> {claim.treatmentDetails}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("providerLabel", language)}</b> {claim.providerName}
                        </Typography>
                        <Typography variant="body2">
                          <b>{t("doctorLabel", language)}</b> {claim.doctorName}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Financial Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#1E8EAB" }}
                      >
                        {t("financialServiceInfo", language)}
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <MonetizationOnIcon
                            sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0, color: "green" }}
                          />
                          <b>{t("amountLabel", language)}</b> ${claim.amount}
                        </Typography>
                        <Typography variant="body2">
                          <EventIcon
                            sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0, color: "orange" }}
                          />
                          <b>{t("serviceDateLabel", language)}</b> {claim.serviceDate}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1, color: "#1E8EAB" }}
                      >
                        {t("statusMetadata", language)}
                      </Typography>
                      <Stack spacing={1}>
                        <Chip
                          label={claim.status}
                          color={
                            claim.status === "APPROVED"
                              ? "success"
                              : claim.status === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          sx={{ fontWeight: "bold", width: "fit-content" }}
                        />
                        <Typography variant="body2">
                          <b>{t("submittedAtLabel", language)}</b>{" "}
                          {new Date(claim.submittedAt).toLocaleString()}
                        </Typography>
                        {claim.approvedAt && (
                          <Typography variant="body2" color="success.main">
                            <b>{t("approvedAtLabel", language)}</b>{" "}
                            {new Date(claim.approvedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectedAt && (
                          <Typography variant="body2" color="error">
                            <b>{t("rejectedAtLabel", language)}</b>{" "}
                            {new Date(claim.rejectedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectionReason && (
                          <Typography variant="body2" color="error">
                            <b>{t("reasonLabel", language)}</b> {claim.rejectionReason}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end", gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={claim.status === "APPROVED"}
                    onClick={() => handleApprove(claim.id)}
                  >
                    {t("approve", language)}
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={claim.status === "REJECTED"}
                    onClick={() => handleOpenReject(claim)}
                  >
                    {t("reject", language)}
                  </Button>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>{t("rejectClaim", language)}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("rejectionReason", language)}
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>{t("cancel", language)}</Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="error"
          >
            {t("confirmReject", language)}
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
    </Box>
  );
};

export default ClaimsManage;
