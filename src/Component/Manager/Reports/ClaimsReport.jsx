import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";

const ClaimsReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🟢 جلب البيانات من الباك اند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/reports/claims", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("❌ Failed to load claims report:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#f4f6f9",
            minHeight: "100vh",
            marginLeft: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            backgroundColor: "#f4f6f9",
            minHeight: "100vh",
            marginLeft: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error">⚠️ Failed to load claims report.</Typography>
        </Box>
      </Box>
    );
  }

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
          {/* العنوان */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#120460", display: "flex", alignItems: "center" }}
          >
            <AssignmentIcon sx={{ mr: 1, fontSize: 35, color: "#1E8EAB" }} />
            Claims Report
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Overview of all submitted claims with their statuses and amounts.
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Total Claims</Typography>
                <Chip label={report.totalClaims} color="primary" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Approved</Typography>
                <Chip label={report.approvedClaims} color="success" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Rejected</Typography>
                <Chip label={report.rejectedClaims} color="error" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Pending</Typography>
                <Chip label={report.pendingClaims} color="warning" />
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Approved Amount</Typography>
                <Typography color="green">${report.totalApprovedAmount}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={2}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Rejected Amount</Typography>
                <Typography color="red">${report.totalRejectedAmount}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Approved Claims */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "green" }}>
            ✅ Approved Claims
          </Typography>
          {report.approvedList.length > 0 ? (
            report.approvedList.map((claim) => (
              <Paper key={claim.id} sx={{ p: 2, mb: 2 }}>
                <Typography><b>Member:</b> {claim.memberName}</Typography>
                <Typography><b>Policy:</b> {claim.policyName}</Typography>
                <Typography><b>Description:</b> {claim.description}</Typography>
                <Typography><b>Amount:</b> ${claim.amount}</Typography>
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No approved claims.</Typography>
          )}

          {/* Rejected Claims */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "red" }}>
            ❌ Rejected Claims
          </Typography>
          {report.rejectedList.length > 0 ? (
            report.rejectedList.map((claim) => (
              <Paper key={claim.id} sx={{ p: 2, mb: 2 }}>
                <Typography><b>Member:</b> {claim.memberName}</Typography>
                <Typography><b>Policy:</b> {claim.policyName}</Typography>
                <Typography><b>Description:</b> {claim.description}</Typography>
                <Typography><b>Reason:</b> {claim.rejectionReason}</Typography>
                <Typography><b>Amount:</b> ${claim.amount}</Typography>
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No rejected claims.</Typography>
          )}

          {/* Pending Claims */}
          <Typography variant="h5" sx={{ mt: 2, mb: 1, color: "orange" }}>
            ⏳ Pending Claims
          </Typography>
          {report.pendingList.length > 0 ? (
            report.pendingList.map((claim) => (
              <Paper key={claim.id} sx={{ p: 2, mb: 2 }}>
                <Typography><b>Member:</b> {claim.memberName}</Typography>
                <Typography><b>Policy:</b> {claim.policyName}</Typography>
                <Typography><b>Description:</b> {claim.description}</Typography>
                <Typography><b>Amount:</b> ${claim.amount}</Typography>
              </Paper>
            ))
          ) : (
            <Typography color="text.secondary">No pending claims.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimsReport;
