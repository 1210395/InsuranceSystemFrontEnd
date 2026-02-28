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

const MedicalAdminHeader = memo(function MedicalAdminHeader() {
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
      // api.get() returns data directly, not wrapped in .data
      const userData = await api.get(API_ENDPOINTS.AUTH.ME);
      if (userData) {
        setFullName(userData.fullName || "Medical Admin");
        setRoles(userData.roles || []);

        // Handle both single image and array format
        let imgPath = userData.universityCardImage || "";
        if (!imgPath && userData.universityCardImages && userData.universityCardImages.length > 0) {
          imgPath = userData.universityCardImages[userData.universityCardImages.length - 1];
        }

        if (imgPath) {
          const full = imgPath.startsWith("http")
            ? imgPath
            : `${API_BASE_URL}${imgPath}`;
          setProfileImage(full);
          localStorage.setItem("medicalAdminProfileImage", full);
        }
      }
    } catch (err) {
      console.error("Failed to fetch medical admin profile:", err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // api.get() returns data directly
      const count = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadCount(typeof count === 'number' ? count : parseInt(count) || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s instead of 3s
    return () => clearInterval(interval);
  }, [fetchProfile, fetchUnreadCount]);

  // 🧭 التحكم في القائمة
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    navigate("/MedicalAdminProfile");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    setOpenLogout(true);
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
            onClick={() => navigate("/MedicalAdminDashboard")}
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

          {/* ✅ الجزء الأيمن */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1, md: 2 }, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Language Toggle */}
            <LanguageToggle />

            {/* 🔔 الإشعارات */}
            <IconButton onClick={() => navigate("/MedicalAdminNotifications")}>
              <Badge color="error" badgeContent={unreadCount || null}>
                <NotificationsIcon sx={{ color: "#FFD700" }} />
              </Badge>
            </IconButton>

            {/* 👤 بيانات المستخدم */}
            <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {fullName || "Medical Admin"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "gray", fontStyle: "italic" }}
              >
                {roles.length > 0 ? roles.join(", ") : "MEDICAL_ADMIN"}
              </Typography>
            </Box>

            {/* 🧑‍⚕️ الصورة والقائمة */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  bgcolor: "#556B2F",
                  width: { xs: 34, sm: 42 },
                  height: { xs: 34, sm: 42 },
                  border: "2px solid #7B8B5E",
                }}
              >
                {!profileImage && fullName?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                {t("profile", language)}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "red" }} />
                </ListItemIcon>
                {t("logout", language)}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* نافذة تسجيل الخروج */}
      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
});

export default MedicalAdminHeader;
