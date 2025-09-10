import React, { useState } from "react";
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
import LockResetIcon from "@mui/icons-material/LockReset";
import LockIcon from "@mui/icons-material/Lock";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🟢 استخراج token من الرابط
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        token,
        newPassword,
      });

      // 🟢 مسح أي حالة مخزنة بالـ localStorage
      localStorage.removeItem("authMode");

    setMessage("✅ Password has been reset successfully. Redirecting...");
setTimeout(() => {
  localStorage.setItem("authMode", "signin");
  navigate("/LandingPage"); // يرجع مباشرة لشاشة تسجيل الدخول
}, 2000);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("❌ Failed to reset password. Try again.");
    }
  };

  return (
    <Container component="main" maxWidth={false} disableGutters>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(145deg, #ffffff, #f0f5ff)",
          p: 4,
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: "460px",
          margin: "40px auto",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#120460", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#120460" }}>
          Reset Password
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#1E8EAB" }} />
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
              background: "linear-gradient(90deg, #120460, #1E8EAB)",
              "&:hover": { transform: "scale(1.02)" },
              borderRadius: "10px",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Reset Password
          </Button>

          {message && (
            <Typography sx={{ mt: 2, color: message.startsWith("✅") ? "green" : "red" }}>
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;
