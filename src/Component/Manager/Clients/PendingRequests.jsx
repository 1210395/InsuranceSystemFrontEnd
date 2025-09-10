import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import axios from "axios";

const PendingRequests = () => {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState(null); // ✅ لمعرفة أي زر شغال
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🆕 State للمعاينة
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // ✅ جلب البيانات من الباك اند
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found, please login first.");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8080/api/Clients/role-requests/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClients(res.data);
      } catch (err) {
        console.error("❌ Fetch failed:", err.response?.data || err.message);
      }
    };

    fetchPending();
  }, []);

  // ✅ الموافقة
  const handleApprove = async (client) => {
    setLoadingId(client.id);
    try {
      await axios.patch(
        `http://localhost:8080/api/Clients/${client.id}/role-requests/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setClients(clients.filter((c) => c.id !== client.id));
      setSnackbar({
        open: true,
        message: `Request for ${client.fullName} approved.`,
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Approval failed:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: "Approval failed.",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ فتح الدايالوج للرفض
  const handleRejectClick = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  // ✅ تأكيد الرفض
  const handleRejectConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({
        open: true,
        message: "⚠️ Please login as Manager first.",
        severity: "error",
      });
      return;
    }

    setLoadingId(selectedClient.id);
    try {
      await axios.patch(
        `http://localhost:8080/api/Clients/${selectedClient.id}/reject`,
        { reason: rejectReason }, // ✅ نبعث السبب كـ Object
        {
          headers: {
            Authorization: `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      setClients(clients.filter((c) => c.id !== selectedClient.id));
      setSnackbar({
        open: true,
        message: `Request for ${selectedClient.fullName} rejected.`,
        severity: "error",
      });
    } catch (err) {
      console.error(
        "❌ Reject failed:",
        err.response?.status,
        err.response?.data || err.message
      );
      setSnackbar({
        open: true,
        message:
          err.response?.status === 401
            ? "Unauthorized – login again"
            : "Reject failed due to server error",
        severity: "error",
      });
    } finally {
      setLoadingId(null);
      setOpenDialog(false);
      setRejectReason("");
    }
  };

  // ✅ تلوين حالة الطلب
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
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
            sx={{ color: "#120460", display: "flex", alignItems: "center" }}
          >
            <GroupAddIcon sx={{ mr: 1, fontSize: 35, color: "#1E8EAB" }} />
            Pending Client Requests
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Review and manage pending client registration requests.
          </Typography>

          {clients.map((client) => (
            <Paper
              key={client.id}
              sx={{ p: 3, borderRadius: 3, boxShadow: 4, mb: 4 }}
            >
              <Grid container spacing={3}>
                {/* General Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      General Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <PersonIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        <b>Name:</b> {client.fullName}
                      </Typography>
                      <Typography variant="body2">
                        <b>Username:</b> {client.username}
                      </Typography>
                      <Typography variant="body2">
                        <EmailIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        <b>Email:</b> {client.email}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Contact Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      Contact Info
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <PhoneIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        <b>Phone:</b> {client.phone}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">
                          <b>Status:</b>
                        </Typography>
                        <Chip
                          label={client.status}
                          color={client.status === "ACTIVE" ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* Current Roles */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      Current Roles
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {client.roles.map((role, i) => (
                        <Chip key={i} label={role} color="primary" />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Requested Role */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      Requested Role
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={client.requestedRole} color="secondary" />
                    </Box>
                  </Paper>
                </Grid>

                {/* University Card */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      University Card
                    </Typography>
                    {client.universityCardImage ? (
                      <Avatar
                        src={`http://localhost:8080${client.universityCardImage}`}
                        alt="Card"
                        variant="rounded"
                        sx={{ width: 80, height: 100, cursor: "pointer" }}
                        onClick={() => {
                          setPreviewImage(
                            `http://localhost:8080${client.universityCardImage}`
                          );
                          setOpenImageDialog(true);
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No card uploaded
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Request Status */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#1E8EAB" }}
                    >
                      Request Status
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={client.roleRequestStatus}
                        color={getStatusColor(client.roleRequestStatus)}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={loadingId === client.id}
                  onClick={() => handleApprove(client)}
                  startIcon={
                    loadingId === client.id ? <CircularProgress size={18} /> : null
                  }
                >
                  {loadingId === client.id ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={loadingId === client.id}
                  onClick={() => handleRejectClick(client)}
                  startIcon={
                    loadingId === client.id ? <CircularProgress size={18} /> : null
                  }
                >
                  {loadingId === client.id ? "Rejecting..." : "Reject"}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a reason for rejecting{" "}
            <strong>{selectedClient?.fullName}</strong>:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRejectConfirm}>
            Confirm Reject
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

      {/* 🆕 Image Preview Dialog */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>University Card</DialogTitle>
        <DialogContent dividers>
          {previewImage && (
            <img
              src={previewImage}
              alt="University Card"
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingRequests;
