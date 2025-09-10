import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EventIcon from "@mui/icons-material/Event";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GavelIcon from "@mui/icons-material/Gavel";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");

  // ✅ جلب جميع البوليصات
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/policies/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPolicies(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch policies:", err.response?.data || err.message);
      }
    };
    fetchPolicies();
  }, [token]);

  // ✅ فتح نافذة الإضافة / التعديل
  const handleOpenDialog = (policy = null) => {
    setEditingPolicy(policy || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setEditingPolicy(null);
    setOpenDialog(false);
  };

  // ✅ حفظ (إنشاء أو تحديث)
  const handleSavePolicy = async () => {
    try {
      if (editingPolicy?.id) {
        // تحديث
        const res = await axios.patch(
          `http://localhost:8080/api/policies/update/${editingPolicy.id}`,
          editingPolicy,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPolicies((prev) => prev.map((p) => (p.id === editingPolicy.id ? res.data : p)));
        setSnackbar({ open: true, message: "Policy updated successfully!", severity: "success" });
      } else {
        // إنشاء
        const res = await axios.post(
          "http://localhost:8080/api/policies/create",
          editingPolicy,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPolicies([...policies, res.data]);
        setSnackbar({ open: true, message: "Policy created successfully!", severity: "success" });
      }
      handleCloseDialog();
    } catch (err) {
      console.error("❌ Save failed:", err.response?.data || err.message);
      setSnackbar({ open: true, message: "Save failed", severity: "error" });
    }
  };

  // ✅ حذف
  const handleDeletePolicy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/policies/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      setSnackbar({ open: true, message: "Policy deleted successfully!", severity: "info" });
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err.message);
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
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
          {/* Title */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#120460" }}>
              📑 Policies Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              sx={{ borderRadius: 2 }}
              onClick={() => handleOpenDialog()}
            >
              Create Policy
            </Button>
          </Box>

          {/* Cards */}
          {policies.map((policy) => (
            <Paper key={policy.id} sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 4 }}>
              {/* Actions */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <IconButton color="primary" onClick={() => handleOpenDialog(policy)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDeletePolicy(policy.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1E8EAB", mb: 1 }}>
                    General Information
                  </Typography>
                  <Typography><b>Policy No:</b> {policy.policyNo}</Typography>
                  <Typography><b>Name:</b> {policy.name}</Typography>
                  <Typography><b>Description:</b> {policy.description}</Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1E8EAB", mb: 1 }}>
                    Dates & Status
                  </Typography>
                  <Typography><EventIcon sx={{ fontSize: 18, mr: 1 }} /> <b>Start:</b> {policy.startDate}</Typography>
                  <Typography><EventIcon sx={{ fontSize: 18, mr: 1 }} /> <b>End:</b> {policy.endDate}</Typography>
                  <Chip label={policy.status} color={policy.status === "ACTIVE" ? "success" : "default"} sx={{ mt: 1 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1E8EAB", mb: 1 }}>
                    Coverage
                  </Typography>
                  <Typography>
                    <MonetizationOnIcon sx={{ fontSize: 18, mr: 1, color: "green" }} />
                    <b>Limit:</b> ${policy.coverageLimit}
                  </Typography>
                  <Typography>
                    <MonetizationOnIcon sx={{ fontSize: 18, mr: 1, color: "red" }} />
                    <b>Deductible:</b> ${policy.deductible}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1E8EAB", mb: 1 }}>
                    Emergency Rules
                  </Typography>
                  <Typography>
                    <GavelIcon sx={{ fontSize: 18, mr: 1, color: "orange" }} />
                    {policy.emergencyRules}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPolicy?.id ? "Edit Policy" : "Create Policy"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[
              { label: "Policy No", key: "policyNo" },
              { label: "Name", key: "name" },
              { label: "Description", key: "description" },
              { label: "Start Date", key: "startDate", type: "date" },
              { label: "End Date", key: "endDate", type: "date" },
              { label: "Coverage Limit", key: "coverageLimit", type: "number" },
              { label: "Deductible", key: "deductible", type: "number" },
              { label: "Emergency Rules", key: "emergencyRules" },
              { label: "Status", key: "status" },
            ].map((field, i) => (
              <Grid item xs={6} key={i}>
                <TextField
                  fullWidth
                  margin="dense"
                  label={field.label}
                  type={field.type || "text"}
                  value={editingPolicy?.[field.key] || ""}
                  onChange={(e) =>
                    setEditingPolicy({
                      ...editingPolicy,
                      [field.key]: e.target.value,
                    })
                  }
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePolicy} variant="contained">Save</Button>
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

export default PolicyList;
