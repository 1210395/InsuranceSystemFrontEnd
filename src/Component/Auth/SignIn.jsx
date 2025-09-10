import React from "react";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";

const SignIn = ({ setMode }) => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const payload = {
      username: data.get("username"),
      password: data.get("password"),
    };

    try {
  // 1) تسجيل الدخول
  const res = await axios.post("http://localhost:8080/api/auth/login", payload);
  const token = res.data.token;
  localStorage.setItem("token", token);

  // 2) جلب بيانات المستخدم
  const meRes = await axios.get("http://localhost:8080/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const user = meRes.data;

  // 3) تخزين البيانات في localStorage
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("username", user.username || "");
  localStorage.setItem("roles", JSON.stringify(user.roles || []));

  // ✅ لا تعمل alert هنا → خلّي الدخول مباشر
  // 4) التوجيه حسب الرول
 const roles = user.roles || [];
if (roles.includes("INSURANCE_MANAGER")) {
  window.location.href = "/ManagerDashboard";
} else if (roles.includes("EMERGENCY_MANAGER")) {
  window.location.href = "/EmergencyDashboard"; // 👈 جديد
} else if (roles.includes("DOCTOR")) {
  window.location.href = "/DoctorDashboard";
} else if (roles.includes("PHARMACIST")) {
  window.location.href = "/PharmacistDashboard";
} else if (roles.includes("LAB_EMPLOYEE")) {
  window.location.href = "/LabDashboard";
} else {
  window.location.href = "/ClientDashboard";
}

} catch (err) {
  console.error(err.response?.data || err.message);
  alert("❌ Invalid username or password"); // 👈 فقط لو كان في خطأ
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
          background: "linear-gradient(145deg, #ffffff, #bed9faff)",
          p: 4,
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          border: "1px solid #e0e6ed",
          maxWidth: "460px",
          margin: "0 auto",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "#120460", width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="medium" />
        </Avatar>

        <Typography
          component="h1"
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", color: "#120460" }}
        >
          Sign In
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          {/* Username */}
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
          />

          {/* Password */}
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
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
            Sign In
          </Button>

          <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setMode("forgot");
  }}
  style={{ color: "#1E8EAB", fontWeight: "600", textDecoration: "none" }}
>
  Forgot Password?
</a>


          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Don’t have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("signup");
                  }}
                  style={{
                    color: "#120460",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Sign Up
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default SignIn;
