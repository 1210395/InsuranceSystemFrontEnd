import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import Header from "../Header";
import Sidebar from "../Sidebar";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios";

const FinancialReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ جلب البيانات من الباك إند
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/reports/financial", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch financial report:", err.response?.data || err.message);
        setError("⚠️ Failed to load Financial Report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
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
          {/* عنوان الصفحة */}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              color: "#120460",
              display: "flex",
              alignItems: "center",
              mb: 3,
            }}
          >
            <MonetizationOnIcon sx={{ mr: 1, fontSize: 40, color: "#1E8EAB" }} />
            Financial Report
          </Typography>

          {/* Grid للبطاقات */}
          <Grid container spacing={3}>
            {/* Total Expenses */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #00b09b, #96c93d)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Total Expenses
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ${report.totalExpenses}
                </Typography>
              </Paper>
            </Grid>

            {/* Top Providers Total */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #2193b0, #6dd5ed)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Top Providers Total
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ${report.topProviders.reduce((sum, p) => sum + p.totalAmount, 0)}
                </Typography>
              </Paper>
            </Grid>

            {/* Top Provider Name */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #ff512f, #dd2476)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Top Provider
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {report.topProviders.length > 0 ? report.topProviders[0].providerName : "N/A"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* تفاصيل إضافية */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                color: "#120460",
                mb: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <LocalHospitalIcon sx={{ mr: 1, color: "#1E8EAB" }} />
              Providers Breakdown
            </Typography>

            <Grid container spacing={3}>
              {report.topProviders.map((provider, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {provider.providerName}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "#00b09b",
                          fontWeight: "bold",
                          mt: 1,
                        }}
                      >
                        ${provider.totalAmount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FinancialReport;
