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
} from "@mui/material";
import EmergencyHeader from "./EmergencyHeader";
import EmergencySidebar from "./EmergencySidebar";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatIcon from "@mui/icons-material/Chat";
import WarningIcon from "@mui/icons-material/Warning";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";

const EmergencyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ جلب إشعارات مدير الطوارئ
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("⚠️ No token found!");

        const res = await axios.get("http://localhost:8080/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(res.data); // ✅ السيرفر يرجع إشعارات المستخدم الحالي فقط
      } catch (err) {
        console.error("❌ Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  // ✅ تعليم إشعار كمقروء
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8080/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  };

  // ✅ فتح الرد
  const handleReply = (notification) => {
    setSelectedNotification(notification);
    setReplyMessage("");
    setOpenReplyDialog(true);
  };

  // ✅ إرسال الرد
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
    }
  };

  // ✅ اختيار الألوان والأيقونات حسب النوع
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
      <EmergencySidebar />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          marginLeft: "240px",
        }}
      >
        <EmergencyHeader />
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
            View and respond to user messages and system notifications.
          </Typography>
          <Divider sx={{ my: 3 }} />

          {notifications.map((n) => {
            const { icon, color } = getIconAndColor(n.type);
            return (
              <Paper
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: 4,
                  cursor: "pointer",
                  backgroundColor: n.read ? "#fff" : color,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 8 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    <strong>{n.senderName || "System"}</strong> ({n.type}):{" "}
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

                <Chip
                  label={n.read ? "Read" : "Unread"}
                  color={n.read ? "default" : "primary"}
                  size="small"
                  sx={{ mt: 1 }}
                />

                {n.type === "MANUAL_MESSAGE" && (
                  <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      onClick={() => handleReply(n)}
                    >
                      Reply
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* Dialog للرد */}
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
          <Button onClick={handleConfirmReply} variant="contained" color="primary">
            Send Reply
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

export default EmergencyNotifications;
