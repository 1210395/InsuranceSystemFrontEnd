import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  InputAdornment,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import LockResetIcon from "@mui/icons-material/LockReset";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import logger from "../../utils/logger";

const ForgotPassword = memo(function ForgotPassword({ setMode }) {
  const { language, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setMessage(t("checkEmailForResetInstructions", language));
    } catch (err) {
      logger.error(err.response?.data || err.message);
      setMessage(t("failedToSendResetLink", language));
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
          p: 4,
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: "460px",
          margin: "0 auto",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#556B2F", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#556B2F" }}>
          {t("forgotPasswordTitle", language)}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t("email", language)}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon sx={{ color: "#7B8B5E" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
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
            {t("sendResetLink", language)}
          </Button>

          {message && (
            <Typography sx={{ mt: 2, color: message === t("checkEmailForResetInstructions", language) ? "green" : "red" }}>
              {message}
            </Typography>
          )}

          <Typography variant="body2" sx={{ mt: 2 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode("signin");
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

ForgotPassword.propTypes = {
  setMode: PropTypes.func.isRequired,
};

export default ForgotPassword;
