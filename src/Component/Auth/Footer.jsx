import React, { memo } from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";

const Footer = memo(function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: "#3D4F23",
        color: "#fff",
        textAlign: "center",
        py: { xs: 2, sm: 2.5, md: 3 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Social Media Icons */}
      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
        <IconButton
          href="#"
          color="inherit"
          size="small"
          sx={{
            minWidth: { xs: 40, md: 36 },
            minHeight: { xs: 40, md: 36 },
            mx: 0.5,
          }}
        >
          <FacebookIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
        </IconButton>
        <IconButton
          href="#"
          color="inherit"
          size="small"
          sx={{
            minWidth: { xs: 40, md: 36 },
            minHeight: { xs: 40, md: 36 },
            mx: 0.5,
          }}
        >
          <TwitterIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
        </IconButton>
        <IconButton
          href="#"
          color="inherit"
          size="small"
          sx={{
            minWidth: { xs: 40, md: 36 },
            minHeight: { xs: 40, md: 36 },
            mx: 0.5,
          }}
        >
          <InstagramIcon sx={{ fontSize: { xs: 20, md: 22 } }} />
        </IconButton>
      </Box>

      {/* Contact Info */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="center"
        alignItems="center"
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ mb: { xs: 1, md: 1.5 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <EmailIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
          <Typography
            variant="caption"
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" } }}
          >
            InsuranceSystem700@gmail.com
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <PhoneIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
          <Typography
            variant="caption"
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" } }}
          >
            22982000 - 5111
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LanguageIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
          <Typography
            variant="caption"
            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" } }}
          >
            www.birzeit-insurance.com
          </Typography>
        </Box>
      </Stack>

      {/* Copyright */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
          color: "rgba(255,255,255,0.7)",
          mt: { xs: 1, md: 1.5 },
        }}
      >
        &copy; {new Date().getFullYear()} Birzeit University Insurance System
      </Typography>
    </Box>
  );
});

export default Footer;
