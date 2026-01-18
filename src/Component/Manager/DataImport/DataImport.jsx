import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import RadiologyScanIcon from "@mui/icons-material/Scanner";
import DiagnosisIcon from "@mui/icons-material/MedicalInformation";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import Sidebar from "../Sidebar";
import api from "../../../utils/apiService";
import { useLanguage } from "../../../context/LanguageContext";

const importTypes = [
  {
    id: "medicine-prices",
    title: "Medicine Prices",
    titleAr: "أسعار الأدوية",
    description: "Import medicine prices from Excel file",
    descriptionAr: "استيراد أسعار الأدوية من ملف Excel",
    endpoint: "/api/import/medicine-prices",
    templateEndpoint: "/api/templates/medicine-prices",
    fileType: "xlsx",
    icon: MedicationIcon,
    color: "#4CAF50",
    fileName: "اسعار الادوية.xlsx",
  },
  {
    id: "medicine-data",
    title: "Medicine Data",
    titleAr: "بيانات الأدوية",
    description: "Import medicine data with coverage status",
    descriptionAr: "استيراد بيانات الأدوية مع حالة التغطية",
    endpoint: "/api/import/medicine-data",
    templateEndpoint: "/api/templates/medicine-data",
    fileType: "xlsx",
    icon: MedicationIcon,
    color: "#66BB6A",
    fileName: "ملف الادوية.xlsx",
  },
  {
    id: "lab-tests",
    title: "Lab Tests",
    titleAr: "الفحوصات الطبية",
    description: "Import lab tests with coverage status",
    descriptionAr: "استيراد الفحوصات الطبية مع حالة التغطية",
    endpoint: "/api/import/lab-tests",
    templateEndpoint: "/api/templates/lab-tests",
    fileType: "xlsx",
    icon: BiotechIcon,
    color: "#2196F3",
    fileName: "فحوصات طبية.xlsx",
  },
  {
    id: "radiology",
    title: "Radiology",
    titleAr: "الأشعة",
    description: "Import radiology data with coverage status",
    descriptionAr: "استيراد بيانات الأشعة مع حالة التغطية",
    endpoint: "/api/import/radiology",
    templateEndpoint: "/api/templates/radiology",
    fileType: "xlsx",
    icon: RadiologyScanIcon,
    color: "#9C27B0",
    fileName: "ملف الاشعة.xlsx",
  },
  {
    id: "diagnoses",
    title: "Diagnoses",
    titleAr: "التشخيصات الطبية",
    description: "Import medical diagnoses",
    descriptionAr: "استيراد التشخيصات الطبية",
    endpoint: "/api/import/diagnoses",
    templateEndpoint: "/api/templates/diagnoses",
    fileType: "xlsx",
    icon: DiagnosisIcon,
    color: "#FF9800",
    fileName: "تشخيصات طبية.xlsx",
  },
  {
    id: "medical-center",
    title: "Medical Center Data",
    titleAr: "بيانات المركز الطبي",
    description: "Import specializations and job titles",
    descriptionAr: "استيراد التخصصات والمسميات الوظيفية",
    endpoint: "/api/import/medical-center",
    templateEndpoint: "/api/templates/medical-center",
    fileType: "xlsx",
    icon: LocalHospitalIcon,
    color: "#E91E63",
    fileName: "بيانات مركز طبي.xlsx",
  },
  {
    id: "doctor-procedures",
    title: "Doctor Procedures",
    titleAr: "إجراءات الطبيب",
    description: "Import doctor procedures and prices from Word",
    descriptionAr: "استيراد إجراءات الطبيب والأسعار من ملف Word",
    endpoint: "/api/import/doctor-procedures",
    templateEndpoint: "/api/templates/doctor-procedures",
    fileType: "docx",
    icon: AssignmentIcon,
    color: "#00BCD4",
    fileName: "اتفاقية طبيب.docx",
  },
  {
    id: "policy",
    title: "Insurance Policy",
    titleAr: "بوليصة التأمين",
    description: "Import insurance policy document",
    descriptionAr: "استيراد وثيقة بوليصة التأمين",
    endpoint: "/api/import/policy",
    templateEndpoint: "/api/templates/policy",
    fileType: "docx",
    icon: PictureAsPdfIcon,
    color: "#795548",
    fileName: "بوليصة تامين.docx",
  },
];

const DataImport = () => {
  const { language, isRTL } = useLanguage();
  const [uploading, setUploading] = useState({});
  const [downloading, setDownloading] = useState({});
  const [results, setResults] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleDownloadTemplate = useCallback(async (importType) => {
    setDownloading((prev) => ({ ...prev, [importType.id]: true }));
    try {
      // api.download returns the blob directly
      const blob = await api.download(importType.templateEndpoint);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", importType.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: language === "ar" ? "تم تحميل القالب بنجاح" : "Template downloaded successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      setSnackbar({
        open: true,
        message: language === "ar" ? "فشل تحميل القالب" : "Failed to download template",
        severity: "error",
      });
    } finally {
      setDownloading((prev) => ({ ...prev, [importType.id]: false }));
    }
  }, [language]);

  const handleFileUpload = useCallback(async (importType, file) => {
    if (!file) return;

    const expectedExtension = importType.fileType;
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(`.${expectedExtension}`)) {
      setSnackbar({
        open: true,
        message: `Please select a .${expectedExtension} file`,
        severity: "error",
      });
      return;
    }

    setUploading((prev) => ({ ...prev, [importType.id]: true }));
    setResults((prev) => ({ ...prev, [importType.id]: null }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      // api.upload returns response.data directly
      const result = await api.upload(importType.endpoint, formData);

      setResults((prev) => ({ ...prev, [importType.id]: result }));
      setSnackbar({
        open: true,
        message: result.message || "Import successful!",
        severity: "success",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Import failed";
      setResults((prev) => ({
        ...prev,
        [importType.id]: { success: false, message: errorMessage },
      }));
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [importType.id]: false }));
    }
  }, []);

  const handleFileSelect = useCallback((importType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `.${importType.fileType}`;
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(importType, file);
      }
    };
    input.click();
  }, [handleFileUpload]);

  const renderImportCard = (importType) => {
    const Icon = importType.icon;
    const isUploading = uploading[importType.id];
    const isDownloading = downloading[importType.id];
    const result = results[importType.id];

    return (
      <Grid item xs={12} sm={6} md={4} key={importType.id}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderTop: `4px solid ${importType.color}`,
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Icon sx={{ fontSize: 40, color: importType.color, mr: 2 }} />
              <Box>
                <Typography variant="h6" component="div">
                  {language === "ar" ? importType.titleAr : importType.title}
                </Typography>
                <Chip
                  label={`.${importType.fileType}`}
                  size="small"
                  sx={{ mt: 0.5, bgcolor: importType.color, color: "white" }}
                />
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {language === "ar" ? importType.descriptionAr : importType.description}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block">
              {language === "ar" ? "الملف المتوقع:" : "Expected file:"} {importType.fileName}
            </Typography>

            {isUploading && <LinearProgress sx={{ mt: 2 }} />}

            {result && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={result.success ? "success" : "error"}
                  icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
                  sx={{ mb: 1 }}
                >
                  {result.message}
                </Alert>

                {result.success && (
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <DescriptionIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${language === "ar" ? "إجمالي الصفوف:" : "Total rows:"} ${result.totalRows || 0}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${language === "ar" ? "تم استيرادها:" : "Imported:"} ${result.importedRows || 0}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon fontSize="small" color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${language === "ar" ? "تم تحديثها:" : "Updated:"} ${result.updatedRows || 0}`}
                      />
                    </ListItem>
                    {result.errorRows > 0 && (
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <ErrorIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${language === "ar" ? "أخطاء:" : "Errors:"} ${result.errorRows}`}
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, flexDirection: "column", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadTemplate(importType)}
              disabled={isDownloading}
              fullWidth
              size="small"
              sx={{
                borderColor: importType.color,
                color: importType.color,
                "&:hover": { borderColor: importType.color, bgcolor: `${importType.color}10` },
              }}
            >
              {isDownloading
                ? language === "ar"
                  ? "جاري التحميل..."
                  : "Downloading..."
                : language === "ar"
                ? "تحميل القالب"
                : "Download Template"}
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => handleFileSelect(importType)}
              disabled={isUploading}
              fullWidth
              sx={{
                bgcolor: importType.color,
                "&:hover": { bgcolor: importType.color, filter: "brightness(0.9)" },
              }}
            >
              {isUploading
                ? language === "ar"
                  ? "جاري الرفع..."
                  : "Uploading..."
                : language === "ar"
                ? "رفع الملف"
                : "Upload File"}
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: 7, sm: 0 },
          ml: { xs: 0, sm: isRTL ? 0 : "72px", md: isRTL ? 0 : "240px" },
          mr: { xs: 0, sm: isRTL ? "72px" : 0, md: isRTL ? "240px" : 0 },
          transition: "margin 0.3s ease",
        }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {language === "ar" ? "استيراد البيانات" : "Data Import"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {language === "ar"
              ? "استيراد ملفات Excel و Word لتحديث قاعدة البيانات بالأدوية والفحوصات والأشعة وغيرها."
              : "Import Excel and Word files to update the database with medicines, tests, radiology, and more."}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {language === "ar" ? "ملفات Excel" : "Excel Files"}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {importTypes.filter((t) => t.fileType === "xlsx").map(renderImportCard)}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          {language === "ar" ? "ملفات Word" : "Word Files"}
        </Typography>

        <Grid container spacing={3}>
          {importTypes.filter((t) => t.fileType === "docx").map(renderImportCard)}
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default DataImport;
