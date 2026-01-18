import React from "react";
import Header from "./Component/Auth/Header"; // افترض وجود الهيدر
import Footer from "./Component/Auth/Footer"; // افترض وجود الفوتر
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmergencyIcon from '@mui/icons-material/Warning';

export default function Help() {
  const sections = [
    {
      icon: <DashboardIcon />,
      title: "Dashboard",
      points: [
        "متابعة حالة المطالبات والطلبات الحالية.",
        "عرض الإشعارات الأخيرة والتنبيهات المهمة.",
        "الوصول السريع لكل أقسام النظام."
      ],
      color: "#EDE7F6"
    },
    {
      icon: <ReceiptLongIcon />,
      title: "My Claims & Add Claims",
      points: [
        "عرض جميع المطالبات السابقة والحالية.",
        "تقديم مطالبة جديدة بكل سهولة.",
        "رفع المستندات والفواتير المطلوبة.",
        "متابعة حالة الطلب خطوة بخطوة."
      ],
      color: "#E3F2FD"
    },
    {
      icon: <MedicalServicesIcon />,
      title: "My Prescription",
      points: [
        "عرض كل الوصفات الحالية والسابقة.",
        "تحميل وصفة جديدة أو طباعتها.",
        "تلقي تنبيهات عند تجديد الوصفات."
      ],
      color: "#FFF3E0"
    },
    {
      icon: <LocalHospitalIcon />,
      title: "My Medical Record & Lab Requests",
      points: [
        "الوصول لجميع السجلات الطبية الخاصة بك.",
        "طلب فحوصات مختبر جديدة ومتابعة النتائج.",
        "تحميل المستندات الطبية الهامة."
      ],
      color: "#E8F5E9"
    },
    {
      icon: <SearchIcon />,
      title: "Search",
      points: [
        "البحث عن المستشفيات والمراكز الطبية المشمولة بالنظام.",
        "البحث عن المطالبات السابقة.",
        "الوصول السريع للسجلات أو الوصفات."
      ],
      color: "#FFEBEE"
    },
    {
      icon: <NotificationsActiveIcon />,
      title: "Notification",
      points: [
        "تحديث حالة المطالبات.",
        "تنبيهات حول الوصفات الطبية والفحوصات.",
        "التذكير بالمواعيد والخدمات الجديدة."
      ],
      color: "#FFFDE7"
    },
    {
      icon: <LockIcon />,
      title: "Profile & Change Password",
      points: [
        "تحديث البيانات الشخصية ومعلومات الاتصال.",
        "تغيير كلمة المرور بأمان.",
        "تحديث بيانات التأمين والوثائق."
      ],
      color: "#F3E5F5"
    },
    {
      icon: <EmergencyIcon />,
      title: "Emergency Requests & Add Emergency",
      points: [
        "إرسال بلاغ عاجل لأي حالة طارئة.",
        "متابعة حالة الطوارئ في الوقت الحقيقي."
      ],
      color: "#E0F7FA"
    },
    {
      icon: <EmailIcon />,
      title: "Email & Healthcare Provider Page",
      points: [
        "إرسال رسائل البريد الإلكتروني لدعم العملاء.",
        "الوصول لصفحة مزود الخدمة لمعرفة كل التفاصيل."
      ],
      color: "#F1F8E9"
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(to bottom, #f0f4f8, #e0e7ff)" }}>
      <Header />
      <Container maxWidth="md" sx={{ py: 5, flexGrow: 1 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(90deg, #4424A4, #6C63FF)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Help & User Guide
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom sx={{ mb: 4, color: "#555" }}>
          دليل شامل لجميع ميزات نظام بيرزيت للتأمين الصحي
        </Typography>

        {sections.map((section, idx) => (
          <Accordion key={idx} sx={{ mb: 2, "&:hover": { boxShadow: 4 } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: section.color }}>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 'bold' }}>
                {section.icon} {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, backgroundColor: "#fff" }}>
                <List>
                  {section.points.map((point, i) => (
                    <ListItem key={i}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
      <Footer />
    </Box>
  );
}
