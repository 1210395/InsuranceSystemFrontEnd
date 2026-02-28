// src/Component/Client/ClientHeader.jsx
import React, { useState } from "react";
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

import logo from "../../images/image.jpg";
import LanguageToggle from "../Shared/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const ClientHeader = ({
  userInfo,
  profileImage,
  unreadCount,
  onNotificationsClick,
  onProfileClick,
  onLogoClick,
  onLogoutClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { language, isRTL } = useLanguage();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    onProfileClick?.();
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    onLogoutClick?.();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#fff",
        borderBottom: "1px solid #E8EDE0",
        color: "#333",
        mb: 3,
        width: "100%",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Logo + System Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
          onClick={onLogoClick}
        >
          <img
            src={logo}
            alt="System Logo"
            style={{ height: 36, width: 36, borderRadius: "50%" }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#150380", display: { xs: "none", sm: "block" } }}
          >
            {t("birzeitInsuranceSystem", language)}
          </Typography>
        </Box>

        {/* Right Side: Notifications + User Info + Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1, md: 2 }, flexDirection: isRTL ? "row-reverse" : "row" }}>
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Notifications Icon */}
          <IconButton onClick={onNotificationsClick}>
            <Badge
              color="error"
              badgeContent={unreadCount > 0 ? unreadCount : null}
              max={99}
            >
              <NotificationsIcon sx={{ color: "#FFD700" }} />
            </Badge>
          </IconButton>

          {/* User Info */}
          <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {userInfo?.fullName || "Client"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "gray", fontStyle: "italic" }}
            >
              {userInfo?.roles?.[0] || "CLIENT"}
            </Typography>
          </Box>

          {/* User Avatar + Menu */}
          <IconButton onClick={handleMenuOpen}>
            <Avatar
              src={profileImage || undefined}
              sx={{
                bgcolor: "#150380",
                width: { xs: 34, sm: 42 },
                height: { xs: 34, sm: 42 },
                border: "2px solid #1E8EAB",
              }}
            >
              {!profileImage && userInfo?.fullName?.charAt(0)}
            </Avatar>
          </IconButton>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
            }}
          >
            <MenuItem onClick={handleProfileClick}>
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
  );
};

export default ClientHeader;
