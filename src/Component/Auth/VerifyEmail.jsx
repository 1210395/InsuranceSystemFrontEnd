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
  Alert,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const VerifyEmail = memo(function VerifyEmail({ setMode, presetEmail }) {
  const { language, isRTL } = useLanguage();
  const [email, setEmail] = useState(presetEmail || "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!code.trim() || code.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    try {
      setLoading(true);

      await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        email: email.trim(),
        code: code.trim(),
      });

      setSuccess("Email verified successfully. You can now sign in.");

      setTimeout(() => {
        setMode("signin");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <Box
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "18px",
          background: "linear-gradient(145deg, #FFFFFF, #E8EDE0)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#556B2F", width: 56, height: 56 }}>
          <MarkEmailReadIcon />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Verify Email
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, textAlign: "center" }}>
          We have sent a 6-digit verification code to your email.
          <br />
          Please enter it below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#7B8B5E" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Verification Code"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) setCode(val);
            }}
            inputProps={{ maxLength: 6 }}
            placeholder="123456"
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
              background: loading ? "#ccc" : "linear-gradient(90deg, #556B2F, #7B8B5E)",
              "&:hover": { transform: loading ? "none" : "scale(1.02)" },
              borderRadius: "10px",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setMode("signin")}
            sx={{ color: "#556B2F", fontWeight: "600" }}
          >
            Back to Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
});

VerifyEmail.propTypes = {
  setMode: PropTypes.func.isRequired,
  presetEmail: PropTypes.string,
};

VerifyEmail.defaultProps = {
  presetEmail: "",
};

export default VerifyEmail;
