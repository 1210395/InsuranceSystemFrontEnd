import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import EmergencyIcon from "@mui/icons-material/LocalHospital";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LogoutDialog from "../Auth/LogoutDialog";

const EmergencySidebar = () => {
  const [open, setOpen] = useState(true);
  const [openLogout, setOpenLogout] = useState(false);

  return (
    <Box
      sx={{
        width: open ? 240 : 70,
        height: "100vh",
        background: "linear-gradient(to bottom, #FF512F, #DD2476)",
        color: "#fff",
        p: 2,
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        transition: "width 0.3s ease",
      }}
    >
      {/* Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: open ? "space-between" : "center",
          alignItems: "center",
          mb: 3,
        }}
      >
        {open && (
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Emergency Panel
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: "#fff" }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List>
        {/* Emergency Requests */}
        <Tooltip
          title="Pending Emergency Requests"
          placement="right"
          disableHoverListener={open}
        >
          <ListItemButton component={Link} to="/PendingEmergencyRequests">
            <ListItemIcon>
              <EmergencyIcon sx={{ color: "#FFD700" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Emergency Requests" />}
          </ListItemButton>
        </Tooltip>

        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Profile */}
        <Tooltip title="Profile" placement="right" disableHoverListener={open}>
          <ListItemButton component={Link} to="/EmergencyProfile">
            <ListItemIcon>
              <AccountCircleIcon sx={{ color: "#fff" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Profile" />}
          </ListItemButton>
        </Tooltip>

        {/* Logout */}
        <Tooltip title="Logout" placement="right" disableHoverListener={open}>
          <ListItemButton onClick={() => setOpenLogout(true)}>
            <ListItemIcon>
              <ExitToAppIcon sx={{ color: "#fff" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Logout" />}
          </ListItemButton>
        </Tooltip>
      </List>

      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </Box>
  );
};

export default EmergencySidebar;
