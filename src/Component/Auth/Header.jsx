import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from "../../images/image.jpg"; 


export default function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#4424a4ff", // الأزرق الغامق الأساسي
        boxShadow: "none",
        px: 4,
                borderRadius: 1, // 👈 يخلي الهيدر بدون زوايا

      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src={Logo}
            alt="logo"
            style={{ width: "36px", height: "36px", borderRadius: "50%" }}
          />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Birzeit Insurance System
          </Typography>
        </Box>

        {/* Menu Links */}
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button
            component={Link}
            to="/about"
            sx={{ color: "#fff", fontWeight: 500, textTransform: "none" }}
          >
            ABOUT
          </Button>
          <Button
            component={Link}
            to="/LandingPage"
            sx={{ color: "#fff", fontWeight: 500, textTransform: "none" }}
          >
            LOGIN
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
