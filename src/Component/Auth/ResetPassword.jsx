import React, { useState, memo } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import LockIcon from "@mui/icons-material/Lock";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import logger from "../../utils/logger";

const ResetPassword = memo(function ResetPassword() {
  const { language, isRTL } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setSeverity("error");
      setMessage(t("passwordsDoNotMatch", language));
      return;
    }

    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });

      localStorage.removeItem("authMode");
      setSeverity("success");
      setMessage(t("passwordResetSuccessRedirecting", language));
      setTimeout(() => {
        localStorage.setItem("authMode", "signin");
        navigate("/LandingPage");
      }, 2000);
    } catch (err) {
      logger.error(err.response?.data || err.message);
      setSeverity("error");
      setMessage(err.response?.data?.message || t("failedToResetPasswordTryAgain", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={false} disableGutters dir={isRTL ? "rtl" : "ltr"}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(145deg, #FFFFFF, #E8EDE0)",
          p: { xs: 2.5, sm: 4 },
          borderRadius: { xs: "12px", sm: "18px" },
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: "460px",
          margin: { xs: "20px auto", sm: "40px auto" },
          mx: { xs: 2, sm: "auto" },
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#556B2F", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#556B2F" }}>
          {t("resetPassword", language)}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t("enterNewPassword", language)}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#7B8B5E" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label={t("confirmNewPassword", language)}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#7B8B5E" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.3,
              background: "linear-gradient(90deg, #556B2F, #7B8B5E)",
              "&:hover": { transform: "scale(1.02)" },
              borderRadius: "10px",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : t("resetMyPassword", language)}
          </Button>

          {message && (
            <Alert severity={severity} sx={{ mt: 2, borderRadius: 2 }}>
              {message}
            </Alert>
          )}

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/LandingPage");
              }}
              style={{ color: "#556B2F", fontWeight: "600", textDecoration: "none" }}
            >
              {t("backToSignIn", language)}
            </a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
});

export default ResetPassword;
