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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const RadiologyRequestDialogs = memo(({
  uploadDialog,
  imageDialog,
  snackbar,
  uploadFile,
  uploading,
  enteredPrice,
  onUploadDialogClose,
  onFileChange,
  onPriceChange,
  onUploadConfirm,
  onImageDialogClose,
  onSnackbarClose,
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
              color: "#556B2F",
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FileUploadIcon /> {t("uploadRadiologyResult", language)}
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

          <Box>
            <TextField
              fullWidth
              label={t("resultPriceOptional", language)}
              type="number"
              value={enteredPrice}
              onChange={onPriceChange}
              placeholder={t("enterPriceIfAvailable", language)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₪</Typography>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onUploadDialogClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
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
              background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
            }}
          >
            {uploading ? t("uploading", language) : t("upload", language)}
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
  onUploadDialogClose: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onUploadConfirm: PropTypes.func.isRequired,
  onImageDialogClose: PropTypes.func.isRequired,
  onSnackbarClose: PropTypes.func.isRequired,
};

export default RadiologyRequestDialogs;
