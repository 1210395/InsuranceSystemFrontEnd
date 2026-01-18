// src/Component/Notification/NotificationsList.jsx
import React, { useEffect, useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import { api, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";

const NotificationsList = memo(function NotificationsList({ refresh }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ فورم إرسال إشعار
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    recipientName: "",
    message: "",
  });
  const [recipients, setRecipients] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.ALL);
      const notifications = Array.isArray(data) ? data : [];
      setNotifications(notifications);
      setUnreadCount(
        notifications.filter((n) => !n.read && (n.type === "MANUAL_MESSAGE" || n.type === "SYSTEM")).length
      );
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setSnackbar({
        open: true,
        message: "Failed to load notifications",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecipients = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const data = await api.get(API_ENDPOINTS.NOTIFICATIONS.RECIPIENTS);
      setRecipients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch recipients:", err);
      setRecipients([]);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchRecipients();
  }, [fetchNotifications, fetchRecipients]);

  const markAsRead = useCallback(async (id) => {
    try {
      const token = getToken();
      if (!token) return;
      setLoadingId(id);
      await api.patch(`${API_ENDPOINTS.NOTIFICATIONS.ALL}/${id}/read`, {});
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      refresh?.();
    } catch {
      setSnackbar({ open: true, message: "Failed to update notification.", severity: "error" });
    } finally {
      setLoadingId(null);
    }
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setSnackbar({ open: true, message: "All notifications marked as read", severity: "success" });
      refresh?.();
    } catch {
      setSnackbar({ open: true, message: "Failed to mark all as read", severity: "error" });
    }
  }, [refresh]);

  // Open reply dialog
  const handleReply = useCallback((notification) => {
    setSelectedNotification(notification);
    setReplyMessage("");
    setOpenReplyDialog(true);
  }, []);

  const handleConfirmReply = async () => {
    if (!replyMessage.trim()) {
      setSnackbar({ open: true, message: "Reply cannot be empty!", severity: "error" });
      return;
    }
    try {
      setLoadingId(selectedNotification.id);
      await api.post(
        `${API_ENDPOINTS.NOTIFICATIONS.ALL}/${selectedNotification.id}/reply`,
        {
          recipientId: selectedNotification.senderId,
          message: replyMessage,
        }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === selectedNotification.id ? { ...n, read: true, replied: true } : n
        )
      );
      setSnackbar({ open: true, message: "Reply sent successfully!", severity: "success" });
      setOpenReplyDialog(false);
      refresh?.();
    } catch {
      setSnackbar({ open: true, message: "Failed to send reply!", severity: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendNotification = useCallback(async () => {
    if (!newNotification.recipientName || !newNotification.message) {
      setSnackbar({ open: true, message: "All fields are required!", severity: "error" });
      return;
    }
    try {
      await api.post(
        API_ENDPOINTS.NOTIFICATIONS.BY_FULLNAME,
        { ...newNotification, type: "MANUAL_MESSAGE" }
      );
      setSnackbar({ open: true, message: "Notification sent successfully!", severity: "success" });
      setNewNotification({ recipientName: "", message: "" });
      setOpenSendDialog(false);
      fetchNotifications();
      refresh?.();
    } catch {
      setSnackbar({ open: true, message: "Failed to send notification", severity: "error" });
    }
  }, [newNotification, fetchNotifications, refresh]);

  // ✅ الأيقونات والألوان
  const getIconAndColor = (type) => {
    switch (type) {
      case "MANUAL_MESSAGE":
        return { icon: <ChatIcon sx={{ color: "#556B2F" }} />, bar: "#556B2F" };
      case "CLAIM":
        return { icon: <DescriptionIcon sx={{ color: "#7B8B5E" }} />, bar: "#7B8B5E" };
      case "EMERGENCY":
        return { icon: <WarningIcon sx={{ color: "#3D4F23" }} />, bar: "#3D4F23" };
      default:
        return { icon: <PersonAddIcon sx={{ color: "#556B2F" }} />, bar: "#556B2F" };
    }
  };

  const getBackgroundColor = (n) => {
    if (n.read) return "linear-gradient(145deg, #ffffff 0%, #FAF8F5 100%)";
    switch (n.type) {
      case "MANUAL_MESSAGE":
        return "linear-gradient(145deg, #F5F5DC 0%, #E8EDE0 100%)";
      case "EMERGENCY":
        return "linear-gradient(145deg, #E8EDE0 0%, #F5F5DC 100%)";
      default:
        return "linear-gradient(145deg, #E8EDE0 0%, #F5F5DC 100%)";
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: "#3D4F23", display: "flex", alignItems: "center" }}>
        <NotificationsIcon sx={{ mr: 1, fontSize: 35, color: "#556B2F" }} />
        Notifications
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        View, send, and respond to notifications.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Unread Notifications: {unreadCount}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {unreadCount > 0 && (
            <Button variant="contained" color="success" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={() => setOpenSendDialog(true)}>
            ➕ Send Notification
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Typography>No notifications found.</Typography>
      ) : (
        notifications.map((n) => {
          const { icon, bar } = getIconAndColor(n.type);
          return (
            <Box sx={{ display: "flex", justifyContent: "center" }} key={n.id}>
              <Paper
                sx={{
                  position: "relative",
                  width: "80%",
                  maxWidth: 800,
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: n.read ? 2 : 4,
                  background: getBackgroundColor(n),
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": { transform: "scale(1.01)", boxShadow: 6 },
                  opacity: loadingId === n.id ? 0.5 : 1,
                }}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 6,
                  height: "100%",
                  borderRadius: "3px 0 0 3px",
                  backgroundColor: bar,
                }} />

                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, ml: 2 }}>
                  {icon}
                  <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: "bold", color: "#3D4F23" }}>
                    {n.senderName || "System"}
                  </Typography>
                </Box>

                <Chip label={n.type || "SYSTEM"} color="secondary" size="small" sx={{ mb: 1, ml: 2 }} />

                <Typography variant="body2" sx={{ mb: 1, ml: 2, color: "#333", lineHeight: 1.5 }}>
                  {n.message}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ ml: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Chip label={n.read ? "Read" : "Unread"} color={n.read ? "default" : "primary"} size="small" />
                    {n.replied && <Chip label="✔ Replied" color="success" size="small" variant="outlined" />}
                  </Box>
                </Box>

                {n.type === "MANUAL_MESSAGE" && !n.replied && (
                  <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end", pr: 1 }}>
                    <Button variant="contained" size="small" color="success" onClick={() => handleReply(n)} disabled={loadingId === n.id}>
                      {loadingId === n.id ? <CircularProgress size={14} color="inherit" /> : "Reply"}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })
      )}

      {/* ✅ Reply Dialog */}
      <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)}>
        <DialogTitle>Reply to Notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Message: {selectedNotification?.message}</Typography>
          <TextField fullWidth label="Your Reply" multiline rows={3} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmReply} variant="contained" color="primary" disabled={loadingId === selectedNotification?.id}>
            {loadingId === selectedNotification?.id ? <CircularProgress size={16} color="inherit" /> : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Send Notification Dialog */}
      <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)}>
        <DialogTitle>Send New Notification</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="recipient-label">Recipient</InputLabel>
            <Select
              label="Recipient"
              labelId="recipient-label"
              value={newNotification.recipientName}
              onChange={(e) => setNewNotification({ ...newNotification, recipientName: e.target.value })}
            >
              <MenuItem value="">-- Select Recipient --</MenuItem>
              {recipients.map((r) => (
                <MenuItem key={r.id} value={r.fullName}>
                  {r.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Message" multiline rows={3} value={newNotification.message} onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSendDialog(false)}>Cancel</Button>
          <Button onClick={handleSendNotification} variant="contained" sx={{ backgroundColor: "#556B2F" }}>Send</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

NotificationsList.propTypes = {
  refresh: PropTypes.func,
};

export default NotificationsList;
