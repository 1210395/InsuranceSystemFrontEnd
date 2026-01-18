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
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const LabRequestDialogs = memo(({
  uploadDialog,
  imageDialog,
  snackbar,
  uploadFile,
  uploading,
  enteredPrice,
  onUploadDialogClose,
  onImageDialogClose,
  onSnackbarClose,
  onFileChange,
  onPriceChange,
  onUploadSubmit,
}) => {
  const { language, isRTL } = useLanguage();

  return (
    <>
      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog.open}
        onClose={onUploadDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#F5F5DC", color: "#556B2F", fontWeight: 700 }}>
          {t("uploadLabResult", language)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("uploadLabResultFor", language)} {uploadDialog.request?.memberName}
          </Typography>

          {/* Price Input */}
          <TextField
            fullWidth
            label={t("enterLabTestPrice", language)}
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            value={enteredPrice}
            onChange={onPriceChange}
            disabled={uploading}
            sx={{ mb: 3 }}
            placeholder="e.g., 50.00"
            helperText={t("enterTestPriceHelper", language)}
            variant="outlined"
          />

          {/* File Upload */}
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            {t("uploadResultFile", language)}
          </Typography>
          <Box
            sx={{
              border: "2px dashed #556B2F",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "#f5f5f5",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#F5F5DC",
                borderColor: "#7B8B5E",
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
            <FileUploadIcon sx={{ fontSize: 48, color: "#556B2F", mb: 1 }} />
            <Typography variant="body2" fontWeight={600} color="#667eea">
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
            color="primary"
            disabled={!uploadFile || uploading}
            sx={{ px: 4 }}
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
  onUploadDialogClose: PropTypes.func.isRequired,
  onImageDialogClose: PropTypes.func.isRequired,
  onSnackbarClose: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onUploadSubmit: PropTypes.func.isRequired,
};

export default LabRequestDialogs;
