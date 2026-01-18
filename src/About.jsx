import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import mousaImg from "./images/mousa.png";
import jadallahImg from "./images/jad.png";
import osaidImg from "./images/Osaid.png";
import samerImg from "./images/Dr.samer.png";
import logo from "./images/image.jpg";
import Header from "./Component/Auth/Header";
import Footer from "./Component/Auth/Footer";

const developers = [
  {
    name: "Dr. Samer Zein",
    role: "Supervisor — Lecturer at Birzeit University",
    desc: "Supervised and guided the team throughout the development of this graduation project.",
    image: samerImg,
  },
  {
    name: "Mousa Shuaib",
    role: "Computer Science Student",
    desc: "Worked on backend, frontend, and mobile modules in this project.",
    image: mousaImg,
  },
  {
    name: "Jadallah Baragheithah",
    role: "Computer Science Student",
    desc: "Worked on backend, frontend, and mobile modules in this project.",
    image: jadallahImg,
  },
  {
    name: "Osaid Hamayel",
    role: "Computer Science Student",
    desc: "Worked on backend, frontend, and mobile modules in this project.",
    image: osaidImg,
  },
];

const About = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `
          linear-gradient(to bottom, 
            #4424a4 0%, 
            #5b3fc4 15%, 
            #8a7ee5 40%, 
            #f3f1ff 100%
          )
        `,
      }}
    >
      {/* ✅ Header */}
      <Header />

      {/* ✅ فاصلة بسيطة تحت الهيدر */}
      <Box
        sx={{
          height: "30px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)",
        }}
      />

      {/* ✅ Main Content */}
      <Box
        sx={{
          flex: 1,
          py: 6,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            p: 4.5,
            maxWidth: "950px", // 🔹 أصغر شوي
            margin: "auto",
            borderRadius: 5,
            boxShadow: "0 10px 35px rgba(0,0,0,0.2)", // 🔹 ظل أنعم واحترافي
            background: "rgba(255,255,255,0.97)",
            textAlign: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: 3.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: 85,
                height: 85,
                borderRadius: "50%",
                mb: 1.5,
                border: "3px solid #4424a4",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#120460",
                mb: 1,
                fontSize: "1.65rem",
              }}
            >
              Birzeit University Health Insurance System
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ color: "gray", mb: 2, fontSize: "0.95rem" }}
            >
              Graduation Project — Computer Science, Class of 2025
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              mb: 4.5,
              fontSize: "1.05rem",
              lineHeight: 1.8,
              color: "#222",
              maxWidth: "780px",
              mx: "auto",
            }}
          >
            We are a team of Computer Science students at Birzeit University.
            This graduation project represents a complete <b>Health Insurance System</b> 
            tailored for university employees. Each of us contributed in 
            <b> Backend</b>, <b> Frontend</b>, and <b> Mobile development</b>,
            ensuring the platform is <b>secure</b>, <b>efficient</b>, and <b>modern</b>.
          </Typography>

          {/* Team Grid */}
          <Grid
            container
            spacing={3.5}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              justifyItems: "center",
            }}
          >
            {developers.map((dev, i) => (
              <Paper
                key={i}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #faf6ff, #f1e9ff)",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
                  textAlign: "center",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  width: "80%",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={dev.image}
                  alt={dev.name}
                  sx={{
                    width: "135px",
                    height: "135px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    mb: 2,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#000",
                    mb: 0.8,
                    fontSize: "1.1rem",
                  }}
                >
                  {dev.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontStyle: "italic",
                    color: "#5c3bb2",
                    mb: 1.4,
                    fontSize: "0.9rem",
                  }}
                >
                  {dev.role}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#333",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  {dev.desc}
                </Typography>
              </Paper>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* ✅ Footer */}
      <Footer />
    </Box>
  );
};

export default About;
