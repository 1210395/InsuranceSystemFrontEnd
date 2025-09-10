import React, { useState, useEffect } from "react";
import { Box, Typography, Container, CssBaseline } from "@mui/material";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import SignIn from "../Auth/SignIn.jsx";
import SignUp from "../Auth/SignUp.jsx";
import ForgotPassword from "../Auth/ForgotPassword.jsx";

const LandingPage = () => {
  // 🟢 استرجاع mode من localStorage أو افتراضي signin
  const [mode, setMode] = useState(localStorage.getItem("authMode") || "signin");

  // 🟢 أي تغيير على mode نخزنه في localStorage
  useEffect(() => {
    localStorage.setItem("authMode", mode);
  }, [mode]);

  useEffect(() => {
  if (window.location.pathname === "/" || window.location.pathname === "/LandingPage") {
    setMode("signin"); // 👈 بدل ResetPassword
  }
}, []);



  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Header />
      <Container
        component="main"
        sx={{
          flex: 1,
          mt: 6,
          mb: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            maxWidth: "1200px",
            gap: 10,
          }}
        >
          {/* النص الترحيبي */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#120460",
                lineHeight: 1.3,
              }}
            >
              Welcome to Our Platform!
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#004696", mb: 2, lineHeight: 1.6 }}
            >
              Join Birzeit Insurance and manage all your health insurance needs
              in one platform. From policies and claims to prescriptions and lab
              requests, everything is simplified for a seamless experience. Sign
              up today and get started with confidence.
            </Typography>
          </Box>

          {/* الكارد */}
          <Box
            sx={{
              flex: 1,
              maxWidth: "500px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {mode === "signin" ? (
              <SignIn setMode={setMode} />
            ) : mode === "signup" ? (
              <SignUp setMode={setMode} />
            ) : (
              <ForgotPassword setMode={setMode} /> // ✅ شاشة Forgot Password
            )}
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default LandingPage;
