import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import PolicyIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import axios from "axios";

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ استدعاء API عند تحميل الصفحة
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8080/api/claims/allClaimsByManager",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClaims(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch claims:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

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
            <AssignmentIcon sx={{ mr: 1, fontSize: 35, color: "#1E8EAB" }} />
            Claims List
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Review all submitted insurance claims.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {loading ? (
            <CircularProgress sx={{ color: "#120460" }} />
          ) : claims.length === 0 ? (
            <Typography>No claims found.</Typography>
          ) : (
            claims.map((claim) => (
              <Paper
                key={claim.id}
                sx={{ p: 4, borderRadius: 3, boxShadow: 4, mb: 4 }}
              >
                <Grid container spacing={3}>
                  {/* General Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        General Information
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon sx={{ mr: 1, color: "#2E7D32" }} />
                          <Typography variant="body2">
                            <b>Member:</b> {claim.memberName}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PolicyIcon sx={{ mr: 1, color: "#1565C0" }} />
                          <Typography variant="body2">
                            <b>Policy:</b> {claim.policyName}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          <b>Description:</b> {claim.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Medical Details */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        Medical Details
                      </Typography>
                      <Stack spacing={1.5}>
                        <Typography variant="body2">
                          <b>Diagnosis:</b> {claim.diagnosis}
                        </Typography>
                        <Typography variant="body2">
                          <b>Treatment:</b> {claim.treatmentDetails}
                        </Typography>
                        <Typography variant="body2">
                          <b>Provider:</b> {claim.providerName}
                        </Typography>
                        <Typography variant="body2">
                          <b>Doctor:</b> {claim.doctorName}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Financial Info */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        Financial & Service Info
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <MonetizationOnIcon sx={{ mr: 1, color: "#388E3C" }} />
                          <Typography variant="body2">
                            <b>Amount:</b> ${claim.amount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <EventIcon sx={{ mr: 1, color: "#FF9800" }} />
                          <Typography variant="body2">
                            <b>Service Date:</b> {claim.serviceDate}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Status & Metadata */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 2, color: "#1E8EAB" }}
                      >
                        Status & Metadata
                      </Typography>
                      <Stack spacing={1.5}>
                        <Chip
                          label={claim.status}
                          color={
                            claim.status === "APPROVED"
                              ? "success"
                              : claim.status === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          sx={{ fontWeight: "bold", width: "fit-content" }}
                        />
                        <Typography variant="body2">
                          <b>Submitted At:</b>{" "}
                          {claim.submittedAt
                            ? new Date(claim.submittedAt).toLocaleString()
                            : "—"}
                        </Typography>
                        {claim.approvedAt && (
                          <Typography variant="body2" color="success.main">
                            <b>Approved At:</b>{" "}
                            {new Date(claim.approvedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectedAt && (
                          <Typography variant="body2" color="error">
                            <b>Rejected At:</b>{" "}
                            {new Date(claim.rejectedAt).toLocaleString()}
                          </Typography>
                        )}
                        {claim.rejectionReason && (
                          <Typography variant="body2" color="error">
                            <b>Reason:</b> {claim.rejectionReason}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClaimsList;
