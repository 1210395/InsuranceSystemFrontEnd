import React, { useEffect, useState, useCallback, memo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../../utils/apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api";
import LogoutDialog from "../Auth/LogoutDialog";
import logo from "../../images/image.jpg";
import LanguageToggle from "../Shared/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const EmergencyHeader = memo(function EmergencyHeader() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState([]);
  const { language, isRTL } = useLanguage();

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // api.get() returns response.data directly
      const userData = await api.get(API_ENDPOINTS.AUTH.ME);
      setFullName(userData.fullName || "Emergency Manager");
      setRoles(userData.roles || []);

      // Handle both single image and array format
      let imgPath = userData.universityCardImage || "";
      if (!imgPath && userData.universityCardImages && userData.universityCardImages.length > 0) {
        imgPath = userData.universityCardImages[userData.universityCardImages.length - 1];
      }

      if (imgPath) {
        const full = imgPath.startsWith("http") ? imgPath : `${API_BASE_URL}${imgPath}`;
        setProfileImage(full);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // api.get() returns response.data directly
      const count = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT}/emergency`);
      setUnreadCount(typeof count === 'number' ? count : parseInt(count) || 0);
    } catch (err) {
      console.error("Unread count fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s instead of 5s
    return () => clearInterval(interval);
  }, [fetchProfile, fetchUnreadCount]);

  // 📌 فتح/إغلاق قائمة الحساب
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    navigate("/EmergencyProfile");
    handleMenuClose();
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #E8EDE0",
          color: "#333",
          width: "100%",
        }}
      >
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "space-between", width: "100%", px: { xs: 1, sm: 2 } }}
        >
          {/* ✅ اللوجو + اسم النظام */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/EmergencyDashboard")}
          >
            <img
              src={logo}
              alt="System Logo"
              style={{ height: 36, width: 36, borderRadius: "50%" }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#556B2F", display: { xs: "none", sm: "block" } }}
            >
              {t("birzeitInsuranceSystem", language)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1, md: 2 }, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Notifications */}
            <IconButton onClick={() => navigate("/EmergencyNotifications")}>
              <Badge color="error" badgeContent={unreadCount || null}>
                <NotificationsIcon sx={{ color: "#FFB300" }} />
              </Badge>
            </IconButton>

            {/* User Info */}
            <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {fullName || "Loading..."}
              </Typography>
              {roles.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ fontStyle: "italic", color: "gray" }}
                >
                  {roles.join(", ")}
                </Typography>
              )}
            </Box>

            {/* Avatar + Menu */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={profileImage || undefined}
                sx={{ bgcolor: "#556B2F", width: { xs: 34, sm: 42 }, height: { xs: 34, sm: 42 }, border: "2px solid #7B8B5E" }}
              >
                {!profileImage && fullName?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                {t("profile", language)}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setOpenLogout(true)}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "red" }} />
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

export default EmergencyHeader;
