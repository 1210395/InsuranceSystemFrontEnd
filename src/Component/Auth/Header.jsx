import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../images/image.jpg";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const Header = memo(function Header({ setMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { language } = useLanguage();

  const goToSignIn = () => {
    localStorage.setItem("authMode", "signin");

    if (location.pathname === "/LandingPage" && setMode) {
      setMode("signin");
    } else {
      navigate("/LandingPage");
    }
    setDrawerOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const menuItems = [
    { label: t("help", language).toUpperCase(), action: () => handleNavigation("/Help") },
    { label: t("about", language).toUpperCase(), action: () => handleNavigation("/About") },
    { label: t("signIn", language).toUpperCase(), action: goToSignIn },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#556B2F",
        boxShadow: "none",
        px: { xs: 1, sm: 2, md: 4 },
        borderRadius: 1,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        {/* Logo + Title */}
        <Box
          onClick={goToSignIn}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, sm: 1 },
            textDecoration: "none",
            color: "#fff",
            cursor: "pointer",
            "&:hover": { opacity: 0.9 },
          }}
        >
          <img
            src={Logo}
            alt="logo"
            style={{ width: isMobile ? "30px" : "36px", height: isMobile ? "30px" : "36px", borderRadius: "50%" }}
          />
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            {t("systemName", language)}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: "0.85rem",
              display: { xs: "block", sm: "none" },
            }}
          >
            BIS
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: { sm: 1, md: 3 } }}>
          <Button
            onClick={() => navigate("/Help")}
            sx={{
              color: "#fff",
              fontWeight: 500,
              textTransform: "none",
              minHeight: 44,
              px: { sm: 1, md: 2 },
              fontSize: { sm: "0.85rem", md: "1rem" },
            }}
          >
            {t("help", language).toUpperCase()}
          </Button>
          <Button
            onClick={() => navigate("/About")}
            sx={{
              color: "#fff",
              fontWeight: 500,
              textTransform: "none",
              minHeight: 44,
              px: { sm: 1, md: 2 },
              fontSize: { sm: "0.85rem", md: "1rem" },
            }}
          >
            {t("about", language).toUpperCase()}
          </Button>
          <Button
            onClick={goToSignIn}
            sx={{
              color: "#fff",
              fontWeight: 500,
              textTransform: "none",
              minHeight: 44,
              px: { sm: 1, md: 2 },
              fontSize: { sm: "0.85rem", md: "1rem" },
            }}
          >
            {t("signIn", language).toUpperCase()}
          </Button>
        </Box>

        {/* Mobile Hamburger Menu */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            display: { xs: "flex", sm: "none" },
            color: "#fff",
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 250,
              backgroundColor: "#556B2F",
              color: "#fff",
            },
          }}
        >
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {t("menu", language)}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#fff", minWidth: 44, minHeight: 44 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={item.action}
                  sx={{
                    py: 1.5,
                    minHeight: 48,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
});

Header.propTypes = {
  setMode: PropTypes.func,
};

export default Header;
