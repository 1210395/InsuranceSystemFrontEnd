import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

export default function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "#4424a4ff", // نفس الأزرق الأساسي
        color: "#fff",
        textAlign: "center",
        py: 3,
        mt: "auto",
      }}
    >
      {/* Social Media Icons */}
      <Box sx={{ mb: 1 }}>
        <IconButton href="#" color="inherit">
          <FacebookIcon />
        </IconButton>
        <IconButton href="#" color="inherit">
          <TwitterIcon />
        </IconButton>
        <IconButton href="#" color="inherit">
          <InstagramIcon />
        </IconButton>
      </Box>

      {/* CopyRight */}
      <Typography variant="body2">
        © {new Date().getFullYear()} Birzeit Insurance System. All rights
        reserved.
      </Typography>
    </Box>
  );
}
