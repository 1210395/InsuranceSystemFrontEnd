import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { api, setToken, setUser, setRoles } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { ROLES, normalizeRoles, getDashboardRoute } from "../../config/roles";
import { sanitizeString } from "../../utils/sanitize";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const SignIn = memo(function SignIn({ setMode }) {
  const { language, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(event.currentTarget);

    // Sanitize inputs
    const payload = {
      email: sanitizeString(data.get("email")),
      password: data.get("password"), // Don't sanitize password - it may contain special chars
    };

    // Basic validation
    if (!payload.email || !payload.password) {
      setError(t("enterBothEmailAndPassword", language));
      setLoading(false);
      return;
    }

    try {
      // 1) Login - api.post returns response.data directly
      const loginResponse = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      const token = loginResponse.token;
      setToken(token);

      // 2) Fetch user data - api.get returns response.data directly
      const user = await api.get(API_ENDPOINTS.AUTH.ME);

      // 3) Store data using centralized service
      setUser(user);

      // Handle roles - use requestedRole if roles array is empty but user is approved
      let effectiveRoles = user.roles || [];
      if ((!effectiveRoles || effectiveRoles.length === 0) && user.requestedRole && user.roleRequestStatus === 'APPROVED') {
        effectiveRoles = [user.requestedRole];
      }
      setRoles(effectiveRoles);

      // 4) Redirect based on role using centralized role utilities
      const userRoles = normalizeRoles(effectiveRoles);
      const dashboardRoute = getDashboardRoute(userRoles);

      window.location.href = dashboardRoute;

    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || t("invalidEmailOrPassword", language));
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
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: "12px", sm: "15px", md: "18px" },
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: { xs: "100%", sm: "400px", md: "460px" },
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#556B2F", width: { xs: 48, sm: 52, md: 56 }, height: { xs: 48, sm: 52, md: 56 } }}>
          <LockOutlinedIcon fontSize="medium" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: { xs: 2, md: 3 }, fontWeight: "bold", color: "#556B2F", fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" } }}
        >
          {t("signIn", language)}
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: { xs: "0.8rem", md: "0.875rem" } }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            id="email"
            label={t("email", language)}
            name="email"
            type="email"
            autoComplete="email"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#7B8B5E", fontSize: { xs: 20, md: 24 } }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: { xs: 44, md: 40 },
              },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.95rem", md: "1rem" },
              },
            }}
          />

          {/* Password */}
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            name="password"
            label={t("password", language)}
            type="password"
            id="password"
            autoComplete="current-password"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#7B8B5E", fontSize: { xs: 20, md: 24 } }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: { xs: 44, md: 40 },
              },
              "& .MuiInputBase-input": {
                fontSize: { xs: "0.95rem", md: "1rem" },
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: { xs: 2, md: 3 },
              mb: 2,
              py: { xs: 1.5, md: 1.3 },
              minHeight: { xs: 48, md: 44 },
              background: loading ? "#ccc" : "linear-gradient(90deg, #556B2F, #7B8B5E)",
              "&:hover": { transform: loading ? "none" : "scale(1.02)" },
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: { xs: "0.95rem", md: "1rem" },
              transition: "0.2s",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t("signIn", language)}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setMode("forgot");
              }}
              style={{ color: "#7B8B5E", fontWeight: "600", textDecoration: "none", fontSize: "0.9rem" }}
            >
              {t("forgotPassword", language)}
            </a>
          </Box>

          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2" sx={{ mt: 2, fontSize: { xs: "0.85rem", md: "0.875rem" } }}>
                {t("dontHaveAccount", language)}{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("signup");
                  }}
                  style={{
                    color: "#556B2F",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  {t("signUp", language)}
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
});

SignIn.propTypes = {
  setMode: PropTypes.func.isRequired,
};

export default SignIn;