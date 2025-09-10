import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  Button,
  Box,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LogoutDialog = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          "http://localhost:8080/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      localStorage.clear();
      onClose();
      navigate("/LandingPage"); // 👈 رجوع لصفحة الدخول
    } catch (err) {
      console.error("❌ Logout failed:", err.response?.data || err.message);
      localStorage.clear();
      onClose();
      navigate("/LandingPage");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 3,
          textAlign: "center",
          minWidth: 360,
          background: "linear-gradient(145deg, #ffffff, #e3f2fd)",
          boxShadow: "0px 10px 40px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* أيقونة */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: "#ff1744",
            width: 60,
            height: 60,
            boxShadow: "0px 4px 10px rgba(255,23,68,0.5)",
          }}
        >
          <ExitToAppIcon sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      {/* العنوان */}
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: "#150380",
          fontSize: "1.4rem",
          mb: 1,
        }}
      >
        Confirm Logout
      </DialogTitle>

      {/* النص */}
      <DialogContent>
        <Typography sx={{ fontSize: "0.95rem", color: "#444" }}>
          Are you sure you want to log out?
          <br />
          You will need to sign in again to access your account.
        </Typography>
      </DialogContent>

      {/* الأزرار */}
      <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{
            borderRadius: 3,
            borderColor: "#1E8EAB",
            color: "#1E8EAB",
            px: 3,
            fontWeight: "bold",
            "&:hover": { background: "#e3f2fd" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleLogout}
          variant="contained"
          startIcon={<ExitToAppIcon />}
          sx={{
            borderRadius: 3,
            background: "linear-gradient(90deg,#d32f2f,#ff1744)",
            px: 3,
            fontWeight: "bold",
            boxShadow: "0px 4px 10px rgba(255,23,68,0.4)",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;
