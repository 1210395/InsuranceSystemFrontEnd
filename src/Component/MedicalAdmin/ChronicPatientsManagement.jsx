// src/Component/MedicalAdmin/ChronicPatientsManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Autocomplete,
  Divider,
} from "@mui/material";
import Header from "./MedicalAdminHeader";
import Sidebar from "./MedicalAdminSidebar";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";
import PersonIcon from "@mui/icons-material/Person";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ScienceIcon from "@mui/icons-material/Science";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

const ChronicPatientsManagement = () => {
  const { language, isRTL } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [scheduleType, setScheduleType] = useState("PRESCRIPTION"); // PRESCRIPTION, LAB
  const [scheduleData, setScheduleData] = useState({
    medicationName: "",
    medicationQuantity: 1,
    labTestName: "",
    intervalMonths: 1,
    notes: "",
  });
  const [medications, setMedications] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [loadingLabTests, setLoadingLabTests] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [patientDetailsDialog, setPatientDetailsDialog] = useState({
    open: false,
    patient: null,
  });
  const [documentDialog, setDocumentDialog] = useState({
    open: false,
    imageUrl: null,
  });


  useEffect(() => {
    fetchChronicPatients();
    fetchSchedules();
  }, []);

  // جلب الأدوية والفحوصات عند فتح Dialog أو تغيير نوع الجدول
  useEffect(() => {
    if (openDialog) {
      if (scheduleType === "PRESCRIPTION" && medications.length === 0) {
        fetchMedications();
      } else if (scheduleType === "LAB" && labTests.length === 0) {
        fetchLabTests();
      }
    }
  }, [scheduleType, openDialog]);

  const fetchMedications = async () => {
    try {
      setLoadingMedications(true);
      const res = await api.get(API_ENDPOINTS.PRICELIST.BY_TYPE("PHARMACY"));
      const medicationNames = res.data
        .map(item => item.serviceName)
        .filter(Boolean)
        .sort();
      setMedications(medicationNames);
    } catch (err) {
      console.error("Error fetching medications:", err);
      setSnackbar({
        open: true,
        message: "فشل في جلب قائمة الأدوية",
        severity: "error",
      });
    } finally {
      setLoadingMedications(false);
    }
  };

  const fetchLabTests = async () => {
    try {
      setLoadingLabTests(true);
      const res = await api.get(API_ENDPOINTS.PRICELIST.BY_TYPE("LAB"));
      const testNames = res.data
        .map(item => item.serviceName)
        .filter(Boolean)
        .sort();
      setLabTests(testNames);
    } catch (err) {
      console.error("Error fetching lab tests:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch lab tests list",
        severity: "error",
      });
    } finally {
      setLoadingLabTests(false);
    }
  };

  const fetchChronicPatients = async () => {
    try {
      const res = await api.get("/api/medical-admin/chronic-patients");
      console.log("📋 Chronic patients data:", res.data);
      // ✅ التأكد من أن البيانات كاملة
      const patientsWithFullData = res.data.map(patient => {
        console.log("🔍 Patient data:", patient);
        return {
          ...patient,
          phone: patient.phone || "",
          nationalId: patient.nationalId || "",
          department: patient.department || "",
          faculty: patient.faculty || "",
          gender: patient.gender || "",
          dateOfBirth: patient.dateOfBirth || "",
          age: patient.age || null,
          chronicDocumentPaths: patient.chronicDocumentPaths || [],
        };
      });
      setPatients(patientsWithFullData);
    } catch (err) {
      console.error("Error fetching chronic patients:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch chronic patients",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/api/medical-admin/chronic-schedules");
      console.log("Chronic schedules sample", res.data?.[0]);
      setSchedules(res.data);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const handleOpenDialog = (patient) => {
    setSelectedPatient(patient);
    setOpenDialog(true);
    setScheduleData({
      medicationName: "",
      medicationQuantity: 1,
      labTestName: "",
      intervalMonths: 1,
      notes: "",
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
  };

  const handleCreateSchedule = async () => {
    if (!selectedPatient) return;

    try {
      const payload = {
        patientId: selectedPatient.id,
        scheduleType: scheduleType,
        intervalMonths: scheduleData.intervalMonths,
        notes: scheduleData.notes,
      };

      if (scheduleType === "PRESCRIPTION") {
        payload.medicationName = scheduleData.medicationName;
        payload.medicationQuantity = scheduleData.medicationQuantity || 1;
      } else if (scheduleType === "LAB") {
        payload.labTestName = scheduleData.labTestName;
      }

      await api.post("/api/medical-admin/create-chronic-schedule", payload);

      setSnackbar({
        open: true,
        message: "تم إنشاء الجدول بنجاح",
        severity: "success",
      });
      handleCloseDialog();
      fetchSchedules();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create schedule",
        severity: "error",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await api.delete(`/api/medical-admin/delete-chronic-schedule/${scheduleId}`);

      setSnackbar({
        open: true,
        message: "Schedule deleted successfully",
        severity: "success",
      });
      fetchSchedules();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete schedule",
        severity: "error",
      });
    }
  };

  const getScheduleTypeLabel = (type) => {
    switch (type) {
      case "PRESCRIPTION":
        return "وصفة طبية";
      case "LAB":
        return "فحص مختبر";
      default:
        return type;
    }
  };

  const getScheduleTypeIcon = (type) => {
    switch (type) {
      case "PRESCRIPTION":
        return <LocalPharmacyIcon />;
      case "LAB":
        return <ScienceIcon />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAF8F5" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: isRTL ? 0 : "240px", mr: isRTL ? "240px" : 0, p: 3 }}>
        <Header />

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <MonitorHeartIcon sx={{ fontSize: 40, color: "#556B2F" }} />
            <Box>
              <Typography variant="h4" fontWeight="700" color="#3D4F23">
                {t("chronicPatientsManagement", language)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("automaticMedicationLabScheduling", language)}
              </Typography>
            </Box>
          </Stack>

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label={t("chronicPatients", language)} />
            <Tab label={t("activeSchedules", language)} />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              {patients.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">{t("noChronicPatientsRegistered", language)}</Alert>
                </Grid>
              ) : (
                patients.map((patient) => (
                  <Grid item xs={12} md={6} lg={4} key={patient.id}>
                    <Card elevation={2} sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                          <PersonIcon sx={{ fontSize: 40, color: "#556B2F" }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="600">
                              {patient.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {patient.employeeId}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            {t("chronicDiseases", language)}:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {patient.chronicDiseases?.map((disease, idx) => (
                              <Chip
                                key={idx}
                                label={disease}
                                size="small"
                                color="error"
                                sx={{ mb: 0.5 }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        {patient.chronicDocumentPaths && patient.chronicDocumentPaths.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                              Documents: {patient.chronicDocumentPaths.length} file(s)
                            </Typography>
                          </Box>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<VisibilityIcon />}
                            onClick={() => setPatientDetailsDialog({ open: true, patient })}
                          >
                            {t("details", language)}
                          </Button>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog(patient)}
                          >
                            {t("addSchedule", language)}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("patient", language)}</TableCell>
                    <TableCell>{t("type", language)}</TableCell>
                    <TableCell>{t("details", language)}</TableCell>
                    <TableCell>{t("everyMonth", language)}</TableCell>
                    <TableCell>{t("lastSent", language)}</TableCell>
                    <TableCell>{t("actions", language)}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">{t("noActiveSchedules", language)}</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{schedule.patientName}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {getScheduleTypeIcon(schedule.scheduleType)}
                            <Typography>{getScheduleTypeLabel(schedule.scheduleType)}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {schedule.medicationName || schedule.labTestName}
                        </TableCell>
                        <TableCell>{schedule.intervalMonths}</TableCell>
                        <TableCell>
                          {schedule.lastSentAt
                            ? new Date(schedule.lastSentAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : "Not sent yet"}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Dialog for creating schedule */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{t("createNewAutomaticSchedule", language)}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t("patient", language)}: <strong>{selectedPatient?.fullName}</strong>
              </Typography>

              <FormControl fullWidth>
                <InputLabel>{t("scheduleType", language)}</InputLabel>
                <Select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                  label={t("scheduleType", language)}
                >
                  <MenuItem value="PRESCRIPTION">{t("prescription", language)}</MenuItem>
                  <MenuItem value="LAB">{t("labTest", language)}</MenuItem>
                </Select>
              </FormControl>

              {scheduleType === "PRESCRIPTION" && (
                <>
                  <Autocomplete
                    options={medications}
                    value={scheduleData.medicationName || null}
                    onChange={(event, newValue) => {
                      setScheduleData({ ...scheduleData, medicationName: newValue || "" });
                    }}
                    loading={loadingMedications}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Medication Name"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingMedications ? <CircularProgress size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    fullWidth
                    freeSolo={false}
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={scheduleData.medicationQuantity || 1}
                    onChange={(e) =>
                      setScheduleData({ ...scheduleData, medicationQuantity: parseInt(e.target.value) || 1 })
                    }
                    fullWidth
                    inputProps={{ min: 1 }}
                    required
                    helperText="Number of medication units/packages needed"
                  />
                </>
              )}

              {scheduleType === "LAB" && (
                <Autocomplete
                  options={labTests}
                  value={scheduleData.labTestName || null}
                  onChange={(event, newValue) => {
                    setScheduleData({ ...scheduleData, labTestName: newValue || "" });
                  }}
                  loading={loadingLabTests}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lab Test Name"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingLabTests ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  fullWidth
                  freeSolo={false}
                />
              )}

              <TextField
                label="Every (Months)"
                type="number"
                value={scheduleData.intervalMonths}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, intervalMonths: parseInt(e.target.value) })
                }
                fullWidth
                inputProps={{ min: 1, max: 12 }}
                required
                helperText="Example: 1 = every month, 2 = every 2 months"
              />

              <TextField
                label="Notes (Optional)"
                value={scheduleData.notes}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, notes: e.target.value })
                }
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t("cancel", language)}</Button>
            <Button variant="contained" onClick={handleCreateSchedule}>
              {t("create", language)}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for patient details */}
        <Dialog
          open={patientDetailsDialog.open}
          onClose={() => setPatientDetailsDialog({ open: false, patient: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{t("completePatientInformation", language)}</DialogTitle>
          <DialogContent>
            {patientDetailsDialog.patient && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Full Name"
                      value={patientDetailsDialog.patient.fullName || ""}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Employee ID"
                      value={patientDetailsDialog.patient.employeeId || ""}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Email"
                      value={patientDetailsDialog.patient.email || ""}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Phone"
                      value={patientDetailsDialog.patient.phone || "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="National ID"
                      value={patientDetailsDialog.patient.nationalId || "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Department"
                      value={patientDetailsDialog.patient.department || "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Faculty"
                      value={patientDetailsDialog.patient.faculty || "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Gender"
                      value={patientDetailsDialog.patient.gender || "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Date of Birth"
                      value={patientDetailsDialog.patient.dateOfBirth 
                        ? (typeof patientDetailsDialog.patient.dateOfBirth === 'string' 
                            ? patientDetailsDialog.patient.dateOfBirth 
                            : patientDetailsDialog.patient.dateOfBirth.toString())
                        : "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Age"
                      value={patientDetailsDialog.patient.age 
                        ? `${patientDetailsDialog.patient.age} years` 
                        : "Not specified"}
                      fullWidth
                      disabled
                    />
                  </Grid>
                </Grid>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Chronic Diseases
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {patientDetailsDialog.patient.chronicDiseases?.map((disease, idx) => (
                      <Chip
                        key={idx}
                        label={disease}
                        color="error"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>

                {patientDetailsDialog.patient.chronicDocumentPaths && 
                 patientDetailsDialog.patient.chronicDocumentPaths.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Chronic Disease Documents
                    </Typography>
                    <Grid container spacing={2}>
                      {patientDetailsDialog.patient.chronicDocumentPaths.map((docPath, idx) => {
                        const fullUrl = docPath.startsWith("http")
                          ? docPath
                          : `${API_BASE_URL}${docPath}`;
                        return (
                          <Grid item xs={12} sm={6} md={4} key={idx}>
                            <Card elevation={2}>
                              <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <DescriptionIcon sx={{ fontSize: 40, color: "#556B2F" }} />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight="600">
                                      Document {idx + 1}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {docPath.split("/").pop()}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => setDocumentDialog({ open: true, imageUrl: fullUrl })}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    href={fullUrl}
                                    download
                                  >
                                    Download
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPatientDetailsDialog({ open: false, patient: null })}>
              {t("close", language)}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for viewing documents */}
        <Dialog
          open={documentDialog.open}
          onClose={() => setDocumentDialog({ open: false, imageUrl: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "rgba(0, 0, 0, 0.9)",
            },
          }}
        >
          <DialogContent sx={{ p: 0, position: "relative" }}>
            {documentDialog.imageUrl && (
              <Box
                component="img"
                src={documentDialog.imageUrl}
                alt="Chronic Disease Document"
                sx={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: "rgba(0, 0, 0, 0.9)", p: 1 }}>
            <Button
              onClick={() => setDocumentDialog({ open: false, imageUrl: null })}
              sx={{ color: "white" }}
            >
              {t("close", language)}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ChronicPatientsManagement;

