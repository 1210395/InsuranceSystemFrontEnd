import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Grid,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const RadiologyRequestDialogs = memo(({
  acceptDialog,
  uploadDialog,
  imageDialog,
  snackbar,
  uploadFile,
  uploading,
  enteredPrice,
  onAcceptDialogClose,
  onUploadDialogClose,
  onFileChange,
  onPriceChange,
  onAcceptConfirm,
  onUploadConfirm,
  onImageDialogClose,
  onSnackbarClose,
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: "700",
              color: "#1565C0",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <PlayArrowIcon /> {t("acceptAndStart", language)}
          </Typography>

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

          <Box>
            <TextField
              fullWidth
              label={t("enterTestPrice", language)}
              type="number"
              value={enteredPrice}
              onChange={onPriceChange}
              placeholder="e.g., 50.00"
              inputProps={{ step: "0.01", min: "0" }}
              helperText={t("enterTestPriceHelper", language)}
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

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
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: covStatus === "NOT_COVERED" ? "#fee2e2" : covPercent < 100 ? "#fef3c7" : "#d1fae5", border: `1px solid ${covStatus === "NOT_COVERED" ? "#ef4444" : covPercent < 100 ? "#f59e0b" : "#10b981"}` }}>
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

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onAcceptDialogClose}
            variant="outlined"
            disabled={uploading}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("cancel", language)}
          </Button>
          <Button
            onClick={onAcceptConfirm}
            variant="contained"
            disabled={!enteredPrice || parseFloat(enteredPrice) <= 0 || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            {uploading ? t("acceptingTest", language) : t("acceptAndStart", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog - File only (Step 2) */}
      <Dialog
        open={uploadDialog.open}
        onClose={onUploadDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: "700",
              color: "#2e7d32",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FileUploadIcon /> {t("uploadResultsOnly", language)}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {uploadDialog.request?.memberName} — {uploadDialog.request?.testName}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              type="file"
              onChange={onFileChange}
              inputProps={{
                accept: "image/*,application/pdf",
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            {uploadFile && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", color: "#4caf50" }}
              >
                {t("selected", language)}: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onUploadDialogClose}
            variant="outlined"
            disabled={uploading}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            {t("cancel", language)}
          </Button>
          <Button
            onClick={onUploadConfirm}
            variant="contained"
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <FileUploadIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              bgcolor: "#2e7d32",
              "&:hover": { bgcolor: "#1b5e20" },
            }}
          >
            {uploading ? t("uploadingResults", language) : t("upload", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={onImageDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "#000",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={onImageDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={imageDialog.imageUrl}
            alt="University Card"
            sx={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={onSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={onSnackbarClose}
          severity={snackbar.severity}
          icon={snackbar.icon}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
});

RadiologyRequestDialogs.propTypes = {
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
    icon: PropTypes.node,
  }).isRequired,
  uploadFile: PropTypes.object,
  uploading: PropTypes.bool,
  enteredPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAcceptDialogClose: PropTypes.func,
  onUploadDialogClose: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onAcceptConfirm: PropTypes.func,
  onUploadConfirm: PropTypes.func.isRequired,
  onImageDialogClose: PropTypes.func.isRequired,
  onSnackbarClose: PropTypes.func.isRequired,
};

export default RadiologyRequestDialogs;
