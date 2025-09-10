import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";

import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("⚠️ No token found, please login again.");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:8080/api/Clients/get/abdb4e87-da11-40cc-9e68-7ac59c8cbfcf",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfile(res.data);
        setFormData(res.data);
      } catch (err) {
        console.error("❌ Failed to load profile:", err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // ✅ save profile with FormData
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Please login first.");
      return;
    }

    try {
      const multipartData = new FormData();
      multipartData.append(
        "data",
        new Blob([JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        })], { type: "application/json" })
      );

      if (selectedFile) {
        multipartData.append("universityCard", selectedFile);
      }

      const res = await axios.patch(
        `http://localhost:8080/api/Clients/update/${profile.id}`,
        multipartData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(res.data);
      setFormData(res.data);
      setPreviewImage(null);
      setSelectedFile(null);
      setEditMode(false);
      console.log("✅ Profile updated successfully:", res.data);
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err.message);
      alert("Update failed, check console.");
    }
  };

  if (!profile) {
    return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  }

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

        <Box sx={{ flex: 1, p: 4, display: "flex", justifyContent: "center" }}>
          <Paper
            sx={{
              p: 5,
              borderRadius: 4,
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              maxWidth: "950px",
              width: "100%",
              background: "linear-gradient(145deg, #ffffffcc, #bed9facc)",
              backdropFilter: "blur(6px)",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: "#150380",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonIcon sx={{ fontSize: 36, color: "#1E8EAB" }} />
              Profile
            </Typography>
            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
              {/* صورة البروفايل */}
              <Grid xs={12} md={4} sx={{ display: "flex", justifyContent: "center" }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={
                      previewImage ||
                      (profile.universityCardImage &&
                        `http://localhost:8080${profile.universityCardImage}`)
                    }
                    alt="Profile"
                    sx={{ width: 140, height: 140, border: "4px solid #1E8EAB" }}
                  />
                  {editMode && (
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        bgcolor: "#1E8EAB",
                        color: "#fff",
                      }}
                    >
                      <UploadIcon />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </IconButton>
                  )}
                </Box>
              </Grid>

              {/* معلومات البروفايل */}
              <Grid xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <TextField
                      label="Username"
                      value={formData.username}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <TextField
                      label="Phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={profile.status}
                      color={profile.status === "ACTIVE" ? "success" : "error"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Roles
                    </Typography>
                    {profile.roles.map((role, i) => (
                      <Chip
                        key={i}
                        label={role}
                        sx={{
                          mr: 1,
                          background: "#1E8EAB",
                          color: "#fff",
                          fontWeight: "bold",
                        }}
                      />
                    ))}
                  </Grid>

                  <Grid xs={12} md={6}>
                    <Typography variant="body2" color="gray">
                      <AccessTimeIcon fontSize="small" /> Created At:{" "}
                      {new Date(profile.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <Typography variant="body2" color="gray">
                      <AccessTimeIcon fontSize="small" /> Updated At:{" "}
                      {new Date(profile.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* أزرار الأكشن */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
              {!editMode ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{
                    borderRadius: 3,
                    background: "linear-gradient(90deg,#150380,#1E8EAB)",
                    fontWeight: "bold",
                    px: 4,
                  }}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: 3, px: 3 }}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 3, px: 3 }}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
