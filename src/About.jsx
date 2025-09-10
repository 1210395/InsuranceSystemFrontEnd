import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import mousaImg from "./images/mousa.png";      
import jadallahImg from "./images/jad.png";    
import osaidImg from "./images/Osaid.png";     
import logo from "./images/image.jpg";          

const developers = [
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
        p: 5,
        background: "linear-gradient(135deg, #6a11cb, #150380, #ff99cc)",
        minHeight: "100vh",
      }}
    >
      <Paper
        sx={{
          p: 5,
          maxWidth: "1100px",
          margin: "auto",
          borderRadius: 4,
          boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
          background: "rgba(255,255,255,0.95)",
          textAlign: "center",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              mb: 2,
              border: "3px solid #6a11cb",
            }}
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: "#150380", mb: 1 }}
          >
            Birzeit University Health Insurance System
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "gray", mb: 2 }}>
            Graduation Project — Computer Science, Class of 2025
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* General Description */}
        <Typography
          variant="body1"
          sx={{
            mb: 5,
            fontSize: "1.1rem",
            lineHeight: 1.8,
            color: "#111",
          }}
        >
          We are three Computer Science students at Birzeit University.  
          This graduation project is a complete <b>Health Insurance System</b> for university employees.  
          All of us contributed in <b>Backend</b>, <b>Frontend</b>, and <b>Mobile development</b>,  
          ensuring the system is modern, secure, and efficient.
        </Typography>

        {/* Team Cards */}
        <Grid container spacing={4} justifyContent="center">
          {developers.map((dev, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "#ffe6f2", // وردي فاتح بارد
                  boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                  textAlign: "center",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={dev.image}
                  alt={dev.name}
                  sx={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#000", mb: 1 }}
                >
                  {dev.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontStyle: "italic", color: "#6a11cb", mb: 2 }}
                >
                  {dev.role}
                </Typography>
                <Typography variant="body2" sx={{ color: "#333" }}>
                  {dev.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default About;
