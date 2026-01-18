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
  Tooltip,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../../utils/apiService";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api";
import LogoutDialog from "../Auth/LogoutDialog";
import logo from "../../images/image.jpg";
import LanguageToggle from "../Shared/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const Header = memo(function Header() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState([]);
  const { language, isRTL } = useLanguage();

  const fetchProfile = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await api.get(API_ENDPOINTS.AUTH.ME);

      // api.get already returns response.data, so access properties directly
      setFullName(res.fullName);
      setRoles(res.roles || []);

      if (res.id) localStorage.setItem("userId", res.id);

      if (res.universityCardImage) {
        const imgPath = res.universityCardImage;
        setProfileImage(`${API_BASE_URL}${imgPath}`);
        localStorage.setItem("profileImage", imgPath);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadCount(res);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30s instead of 4s
    return () => clearInterval(interval);
  }, [fetchProfile, fetchUnreadCount]);

  // Menu functions
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleProfile = () => {
    navigate("/Profile");
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
          px: 3,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* ✅ اللوجو + اسم النظام */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate("/ManagerDashboard")}
          >
            <img
              src={logo}
              alt="System Logo"
              style={{ height: 40, width: 40, borderRadius: "50%" }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#556B2F" }}
            >
              Birzeit Insurance System
            </Typography>
          </Box>

          {/* ✅ الجزء الأيمن من الهيدر */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Language Toggle */}
            <LanguageToggle />

            {/* 🔔 الإشعارات */}
            <Tooltip title={t("notifications", language)}>
              <IconButton onClick={() => navigate("/ManageNotifications")}>
                <Badge color="error" badgeContent={unreadCount || null}>
                  <NotificationsIcon sx={{ color: "#FFD700" }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* 💬 زر الشات */}
            <Tooltip title={t("chatCenter", language)}>
              <IconButton
                onClick={() => navigate("/Chat")} // ✅ فتح صفحة كاملة
                sx={{
                  backgroundColor: "#556B2F",
                  color: "white",
                  "&:hover": { backgroundColor: "#7B8B5E" },
                }}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>

            {/* 👤 معلومات المستخدم */}
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {fullName || t("loading", language)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "gray", fontStyle: "italic" }}
              >
                {roles.length > 0 ? roles.join(", ") : t("loading", language)}
              </Typography>
            </Box>

            {/* 🧑‍💼 الصورة والمنيو */}
            <IconButton onClick={handleMenuOpen}>
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

      {/* نافذة تاكيد تسجيل الخروج */}
      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
});

export default Header;
