import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PolicyIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EmergencyIcon from "@mui/icons-material/LocalHospital";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LogoutDialog from "../Auth/LogoutDialog";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openLogout, setOpenLogout] = useState(false);

  return (
    <Box
      sx={{
        width: open ? 240 : 70,
        height: "100vh",
        background: "linear-gradient(to bottom, #6a11cb, #2575fc)",
        color: "#fff",
        p: 2,
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: "auto",
        transition: "width 0.3s ease",
      }}
    >
      {/* Toggle Button */}
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
            Manager Panel
          </Typography>
        )}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: "#fff" }}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List>
        {/* Clients Section */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Clients
          </Typography>
        )}
        <Tooltip title="Clients" placement="right" disableHoverListener={open}>
          <ListItemButton component={Link} to="/ClientList">
            <ListItemIcon>
              <PeopleIcon sx={{ color: "#FFD700" }} />
            </ListItemIcon>
            {open && <ListItemText primary="List All Clients" />}
          </ListItemButton>
        </Tooltip>

        <Tooltip
          title="Pending Requests"
          placement="right"
          disableHoverListener={open}
        >
          <ListItemButton component={Link} to="/PendingRequests">
            <ListItemIcon>
              <PendingActionsIcon sx={{ color: "#FF8C00" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Pending Requests" />}
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Policies Section */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Policies
          </Typography>
        )}
        <Tooltip title="PolicyList" placement="right" disableHoverListener={open}>
          <ListItemButton component={Link} to="/PolicyList">
            <ListItemIcon>
              <PolicyIcon sx={{ color: "#00BFFF" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Manage PolicyList" />}
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Claims Section */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Claims
          </Typography>
        )}
        <Tooltip title="Claims List" placement="right" disableHoverListener={open}>
          <ListItemButton component={Link} to="/ClaimsList">
            <ListItemIcon>
              <AssignmentIcon sx={{ color: "#4CAF50" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Claims List" />}
          </ListItemButton>
        </Tooltip>
        <Tooltip
          title="Pending Requests"
          placement="right"
          disableHoverListener={open}
        >
          <ListItemButton component={Link} to="/ClaimsManage">
            <ListItemIcon>
              <PendingActionsIcon sx={{ color: "#FF8C00" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Pending Requests" />}
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Notifications */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Notifications
          </Typography>
        )}
        <Tooltip
          title="View Notifications"
          placement="right"
          disableHoverListener={open}
        >
          <ListItemButton component={Link} to="/ManageNotifications">
            <ListItemIcon>
              <NotificationsIcon sx={{ color: "#FF1744" }} />
            </ListItemIcon>
            {open && <ListItemText primary="View Notifications" />}
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Reports */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Reports
          </Typography>
        )}
        {[
          { text: "Claims Report", color: "#8E24AA", path: "/ClaimsReport" },
          { text: "Financial Report", color: "#00ACC1", path: "/FinancialReport" },
          { text: "Members Activity Report", color: "#7B1FA2", path: "/MembersActivityReport" },
          { text: "Providers Report", color: "#43A047", path: "/ProvidersReport" },
          { text: "Policies Report", color: "#FF9800", path: "/PoliciesReport" },
          { text: "Usage Report", color: "#2196F3", path: "/UsageReport" },
        ].map((report, i) => (
          <Tooltip
            key={i}
            title={report.text}
            placement="right"
            disableHoverListener={open}
          >
            <ListItemButton component={Link} to={report.path}>
              <ListItemIcon>
                <AssessmentIcon sx={{ color: report.color }} />
              </ListItemIcon>
              {open && <ListItemText primary={report.text} />}
            </ListItemButton>
          </Tooltip>
        ))}
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Emergency */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Emergency
          </Typography>
        )}
        <Tooltip
          title="Pending Emergency Requests"
          placement="right"
          disableHoverListener={open}
        >
          <ListItemButton component={Link} to="/PendingEmergencyRequests">
            <ListItemIcon>
              <EmergencyIcon sx={{ color: "#FF5722" }} />
            </ListItemIcon>
            {open && <ListItemText primary="Pending Emergency Requests" />}
          </ListItemButton>
        </Tooltip>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Account */}
        {open && (
          <Typography variant="body2" sx={{ ml: 1, mb: 1, opacity: 0.7 }}>
            Account
          </Typography>
        )}
        <Tooltip title="Profile" placement="right" disableHoverListener={open}>
          <ListItemButton component={Link} to="/Profile">
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

      {/* ✅ نافذة الخروج المستقلة */}
      <LogoutDialog open={openLogout} onClose={() => setOpenLogout(false)} />
    </Box>
  );
};

export default Sidebar;
