import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import Header from "../CoordinationHeader";
import Sidebar from "../CoordinationSidebar";

import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import GavelIcon from "@mui/icons-material/Gavel";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import { api } from "../../../utils/apiService";
import { API_ENDPOINTS, CURRENCY } from "../../../config/api";
import { CLAIM_STATUS, getStatusColor as getClaimStatusColor, getStatusLabel } from "../../../config/claimStateMachine";
import { ROLES } from "../../../config/roles";
import { formatDate as formatDateUtil, downloadBlob } from "../../../utils/helpers";
import { sanitizeString } from "../../../utils/sanitize";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const ClaimsList = () => {
  const { language, isRTL } = useLanguage();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
const [reportType, setReportType] = useState("");
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [openImageDialog, setOpenImageDialog] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success",
});
const [isExporting, setIsExporting] = useState(false);

// Function to open image dialog
const handleOpenImageDialog = (imagePath) => {
  setSelectedImage(imagePath);
  setOpenImageDialog(true);
};


  // Fetch final claims using centralized API service
  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.FINAL_DECISIONS);

      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.approvedAt || b.rejectedAt) -
          new Date(a.approvedAt || a.rejectedAt)
      );

      setClaims(
        sorted.filter(
          (c) =>
            c.status === CLAIM_STATUS.APPROVED_FINAL ||
            c.status === CLAIM_STATUS.REJECTED_FINAL
        )
      );
    } catch (err) {
      console.error("Failed to fetch claims:", err);
      setSnackbar({
        open: true,
        message: t("failedLoadClaims", language),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Memoized filtered claims
  const filteredClaims = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return claims.filter((claim) => {
      const matchesSearch =
        claim.clientName?.toLowerCase().includes(q) ||
        claim.employeeId?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [claims, searchQuery, statusFilter]);

  // Use centralized formatDate utility
  const formatDate = useCallback((date) => {
    return date ? formatDateUtil(date, 'full') : "—";
  }, []);

  // Use centralized status functions
  const getStatusInfo = useCallback((status) => {
    switch (status) {
      case CLAIM_STATUS.APPROVED_FINAL:
        return { color: "success", label: "Approved" };
      case CLAIM_STATUS.REJECTED_FINAL:
        return { color: "error", label: "Rejected" };
      default:
        return { color: getClaimStatusColor(status), label: getStatusLabel(status, true) };
    }
  }, []);


  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#F5F7FB",
          minHeight: "100vh",
          ml: isRTL ? 0 : "240px",
          mr: isRTL ? "240px" : 0,
        }}
      >
        <Header />

        <Box sx={{ p: 4 }}>
          {/* PAGE TITLE */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#1A237E",
              mb: 1,
              display: "flex",
              alignItems: "center",
            }}
          >          </Typography>

       
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
  <Typography
    variant="h4"
    fontWeight="bold"
    sx={{ color: "#1A237E", display: "flex", alignItems: "center" }}
  >
    <AssignmentIcon sx={{ mr: 1, fontSize: 35 }} />
    {t("finalClaimsRecords", language)}
  </Typography>
<Button
  variant="contained"
  color="error"
  disabled={!reportType || isExporting}
  onClick={async () => {
    if (!reportType || isExporting) return;

    setIsExporting(true);
    try {
      const params = {
        type: reportType,
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      };

      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.REPORTS_PDF, {
        params,
        responseType: "blob",
      });

      downloadBlob(res.data, `report_${reportType.toLowerCase()}.pdf`, "application/pdf");
      setSnackbar({
        open: true,
        message: t("reportExportedSuccess", language),
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: t("pdfExportFailed", language),
        severity: "error",
      });
    } finally {
      setIsExporting(false);
    }
  }}
>
  {isExporting ? <CircularProgress size={20} color="inherit" /> : t("exportReportPDF", language)}
</Button>



</Box>

          {/* FILTER BAR */}
          <Paper
            sx={{
              p: 2,
              mb: 4,
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              borderRadius: 3,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <TextField
              label={t("searchByPatientNameOrInsuranceId", language)}
              size="small"
              sx={{ minWidth: 280 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t("status", language)}</InputLabel>
              <Select
                value={statusFilter}
                label={t("status", language)}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">{t("all", language)}</MenuItem>
                <MenuItem value={CLAIM_STATUS.APPROVED_FINAL}>{t("approved", language)}</MenuItem>
                <MenuItem value={CLAIM_STATUS.REJECTED_FINAL}>{t("rejected", language)}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
  <InputLabel>{t("reportType", language)}</InputLabel>
  <Select
  value={reportType}
  label={t("reportType", language)}
  onChange={(e) => setReportType(e.target.value)}
>
  <MenuItem value="">
    <em>{t("selectReportType", language)}</em>
  </MenuItem>
  <MenuItem value="DOCTOR">{t("doctor", language)}</MenuItem>
  <MenuItem value="PHARMACY">{t("pharmacy", language)}</MenuItem>
  <MenuItem value="LAB">{t("lab", language)}</MenuItem>
  <MenuItem value="RADIOLOGY">{t("radiology", language)}</MenuItem>
  <MenuItem value="CLIENT">{t("client", language)}</MenuItem>
</Select>

</FormControl>
<TextField
  type="date"
  size="small"
  label={t("fromDate", language)}
  InputLabelProps={{ shrink: true }}
  value={fromDate}
  onChange={(e) => setFromDate(e.target.value)}
/>

<TextField
  type="date"
  size="small"
  label={t("toDate", language)}
  InputLabelProps={{ shrink: true }}
  value={toDate}
  onChange={(e) => setToDate(e.target.value)}
/>


<Button
  variant="outlined"
  onClick={() => {
   setSearchQuery("");
setStatusFilter("ALL");
setReportType("");
setFromDate("");
setToDate("");

  }}
>
  {t("clear", language)}
</Button>


          </Paper>

          {/* MAIN CONTENT */}
          {loading ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <CircularProgress sx={{ color: "#1A237E" }} />
            </Box>
          ) : filteredClaims.length === 0 ? (
            <Typography>{t("noClaimsFound", language)}</Typography>
          ) : (
            filteredClaims.map((claim) => {
              const statusInfo = getStatusInfo(claim.status);


              const hideClientInfo =
  reportType &&
  reportType !== "CLIENT";

              return (
                <Paper
                  key={claim.id}
                  sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: "#fff",
                    boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
                  }}
                >
                  <Grid container spacing={3}>
                    {/* PATIENT + PROVIDER INFO */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#3949AB" }}
                      >
{hideClientInfo
  ? t("providerDetails", language)
  : t("patientProviderDetails", language)}

                      </Typography>

                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography>
                            <MedicalServicesIcon
                              sx={{ mr: 1, color: "#00796B" }}
                            />
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

                      {!hideClientInfo && (
  <Typography>
    <PersonIcon sx={{ mr: 1, color: "#303F9F" }} />
    <b>{t("patient", language)}:</b> {claim.clientName}
  </Typography>
)}



                       {!hideClientInfo && claim.employeeId && (
  <Typography>
    <PersonIcon sx={{ mr: 1, color: "#303F9F" }} />
    <b>{t("employeeId", language)}:</b> {claim.employeeId}
  </Typography>
)}


                        {claim.diagnosis && (
                          <Typography sx={{ mt: 1 }}>
                            <b>{t("diagnosis", language)}:</b> {claim.diagnosis}
                          </Typography>
                        )}

                       {claim.description && (
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
            : "#F5F5F5",
      }}
    >
      {sanitizeString(claim.description)}
    </Box>
  </Typography>
)}

                      </Stack>
                    </Grid>

                    {/* FINANCIAL INFO */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#3949AB" }}
                      >
                        {t("financialServiceInfo", language)}
                      </Typography>

                      <Stack spacing={1.5}>
                        <Typography>
                          <MonetizationOnIcon
                            sx={{ mr: 1, color: "#2E7D32" }}
                          />
                          <b>{t("amount", language)}:</b> {claim.amount} {CURRENCY.CODE}
                        </Typography>

                        <Typography>
                          <EventIcon sx={{ mr: 1, color: "#FB8C00" }} />
                          <b>{t("serviceDate", language)}:</b> {formatDate(claim.serviceDate)}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* REVIEW SUMMARY */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />

                      <Typography
                        fontWeight="bold"
                        sx={{ color: "#3949AB", mb: 2 }}
                      >
                        {t("reviewSummary", language)}
                      </Typography>

                      <Stack direction="row" spacing={6} flexWrap="wrap">
                        <Box>
                          <Typography>
                            <VerifiedUserIcon
                              sx={{ mr: 1, color: "#1E88E5" }}
                            />
                            <b>{t("medicalReviewer", language)}:</b>{" "}
                            {claim.medicalReviewerName}
                          </Typography>

                          <Typography>
                            <b>{t("medicalReviewDate", language)}:</b>{" "}
                            {formatDate(claim.medicalReviewedAt)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography>
                            <GavelIcon sx={{ mr: 1, color: "#8E24AA" }} />
                            <b>{t("finalDecisionDate", language)}:</b>{" "}
                            {claim.approvedAt
                              ? formatDate(claim.approvedAt)
                              : formatDate(claim.rejectedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* STATUS DISPLAY */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />

                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        sx={{
                          px: 3,
                          py: 1,
                          fontSize: "1rem",
                          fontWeight: "bold",
                        }}
                      />

                      {claim.rejectionReason && (
                        <Typography
                          sx={{
                            mt: 2,
                            color: "#C62828",
                            background: "#FFEBEE",
                            p: 2,
                            borderRadius: 2,
                          }}
                        >
                          <b>{t("rejectionReason", language)}:</b> {sanitizeString(claim.rejectionReason)}
                        </Typography>
                      )}
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
        cursor: "zoom-in",  // عند النقر على الصورة
      }}
      onClick={() => handleOpenImageDialog(claim.invoiceImagePath)} // عند النقر على الصورة
    />
  </Box>
)}


                    </Grid>
                  </Grid>
                </Paper>
              );
            })
          )}
        </Box>
      </Box>

      {/* Image Preview Dialog - moved outside map */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md" fullWidth>
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
          <Button onClick={() => setOpenImageDialog(false)}>{t("close", language)}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClaimsList;
