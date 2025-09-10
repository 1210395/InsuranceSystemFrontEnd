import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";

const ManageNotifications = () => {
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

  // ✅ جلب الإشعارات
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:8080/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch notifications:", err);
        setSnackbar({
          open: true,
          message: "Failed to load notifications",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ✅ جلب العداد
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          "http://localhost:8080/api/notifications/unread-count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnreadCount(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  // ✅ تعليم إشعار كمقروء
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingId(id);
     await axios.patch(
  `http://localhost:8080/api/notifications/${id}/read`,
  {},
  {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  }
);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("❌ Failed to mark notification as read:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.status === 401
            ? "Unauthorized, please login again."
            : "Failed to update notification.",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ فتح نافذة الرد
  const handleReply = (notification) => {
    setSelectedNotification(notification);
    setReplyMessage("");
    setOpenReplyDialog(true);
  };

  // ✅ تأكيد الرد
  const handleConfirmReply = async () => {
    if (!replyMessage.trim()) {
      setSnackbar({
        open: true,
        message: "Reply cannot be empty!",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingId(selectedNotification.id);
      await axios.post(
        `http://localhost:8080/api/notifications/${selectedNotification.id}/reply`,
        {
          recipientId: selectedNotification.senderId,
          message: replyMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === selectedNotification.id
            ? { ...n, read: true, replied: true }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));

      setSnackbar({
        open: true,
        message: "Reply sent successfully!",
        severity: "success",
      });
      setOpenReplyDialog(false);
    } catch (err) {
      console.error("❌ Failed to send reply:", err);
      setSnackbar({
        open: true,
        message: "Failed to send reply!",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // 👌 Helper لاختيار الأيقونة حسب النوع
  const getIconAndColor = (type) => {
    switch (type) {
      case "MANUAL_MESSAGE":
        return { icon: <ChatIcon sx={{ color: "#6A1B9A" }} />, color: "#F3E5F5" };
      case "CLAIM":
        return { icon: <DescriptionIcon sx={{ color: "#388E3C" }} />, color: "#E8F5E9" };
      case "EMERGENCY":
        return { icon: <WarningIcon sx={{ color: "#D32F2F" }} />, color: "#FFEBEE" };
      default:
        return { icon: <PersonAddIcon sx={{ color: "#1976D2" }} />, color: "#E3F2FD" };
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          marginLeft: "240px",
        }}
      >
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#120460", display: "flex", alignItems: "center" }}
          >
            <NotificationsIcon sx={{ mr: 1, fontSize: 35, color: "#FF1744" }} />
            Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            View and respond to system and user notifications.
          </Typography>

          <Typography variant="h6" color="text.secondary" gutterBottom>
            Unread Notifications: {unreadCount}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography>No notifications found.</Typography>
          ) : (
            notifications.map((n) => {
              const { icon, color } = getIconAndColor(n.type);
              return (
                <Paper
                  key={n.id}
                  onClick={() =>
                    !n.read &&
                    (n.type === "MANUAL_MESSAGE" || !n.type || n.type === "SYSTEM") &&
                    markAsRead(n.id)
                  }
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 4,
                    cursor: "pointer",
                    backgroundColor: n.read ? "#fff" : color,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 8 },
                    opacity: loadingId === n.id ? 0.5 : 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {icon}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      <strong>{n.senderName || "System"}</strong> ({n.type || "SYSTEM"}):{" "}
                      {n.message}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>

                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Chip
                      label={n.read ? "Read" : "Unread"}
                      color={n.read ? "default" : "primary"}
                      size="small"
                    />
                    {n.replied && (
                      <Chip
                        label="✔ Replied"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {n.type === "MANUAL_MESSAGE" && n.senderId && !n.replied && (
                    <Box
                      sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => handleReply(n)}
                        disabled={loadingId === n.id}
                        startIcon={
                          loadingId === n.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : null
                        }
                      >
                        {loadingId === n.id ? "Sending..." : "Reply"}
                      </Button>
                    </Box>
                  )}
                </Paper>
              );
            })
          )}
        </Box>
      </Box>

      {/* Reply Dialog */}
      <Dialog open={openReplyDialog} onClose={() => setOpenReplyDialog(false)}>
        <DialogTitle>Reply to Notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Message: {selectedNotification?.message}
          </Typography>
          <TextField
            fullWidth
            label="Your Reply"
            multiline
            rows={3}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReplyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReply}
            variant="contained"
            color="primary"
            disabled={loadingId === selectedNotification?.id}
            startIcon={
              loadingId === selectedNotification?.id ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {loadingId === selectedNotification?.id ? "Sending..." : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageNotifications;
