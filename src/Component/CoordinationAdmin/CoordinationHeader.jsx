// src/Component/CoordinationAdmin/CoordinationHeader.jsx
import React, { useEffect, useState, memo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Logout from "@mui/icons-material/Logout";

import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import LogoutDialog from "../Auth/LogoutDialog";
import logo from "../../images/image.jpg";
import LanguageToggle from "../Shared/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const CoordinationHeader = memo(function CoordinationHeader() {
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);
  const { language, isRTL } = useLanguage();

  // ============================
  // FETCH PROFILE
  // ============================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // api.get() returns response.data directly
        const userData = await api.get(API_ENDPOINTS.AUTH.ME);

        setFullName(userData.fullName || "Coordinator");
        setRoles(userData.roles || []);

        // Handle both single image and array format
        let imgPath = userData.universityCardImage || "";
        if (!imgPath && userData.universityCardImages && userData.universityCardImages.length > 0) {
          imgPath = userData.universityCardImages[userData.universityCardImages.length - 1];
        }

        if (imgPath) {
          const img = imgPath.startsWith("http")
            ? imgPath
            : `${API_BASE_URL}${imgPath}`;
          setProfileImage(img);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // ============================
  // FETCH UNREAD NOTIFICATIONS COUNT
  // ============================
  const fetchUnreadCount = async () => {
    try {
      // api.get() returns response.data directly
      const count = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadCount(typeof count === 'number' ? count : parseInt(count) || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s instead of 3s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #E8EDE0",
          color: "#333",
          px: 3,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* LEFT SIDE */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            onClick={() => navigate("/CoordinationDashboard")}
          >
            <img src={logo} alt="Logo" style={{ height: 40, width: 40, borderRadius: "50%" }} />

            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#556B2F", display: { xs: "none", sm: "block" } }}>
              {t("birzeitInsuranceSystem", language)}
            </Typography>
          </Box>

          {/* RIGHT SIDE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Language Toggle */}
            <LanguageToggle />

            {/* 🔔 NOTIFICATIONS */}
            <Tooltip title={t("notifications", language)}>
              <IconButton onClick={() => navigate("/CoordinationNotifications")}>
                <Badge color="error" badgeContent={unreadCount || null}>
                  <NotificationsIcon sx={{ color: "#FFD700" }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* USER NAME */}
            <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {fullName}
              </Typography>
              <Typography variant="caption" sx={{ color: "gray", fontStyle: "italic" }}>
                {roles.join(", ")}
              </Typography>
            </Box>

            {/* AVATAR MENU */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  bgcolor: "#556B2F",
                  width: 42,
                  height: 42,
                  border: "2px solid #7B8B5E",
                }}
              >
                {!profileImage && fullName?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => navigate("/CoordinationProfile")}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                {t("profile", language)}
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  setOpenLogout(true);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <Logout sx={{ color: "red" }} fontSize="small" />
                </ListItemIcon>
                {t("logout", language)}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
});

export default CoordinationHeader;
