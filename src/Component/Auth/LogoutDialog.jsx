import React, { memo } from "react";
import PropTypes from "prop-types";
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
import { api, getToken, clearAuthData } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const LogoutDialog = memo(function LogoutDialog({ open, onClose }) {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = getToken();

      if (token) {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
      }

      clearAuthData();
      onClose();
      navigate("/LandingPage");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      clearAuthData();
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
          background: "linear-gradient(145deg, #FFFFFF, #E8EDE0)",
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

      {/* Title */}
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: "#3D4F23",
          fontSize: "1.4rem",
          mb: 1,
        }}
      >
        {t("logoutConfirmTitle", language)}
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Typography sx={{ fontSize: "0.95rem", color: "#444" }}>
          {t("logoutConfirmMessage", language)}
        </Typography>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{
            borderRadius: 3,
            borderColor: "#7B8B5E",
            color: "#7B8B5E",
            px: 3,
            fontWeight: "bold",
            "&:hover": { background: "#E8EDE0" },
          }}
        >
          {t("cancel", language)}
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
          {t("logout", language)}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

LogoutDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LogoutDialog;
