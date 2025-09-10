import React, { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
    FormControl,
  FormHelperText,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import LockIcon from "@mui/icons-material/Lock";
import axios from "axios";

const SignUp = ({ setMode }) => {
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!agreeToPolicy) {
    alert("⚠️ You must agree to the University Health Insurance Policy before signing up.");
    return; // ⬅️ يوقف العملية وما يرسل للباك
  }

  const form = new FormData(event.currentTarget);

  const payload = {
    username: form.get("username"),
    fullName: form.get("fullName"),
    email: form.get("email"),
    phone: form.get("phone"),
    password: form.get("password"),
    desiredRole: form.get("desiredRole"),
    agreeToPolicy: agreeToPolicy,
  };

  const file = form.get("universityCard");

  try {
    const data = new FormData();
    data.append("data", JSON.stringify(payload));
    if (file && file.size > 0) {
      data.append("universityCard", file);
    }

    const res = await axios.post("http://localhost:8080/api/auth/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("✅ Registration successful!");
    console.log("Registered:", res.data);
    setMode("signin");
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    alert("❌ Registration failed.");
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
          Sign Up
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

          {/* Full Name */}
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            id="fullName"
            label="Full Name"
            name="fullName"
            autoComplete="name"
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

          {/* Email */}
          <TextField
            margin="normal"
            size="small"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
          />

          {/* Phone */}
          <TextField
            margin="normal"
            size="small"
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
          />

          {/* Desired Role */}
          <TextField
            margin="normal"
            size="small"
            select
            fullWidth
            id="desiredRole"
            label="Desired Role"
            name="desiredRole"
            defaultValue="INSURANCE_CLIENT"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WorkIcon sx={{ color: "#1E8EAB" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#000", fontWeight: "bold" },
            }}
          >
            <MenuItem value="INSURANCE_CLIENT">Insurance Client</MenuItem>
            <MenuItem value="DOCTOR">Doctor</MenuItem>
            <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
            <MenuItem value="LAB_EMPLOYEE">Lab Employee</MenuItem>
          </TextField>

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
            autoComplete="new-password"
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

          {/* Upload University Card */}
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              mt: 3,
              mb: 2,
              borderColor: "#1E8EAB",
              color: "#1E8EAB",
              borderRadius: "10px",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                borderColor: "#120460",
                color: "#120460",
                backgroundColor: "#f4f7ff",
              },
            }}
          >
            Upload University Card
            <input type="file" hidden name="universityCard" />
          </Button>

        <FormControl error={!agreeToPolicy} component="fieldset" sx={{ mt: 1 }}>
  <FormControlLabel
    control={
      <Checkbox
        checked={agreeToPolicy}
        onChange={(e) => setAgreeToPolicy(e.target.checked)}
        sx={{
          color: "#1E8EAB",
          "&.Mui-checked": { color: "#120460" },
        }}
      />
    }
    label={
      <Typography variant="body2" sx={{ color: "#333" }}>
        I agree to the <b>University Health Insurance Policy</b>
      </Typography>
    }
  />
  {!agreeToPolicy && (
    <FormHelperText>You must agree before signing up.</FormHelperText>
  )}
</FormControl>


          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 2,
              py: 1.3,
              background: "linear-gradient(90deg, #120460, #1E8EAB)",
              "&:hover": { transform: "scale(1.02)" },
              borderRadius: "10px",
              fontWeight: "bold",
              transition: "0.2s",
            }}
          >
            Sign Up
          </Button>

          {/* Already have account */}
          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("signin");
                  }}
                  style={{
                    color: "#120460",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUp;
