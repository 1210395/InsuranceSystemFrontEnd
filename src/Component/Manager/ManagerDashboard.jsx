import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPolicies: 0,
    pendingClaims: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // جلب الإحصائيات
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:8080/api/dashboard/manager/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard stats:", err);
      }
    };
    fetchStats();
  }, []);

  // البحث
  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:8080/api/search-profiles/by-name?name=${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(res.data);
    } catch (err) {
      console.error("❌ Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "CLINIC":
        return <LocalHospitalIcon sx={{ fontSize: 40, color: "#1976d2" }} />;
      case "PHARMACY":
        return <LocalPharmacyIcon sx={{ fontSize: 40, color: "#2e7d32" }} />;
      case "LAB":
        return <ScienceIcon sx={{ fontSize: 40, color: "#d32f2f" }} />;
      default:
        return <SearchIcon sx={{ fontSize: 40, color: "#555" }} />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          background: "#f5f7fb",
          minHeight: "100vh",
          marginLeft: "240px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        {/* 🔍 Search Bar */}
        <Box
          sx={{
            px: 3,
            py: 5,
            background: "linear-gradient(90deg,#150380,#1E8EAB)",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            placeholder="🔍 Search for Clinic, Pharmacy, or Lab..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#150380" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <IconButton onClick={() => handleSearch("")}>
                  <CloseIcon />
                </IconButton>
              ),
            }}
            sx={{
              maxWidth: 650,
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontSize: "1rem",
              },
            }}
          />
        </Box>

        {/* ✅ Search Results */}
        {searchTerm && (
          <Box sx={{ p: 4 }}>
            {loading ? (
              <Box sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress />
              </Box>
            ) : results.length > 0 ? (
              <>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Search Results
                </Typography>
                <Grid container spacing={3}>
                  {results.map((profile) => (
                    <Grid item xs={12} md={6} lg={4} key={profile.id}>
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 4,
                          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          transition: "0.3s",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 12px 25px rgba(0,0,0,0.25)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          {getTypeIcon(profile.type)}
                          <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
                            {profile.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          <b>Type:</b> {profile.type}
                        </Typography>
                        <Typography variant="body2">
                          <b>Address:</b> {profile.address}
                        </Typography>
                        <Typography variant="body2">
                          <b>Contact:</b> {profile.contactInfo}
                        </Typography>
                        <Typography variant="body2">
                          <b>Owner:</b> {profile.ownerName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {profile.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 3 }}
              >
                No results found for "{searchTerm}"
              </Typography>
            )}
          </Box>
        )}

        {/* 📊 Dashboard (يظهر فقط لو مفيش بحث) */}
        {!searchTerm && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Main Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Welcome to the Insurance Manager Dashboard – Birzeit University
            </Typography>

            <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
              {/* Total Clients */}
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #1E3C72, #2A5298)",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 55, mb: 1 }} />
                  <Typography variant="h6">Total Clients</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalClients}
                  </Typography>
                </Paper>
              </Grid>

              {/* Total Policies */}
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #11998e, #38ef7d)",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <PolicyIcon sx={{ fontSize: 55, mb: 1 }} />
                  <Typography variant="h6">Total Policies</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalPolicies}
                  </Typography>
                </Paper>
              </Grid>

              {/* Pending Claims */}
              <Grid item xs={12} md={3}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 5,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #FF416C, #FF4B2B)",
                    color: "#fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 55, mb: 1 }} />
                  <Typography variant="h6">Pending Claims</Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.pendingClaims}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ManagerDashboard;
