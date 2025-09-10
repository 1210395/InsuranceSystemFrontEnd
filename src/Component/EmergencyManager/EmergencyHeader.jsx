import React, { useEffect, useState } from "react";
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
import axios from "axios";
import LogoutDialog from "../Auth/LogoutDialog";

const EmergencyHeader = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ جلب بيانات البروفايل
    axios
      .get("http://localhost:8080/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFullName(res.data.fullName);
        setRoles(res.data.roles || []);
        if (res.data.universityCardImage) {
          setProfileImage(`http://localhost:8080${res.data.universityCardImage}`);
        }
      })
      .catch((err) => console.error("❌ Profile fetch error:", err));

    // ✅ جلب عدد الإشعارات الغير مقروءة لمدير الطوارئ
    const fetchUnreadCount = () => {
      axios
        .get("http://localhost:8080/api/notifications/unread-count/emergency", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUnreadCount(res.data))
        .catch((err) => console.error("❌ Unread count fetch error:", err));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

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
          borderBottom: "1px solid #e0e0e0",
          color: "#333",
          px: 3,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#150380", cursor: "pointer" }}
            onClick={() => navigate("/EmergencyDashboard")}
          >
            🚨 Emergency Manager
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Notifications */}
            <IconButton onClick={() => navigate("/EmergencyNotifications")}>
              <Badge color="error" badgeContent={unreadCount || null}>
                <NotificationsIcon sx={{ color: "#FFB300" }} />
              </Badge>
            </IconButton>

            {/* User Info */}
            <Box sx={{ textAlign: "right", mr: 1 }}>
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
                sx={{ bgcolor: "#150380", width: 42, height: 42 }}
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
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setOpenLogout(true)}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "red" }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
};

export default EmergencyHeader;
