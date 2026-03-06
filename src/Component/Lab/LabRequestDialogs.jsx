import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Stack,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const LabRequestDialogs = memo(({
  acceptDialog,
  uploadDialog,
  imageDialog,
  snackbar,
  uploadFile,
  uploading,
  enteredPrice,
  onAcceptDialogClose,
  onUploadDialogClose,
  onImageDialogClose,
  onSnackbarClose,
  onFileChange,
  onPriceChange,
  onAcceptSubmit,
  onUploadSubmit,
}) => {
  const { language, isRTL } = useLanguage();

  return (
    <>
      {/* Accept Dialog - Price only (Step 1) */}
      <Dialog
        open={acceptDialog?.open || false}
        onClose={onAcceptDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#e3f2fd", color: "#1565C0", fontWeight: 700 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlayArrowIcon />
            {t("acceptAndStart", language)}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {acceptDialog?.request?.memberName} — {acceptDialog?.request?.testName}
          </Typography>

          {/* Coverage Info */}
          {(() => {
            const req = acceptDialog?.request;
            const covStatus = req?.coverageStatus || "COVERED";
            const covPercent = req?.coveragePercentage ?? 100;
            const covColor = covStatus === "NOT_COVERED" ? "#ef4444" : covStatus === "REQUIRES_APPROVAL" ? "#f59e0b" : "#10b981";
            const covBg = covStatus === "NOT_COVERED" ? "#fee2e2" : covStatus === "REQUIRES_APPROVAL" ? "#fef3c7" : "#d1fae5";
            const covLabel = covStatus === "NOT_COVERED" ? (t("notCovered", language) || "Not Covered") : covStatus === "REQUIRES_APPROVAL" ? (t("requiresApproval", language) || "Requires Approval") : covPercent < 100 ? `${t("covered", language) || "Covered"} (${covPercent}%)` : (t("fullyCovered", language) || "Fully Covered");
            return (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: covBg + "30", border: `1px solid ${covColor}40` }}>
                <Chip label={covLabel} size="small" sx={{ bgcolor: covBg, color: covColor, fontWeight: 700, fontSize: "0.7rem", mb: 1 }} />
                {req?.unionPrice > 0 && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {t("definedPrice", language) || "Defined Price"}: {parseFloat(req.unionPrice).toFixed(2)} ₪
                  </Typography>
                )}
              </Box>
            );
          })()}

          {/* Price Input */}
          <TextField
            fullWidth
            label={t("enterTestPrice", language)}
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={enteredPrice}
            onChange={onPriceChange}
            disabled={uploading}
            sx={{ mb: 2 }}
            placeholder="e.g., 50.00"
            helperText={t("enterTestPriceHelper", language)}
            variant="outlined"
            autoFocus
          />

          {/* Coverage Breakdown */}
          {enteredPrice > 0 && (() => {
            const req = acceptDialog?.request;
            const covStatus = req?.coverageStatus || "COVERED";
            const covPercent = req?.coveragePercentage ?? 100;
            const priceNum = parseFloat(enteredPrice) || 0;
            const unionPrice = parseFloat(req?.unionPrice) || 0;
            const approvedPrice = unionPrice > 0 ? Math.min(priceNum, unionPrice) : priceNum;
            const insurancePays = covStatus === "NOT_COVERED" ? 0 : (approvedPrice * covPercent / 100);
            const patientPays = priceNum - insurancePays;
            return (
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: covStatus === "NOT_COVERED" ? "#fee2e2" : covPercent < 100 ? "#fef3c7" : "#d1fae5", border: `1px solid ${covStatus === "NOT_COVERED" ? "#ef4444" : covPercent < 100 ? "#f59e0b" : "#10b981"}` }}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">{t("totalPrice", language) || "Total"}</Typography>
                    <Typography variant="body2" fontWeight={600}>{priceNum.toFixed(2)} ₪</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600, fontSize: "0.65rem" }}>{t("insurancePaysAmount", language) || "Insurance Pays"}</Typography>
                    <Typography variant="body2" fontWeight={700} color="#10b981">{insurancePays.toFixed(2)} ₪</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: patientPays > 0 ? "#ef4444" : "#10b981", fontWeight: 600, fontSize: "0.65rem" }}>{t("clientPaysAmount", language) || "Patient Pays"}</Typography>
                    <Typography variant="body2" fontWeight={700} color={patientPays > 0 ? "#ef4444" : "#10b981"}>{patientPays.toFixed(2)} ₪</Typography>
                  </Grid>
                </Grid>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onAcceptDialogClose}
            color="inherit"
            disabled={uploading}
          >
            {t("cancel", language)}
          </Button>
          <Button
            onClick={onAcceptSubmit}
            variant="contained"
            disabled={!enteredPrice || parseFloat(enteredPrice) <= 0 || uploading}
            sx={{ px: 4, bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}
          >
            {uploading ? <CircularProgress size={20} color="inherit" /> : t("acceptAndStart", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog - File only (Step 2) */}
      <Dialog
        open={uploadDialog.open}
        onClose={onUploadDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileUploadIcon />
            {t("uploadResultsOnly", language)}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {uploadDialog.request?.memberName} — {uploadDialog.request?.testName}
          </Typography>

          {/* File Upload */}
          <Box
            sx={{
              border: "2px dashed #2e7d32",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "#f5f5f5",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#e8f5e9",
                borderColor: "#1b5e20",
              },
            }}
            component="label"
          >
            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={onFileChange}
              disabled={uploading}
            />
            <FileUploadIcon sx={{ fontSize: 48, color: "#2e7d32", mb: 1 }} />
            <Typography variant="body2" fontWeight={600} color="#2e7d32">
              {t("clickToSelectFile", language)}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {t("supportedFormats", language)}
            </Typography>
          </Box>

          {uploadFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#e8f5e9", borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} color="#2e7d32">
                {t("selected", language)}: {uploadFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("size", language)}: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onUploadDialogClose}
            color="inherit"
            disabled={uploading}
          >
            {t("cancel", language)}
          </Button>
          <Button
            onClick={onUploadSubmit}
            variant="contained"
            disabled={!uploadFile || uploading}
            sx={{ px: 4, bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          >
            {uploading ? <CircularProgress size={20} color="inherit" /> : t("upload", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar - Enhanced Styling */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "success" ? 4000 : 5000}
        onClose={onSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbar-root": {
            top: "80px !important",
          },
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={onSnackbarClose}
          icon={snackbar.icon}
          sx={{
            width: "100%",
            minWidth: "300px",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
            },
            ...(snackbar.severity === "success" && {
              backgroundColor: "#8B9A46",
              color: "white",
              "& .MuiAlert-icon": {
                color: "white",
              },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              },
            }),
            ...(snackbar.severity === "error" && {
              backgroundColor: "#ef4444",
              color: "white",
              "& .MuiAlert-icon": {
                color: "white",
              },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              },
            }),
            ...(snackbar.severity === "warning" && {
              backgroundColor: "#f59e0b",
              color: "white",
              "& .MuiAlert-icon": {
                color: "white",
              },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              },
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Dialog - Zoom in university card image */}
      <Dialog
        open={imageDialog.open}
        onClose={onImageDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.9)",
            borderRadius: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          {imageDialog.imageUrl && (
            <Box
              component="img"
              src={imageDialog.imageUrl}
              alt="University Card"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "rgba(0, 0, 0, 0.9)", p: 1 }}>
          <Button
            onClick={onImageDialogClose}
            sx={{ color: "white" }}
          >
            {t("close", language)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

LabRequestDialogs.propTypes = {
  acceptDialog: PropTypes.shape({
    open: PropTypes.bool,
    request: PropTypes.object,
  }),
  uploadDialog: PropTypes.shape({
    open: PropTypes.bool,
    request: PropTypes.object,
  }).isRequired,
  imageDialog: PropTypes.shape({
    open: PropTypes.bool,
    url: PropTypes.string,
  }).isRequired,
  snackbar: PropTypes.shape({
    open: PropTypes.bool,
    message: PropTypes.string,
    severity: PropTypes.string,
  }).isRequired,
  uploadFile: PropTypes.object,
  uploading: PropTypes.bool,
  enteredPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAcceptDialogClose: PropTypes.func,
  onUploadDialogClose: PropTypes.func.isRequired,
  onImageDialogClose: PropTypes.func.isRequired,
  onSnackbarClose: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onAcceptSubmit: PropTypes.func,
  onUploadSubmit: PropTypes.func.isRequired,
};

export default LabRequestDialogs;
