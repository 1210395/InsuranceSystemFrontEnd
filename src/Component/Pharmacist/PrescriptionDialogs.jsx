// src/Component/Pharmacist/PrescriptionDialogs.jsx
import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const PrescriptionDialogs = memo(({
  verifyDialog,
  documentDialog,
  imageDialog,
  snackbar,
  getDosageUnit: _getDosageUnit,
  getQuantityUnit,
  onVerifyClose,
  onVerifySubmit,
  onPriceChange,
  onReasonChange,
  onFulfilledChange,
  onDocumentClose,
  onDocumentChange,
  onDocumentSubmit,
  onImageClose,
  onSnackbarClose,
}) => {
  const { language } = useLanguage();
  return (
    <>
      {/* Verify Dialog with Prices */}
      <Dialog
        open={verifyDialog.open}
        onClose={onVerifyClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#F5F5DC", color: "#556B2F", fontWeight: 700 }}>
          {t("enterYourPrices", language)}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Check the medicines you will dispense and enter the price for each.
            <br />
            <strong>Partial fulfillment:</strong> You can dispense only some medicines if others are unavailable.
            <br />
            The price will be automatically compared with the union price and the lower amount will be used.
          </Typography>

          <Stack spacing={2}>
            {verifyDialog.prices.map((item) => (
              <Paper
                key={item.id}
                elevation={2}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: item.fulfilled ? "#FAF8F5" : "#f5f5f5",
                  opacity: item.fulfilled ? 1 : 0.7,
                  border: item.fulfilled ? "2px solid #556B2F" : "1px solid #e0e0e0",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Fulfilled Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.fulfilled !== false}
                      onChange={(e) => onFulfilledChange && onFulfilledChange(item.id, e.target.checked)}
                      sx={{
                        color: "#556B2F",
                        "&.Mui-checked": {
                          color: "#556B2F",
                        },
                      }}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={600} color={item.fulfilled !== false ? "primary" : "text.secondary"}>
                        {item.medicineName}
                      </Typography>
                      {(() => {
                        const covStatus = item.coverageStatus || "COVERED";
                        const covPercent = item.coveragePercentage ?? 100;
                        const covDisplay = covStatus === "COVERED"
                          ? { label: covPercent < 100 ? `${t("covered", language)} (${covPercent}%)` : t("covered", language), color: "#10b981", bgColor: "#d1fae5" }
                          : covStatus === "REQUIRES_APPROVAL"
                            ? { label: t("requiresApproval", language), color: "#f59e0b", bgColor: "#fef3c7" }
                            : { label: t("notCovered", language), color: "#ef4444", bgColor: "#fee2e2" };
                        return (
                          <Chip
                            label={covDisplay.label}
                            size="small"
                            sx={{
                              bgcolor: covDisplay.bgColor,
                              color: covDisplay.color,
                              fontWeight: 600,
                              fontSize: "0.6rem",
                              height: 18,
                            }}
                          />
                        );
                      })()}
                    </Stack>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5} sx={{ ml: 4 }}>
                  {item.scientificName}
                </Typography>

                {/* Show details only if fulfilled */}
                {item.fulfilled !== false && (
                <>
                {/* Display Prescription Information */}
                <Box sx={{ mb: 2, p: 1.5, bgcolor: "#FAF8F5", borderRadius: 1, border: "1px solid #7B8B5E", ml: 4 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="#556B2F" gutterBottom>
                    📋 Prescription Information
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    {(() => {
                      const isChronicPrescription = verifyDialog.prescription?.isChronic === true;
                      if (isChronicPrescription && item.calculatedQuantity != null && item.calculatedQuantity > 0) {
                        const formUpper = (item.form || "").toUpperCase();
                        const unit = formUpper === "TABLET" || formUpper === "CAPSULE" ? "pill(s)"
                                   : formUpper === "INJECTION" ? "injection(s)"
                                   : formUpper === "SYRUP" || formUpper === "DROPS" ? "bottle(s)"
                                   : formUpper === "CREAM" || formUpper === "OINTMENT" ? "tube(s)"
                                   : formUpper === "SPRAY" ? "spray(s)"
                                   : "unit(s)";
                        return (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Required Quantity:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#dc2626" sx={{ fontSize: "1.1rem" }}>
                              {item.calculatedQuantity} {unit}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                              Chronic Disease Prescription - Quantity only
                            </Typography>
                          </Grid>
                        );
                      }

                      return null;
                    })()}
                    {!verifyDialog.prescription?.isChronic && item.calculatedQuantity != null && item.calculatedQuantity > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Required Quantity:
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="primary">
                          {item.calculatedQuantity} {getQuantityUnit(item.form, item.medicineName).en}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                          {(() => {
                            const formUpper = item.form ? item.form.toUpperCase() : "";
                            if (formUpper === "SYRUP" || formUpper === "SPRAY" || formUpper === "DROPS" || formUpper === "CREAM" || formUpper === "OINTMENT") {
                              return `Number of packages needed`;
                            } else {
                              return `Number of pills/injections needed`;
                            }
                          })()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Price Input */}
                <Box sx={{ mt: 2, ml: 4 }}>
                  <TextField
                    label={`Price (₪)`}
                    type="number"
                    value={item.pharmacistPrice}
                    onChange={(e) => onPriceChange(item.id, e.target.value)}
                    fullWidth
                    placeholder="أدخل السعر..."
                    inputProps={{ min: 0, step: 0.01 }}
                    helperText={
                      (() => {
                        const unit = getQuantityUnit(item.form, item.medicineName);
                        const formUpper = item.form ? item.form.toUpperCase() : "";
                        const isLiquidOrCream = formUpper === "SYRUP" || formUpper === "SPRAY" || formUpper === "DROPS" || formUpper === "CREAM" || formUpper === "OINTMENT";

                        if (item.calculatedQuantity === 1) {
                          if (isLiquidOrCream) {
                            return `Enter price for 1 ${unit.en}`;
                          } else {
                            return `Enter price for ${item.calculatedQuantity} ${unit.en}`;
                          }
                        } else {
                          if (isLiquidOrCream) {
                            return `Enter price for ${item.calculatedQuantity} ${unit.en} (total price)`;
                          } else {
                            return `Enter price for ${item.calculatedQuantity} ${unit.en} (total price)`;
                          }
                        }
                      })()
                    }
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#fff",
                        "&:hover fieldset": {
                          borderColor: "#556B2F",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#556B2F",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Price Override Warning - shown when pharmacist price > 20% above union price */}
                {item.pharmacistPrice > 0 &&
                 item.unionPriceTotal > 0 &&
                 parseFloat(item.pharmacistPrice) > item.unionPriceTotal * 1.2 && (
                  <Box sx={{ mt: 2, ml: 4, p: 2, bgcolor: "#FFF3E0", borderRadius: 2, border: "1px solid #FF9800" }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <WarningAmberIcon sx={{ color: "#E65100" }} />
                      <Typography variant="subtitle2" fontWeight={700} color="#E65100">
                        {t("priceHigherWarning", language)}
                      </Typography>
                    </Stack>
                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">{t("definedPrice", language)}</Typography>
                        <Typography variant="body2" fontWeight={600} color="#2E7D32">
                          {item.unionPriceTotal?.toFixed(2)} ₪
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">{t("pharmacyPrice", language)}</Typography>
                        <Typography variant="body2" fontWeight={600} color="#E65100">
                          {parseFloat(item.pharmacistPrice)?.toFixed(2)} ₪
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">{t("patientPays", language)}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">
                          {(parseFloat(item.pharmacistPrice) - item.unionPriceTotal).toFixed(2)} ₪
                        </Typography>
                      </Grid>
                    </Grid>
                    <TextField
                      label={t("whyPriceHigher", language)}
                      value={item.priceHigherReason || ""}
                      onChange={(e) => onReasonChange(item.id, e.target.value)}
                      fullWidth
                      required
                      multiline
                      rows={2}
                      placeholder={language === "ar" ? "اشرح لماذا سعرك مختلف عن السعر المحدد..." : "Explain why your price differs from the defined price..."}
                      error={!item.priceHigherReason || item.priceHigherReason.trim() === ""}
                      helperText={!item.priceHigherReason ? (language === "ar" ? "هذا الحقل مطلوب عندما يكون سعرك أعلى" : "This field is required when your price is higher") : ""}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#fff",
                        },
                      }}
                    />
                  </Box>
                )}
                </>
                )}

                {/* Not fulfilled message */}
                {item.fulfilled === false && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, fontStyle: "italic" }}>
                    ❌ Not dispensing this medicine
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onVerifyClose}
            color="inherit"
          >
            {t("cancel", language)}
          </Button>
          <Button
            onClick={onVerifySubmit}
            variant="contained"
            color="success"
            sx={{ px: 4 }}
          >
            {t("verifyAndSubmit", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Dialog */}
      <Dialog
        open={documentDialog.open}
        onClose={onDocumentClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#556B2F", color: "white", fontWeight: 700 }}>
          {t("addDocumentToClaim", language)}
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
            Add description and document for this claim
          </Typography>

          {/* Description Field */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Claim Description"
            placeholder="Enter a description for this claim..."
            value={documentDialog.description}
            onChange={(e) => onDocumentChange('description', e.target.value)}
            sx={{ mb: 3 }}
            variant="outlined"
          />

          {/* Document Upload */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              border: documentDialog.document ? `2px solid #556B2F` : "2px dashed #7B8B5E",
              bgcolor: documentDialog.document ? "#F5F5DC" : "#FAF8F5",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
          >
            <Button
              variant="contained"
              component="label"
              sx={{
                background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
                mb: 2,
              }}
            >
              {t("uploadDocument", language)}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onDocumentChange('file', e.target.files[0])}
              />
            </Button>

            {documentDialog.document && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="#556B2F" fontWeight={600}>
                  ✅ {documentDialog.document.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {(documentDialog.document.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onDocumentClose}
            color="inherit"
          >
            {t("skip", language)}
          </Button>
          <Button
            onClick={onDocumentSubmit}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            disabled={documentDialog.loading}
          >
            {documentDialog.loading ? t("processing", language) : t("sendClaim", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Image Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={onImageClose}
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
            onClick={onImageClose}
            sx={{ color: "white" }}
          >
            {t("close", language)}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

PrescriptionDialogs.propTypes = {
  verifyDialog: PropTypes.shape({
    open: PropTypes.bool,
    prescription: PropTypes.object,
    prices: PropTypes.array,
    submitting: PropTypes.bool,
  }).isRequired,
  documentDialog: PropTypes.shape({
    open: PropTypes.bool,
    prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    file: PropTypes.object,
    submitting: PropTypes.bool,
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
  getDosageUnit: PropTypes.func.isRequired,
  getDailyUnit: PropTypes.func.isRequired,
  getQuantityUnit: PropTypes.func.isRequired,
  onVerifyClose: PropTypes.func.isRequired,
  onVerifySubmit: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onReasonChange: PropTypes.func,
  onFulfilledChange: PropTypes.func,
  onDocumentClose: PropTypes.func.isRequired,
  onDocumentChange: PropTypes.func.isRequired,
  onDocumentSubmit: PropTypes.func.isRequired,
  onImageClose: PropTypes.func.isRequired,
  onSnackbarClose: PropTypes.func.isRequired,
};

export default PrescriptionDialogs;
