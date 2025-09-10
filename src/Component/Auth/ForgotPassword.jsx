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
import MailIcon from "@mui/icons-material/Mail";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";

const ForgotPassword = ({ setMode }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
      setMessage("✅ Check your email for reset instructions");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("❌ Failed to send reset link");
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
          margin: "0 auto",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#120460", width: 56, height: 56 }}>
          <LockResetIcon fontSize="medium" />
        </Avatar>

        <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#120460" }}>
          Forgot Password
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailIcon sx={{ color: "#1E8EAB" }} />
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

          <Typography variant="body2" sx={{ mt: 2 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode("signin");
              }}
              style={{ color: "#120460", fontWeight: "600", textDecoration: "none" }}
            >
              Back to Sign In
            </a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
