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
import LogoutDialog from "../Auth/LogoutDialog"; // 

const Header = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogout, setOpenLogout] = useState(false);

  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8080/api/Clients/get/abdb4e87-da11-40cc-9e68-7ac59c8cbfcf",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFullName(res.data.fullName);
        setRoles(res.data.roles || []);

        if (res.data.universityCardImage) {
          const imgPath = res.data.universityCardImage;
          setProfileImage(`http://localhost:8080${imgPath}`);
          localStorage.setItem("profileImage", imgPath);
        }
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          "http://localhost:8080/api/notifications/unread-count",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnreadCount(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch unread count:", err);
      }
    };

    fetchProfile();
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Menu
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    navigate("/Profile");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    setOpenLogout(true); // ✅ يفتح نافذة التأكيد
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
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#150380", cursor: "pointer" }}
            onClick={() => navigate("/ManagerDashboard")}
          >
            <span style={{ color: "green" }}>❤</span> Birzeit Insurance System
          </Typography>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Notifications */}
            <IconButton onClick={() => navigate("/ManageNotifications")}>
              <Badge color="error" badgeContent={unreadCount || null}>
                <NotificationsIcon sx={{ color: "#FFD700" }} />
              </Badge>
            </IconButton>

            {/* User Info */}
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {fullName || "Loading..."}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "gray", fontStyle: "italic" }}
              >
                {roles.length > 0 ? roles.join(", ") : "Loading..."}
              </Typography>
            </Box>

            {/* Avatar + Menu */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={profileImage || undefined}
                sx={{
                  bgcolor: "#150380",
                  width: 42,
                  height: 42,
                  border: "2px solid #1E8EAB",
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
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "red" }} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ✅ نافذة الخروج */}
      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </>
  );
};

export default Header;
