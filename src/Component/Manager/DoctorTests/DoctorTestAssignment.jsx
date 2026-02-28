import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete,
  Checkbox,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BiotechIcon from "@mui/icons-material/Biotech";
import ScannerIcon from "@mui/icons-material/Scanner";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { api } from "../../../utils/apiService";
import { useLanguage } from "../../../context/LanguageContext";

const DoctorTestAssignment = () => {
  const { language, isRTL } = useLanguage();

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [filterTestType, setFilterTestType] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTests, setSelectedTests] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    doctorId: "",
    testId: "",
    testType: "",
    specialization: "",
    maxDailyRequests: "",
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const testTypes = [
    { id: "LAB", label: language === "ar" ? "فحوصات مخبرية" : "Lab Tests", icon: BiotechIcon },
    { id: "RADIOLOGY", label: language === "ar" ? "أشعة" : "Radiology", icon: ScannerIcon },
  ];

  const currentTestType = activeTab === 0 ? "" : testTypes[activeTab - 1]?.id || "";

  // Fetch data
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/doctor-tests?page=${page}&size=${rowsPerPage}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterSpecialization) url += `&specialization=${encodeURIComponent(filterSpecialization)}`;
      if (currentTestType) url += `&testType=${encodeURIComponent(currentTestType)}`;

      const data = await api.get(url);
      setAssignments(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setSnackbar({
        open: true,
        message: language === "ar" ? "فشل تحميل البيانات" : "Failed to load data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, filterSpecialization, currentTestType, language]);

  const fetchDoctors = async () => {
    try {
      const data = await api.get("/api/doctor-tests/doctors");
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchTests = async (testType = "") => {
    try {
      let url = "/api/doctor-tests/tests";
      if (testType) url += `?testType=${testType}`;
      const data = await api.get(url);
      setTests(data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const data = await api.get("/api/doctor-tests/specializations");
      setSpecializations(data || []);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    fetchDoctors();
    fetchTests();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFilterSpecialization("");
    setSearchQuery("");
  };

  const handleAssign = async () => {
    if (!assignmentForm.doctorId || !assignmentForm.testId) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "يرجى اختيار الطبيب والفحص" : "Please select doctor and test",
        severity: "warning",
      });
      return;
    }

    try {
      await api.post("/api/doctor-tests/assign", assignmentForm);
      setSnackbar({
        open: true,
        message: language === "ar" ? "تم التعيين بنجاح" : "Assignment successful",
        severity: "success",
      });
      setOpenAssignDialog(false);
      resetForm();
      fetchAssignments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || (language === "ar" ? "فشل التعيين" : "Assignment failed"),
        severity: "error",
      });
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedDoctor || selectedTests.length === 0) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "يرجى اختيار الطبيب والفحوصات" : "Please select doctor and tests",
        severity: "warning",
      });
      return;
    }

    try {
      const result = await api.post("/api/doctor-tests/bulk-assign", {
        doctorId: selectedDoctor.id,
        testIds: selectedTests.map((t) => t.id),
        testType: filterTestType || currentTestType,
        specialization: selectedDoctor.specialization,
      });
      setSnackbar({
        open: true,
        message: `${language === "ar" ? "تم تعيين" : "Assigned"} ${result.assignedCount} ${language === "ar" ? "فحص" : "tests"}`,
        severity: "success",
      });
      setOpenBulkDialog(false);
      setSelectedDoctor(null);
      setSelectedTests([]);
      fetchAssignments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || (language === "ar" ? "فشل التعيين" : "Assignment failed"),
        severity: "error",
      });
    }
  };

  const handleRevoke = async (assignmentId) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من إلغاء هذا التعيين؟" : "Are you sure you want to revoke this assignment?")) {
      return;
    }

    try {
      await api.delete(`/api/doctor-tests/revoke/${assignmentId}`);
      setSnackbar({
        open: true,
        message: language === "ar" ? "تم إلغاء التعيين" : "Assignment revoked",
        severity: "success",
      });
      fetchAssignments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || (language === "ar" ? "فشل الإلغاء" : "Revoke failed"),
        severity: "error",
      });
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;

    try {
      await api.patch(`/api/doctor-tests/${editingAssignment.id}`, {
        maxDailyRequests: editingAssignment.maxDailyRequests,
        notes: editingAssignment.notes,
      });
      setSnackbar({
        open: true,
        message: language === "ar" ? "تم التحديث بنجاح" : "Update successful",
        severity: "success",
      });
      setOpenEditDialog(false);
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || (language === "ar" ? "فشل التحديث" : "Update failed"),
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setAssignmentForm({
      doctorId: "",
      testId: "",
      testType: "",
      specialization: "",
      maxDailyRequests: "",
      notes: "",
    });
  };

  const handleSearch = () => {
    setPage(0);
    fetchAssignments();
  };

  const getTestTypeIcon = (testType) => {
    if (testType === "LAB") return <BiotechIcon color="primary" fontSize="small" />;
    if (testType === "RADIOLOGY") return <ScannerIcon color="secondary" fontSize="small" />;
    return <BiotechIcon color="action" fontSize="small" />;
  };

  const getTestTypeColor = (testType) => {
    if (testType === "LAB") return "primary";
    if (testType === "RADIOLOGY") return "secondary";
    return "default";
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
        }}
      >
        <Header />

        <Box sx={{ p: 3 }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Title and Actions */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#120460" }}>
              <LocalHospitalIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {language === "ar" ? "تعيين الفحوصات للأطباء" : "Doctor Test Assignments"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenBulkDialog(true)}
              >
                {language === "ar" ? "تعيين متعدد" : "Bulk Assign"}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAssignDialog(true)}
              >
                {language === "ar" ? "تعيين فحص" : "Assign Test"}
              </Button>
            </Box>
          </Box>

          {/* Tabs for Test Type */}
          <Paper sx={{ mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
              <Tab label={language === "ar" ? "الكل" : "All"} />
              <Tab
                icon={<BiotechIcon />}
                iconPosition="start"
                label={language === "ar" ? "فحوصات مخبرية" : "Lab Tests"}
              />
              <Tab
                icon={<ScannerIcon />}
                iconPosition="start"
                label={language === "ar" ? "أشعة" : "Radiology"}
              />
            </Tabs>
          </Paper>

          {/* Search and Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={language === "ar" ? "بحث بالطبيب أو الفحص..." : "Search by doctor or test..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{language === "ar" ? "التخصص" : "Specialization"}</InputLabel>
                  <Select
                    value={filterSpecialization}
                    label={language === "ar" ? "التخصص" : "Specialization"}
                    onChange={(e) => {
                      setFilterSpecialization(e.target.value);
                      setPage(0);
                    }}
                    sx={{ minWidth: 250 }}
                  >
                    <MenuItem value="">{language === "ar" ? "الكل" : "All"}</MenuItem>
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="outlined" startIcon={<FilterListIcon />} onClick={handleSearch}>
                  {language === "ar" ? "بحث" : "Search"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Assignments Table */}
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "الطبيب" : "Doctor"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "التخصص" : "Specialization"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "الفحص" : "Test"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "النوع" : "Type"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "القيود" : "Restrictions"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "تاريخ التعيين" : "Assigned Date"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          {language === "ar" ? "الإجراءات" : "Actions"}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary">
                              {language === "ar" ? "لا توجد تعيينات" : "No assignments found"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment) => (
                          <TableRow key={assignment.id} hover>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LocalHospitalIcon color="primary" fontSize="small" />
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {assignment.doctorName}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={assignment.specialization || assignment.doctorSpecialization || "-"}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {getTestTypeIcon(assignment.testType)}
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {assignment.testName}
                                  </Typography>
                                  {assignment.testCategory && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignment.testCategory}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={assignment.testType === "LAB" ? (language === "ar" ? "مخبري" : "Lab") : (language === "ar" ? "أشعة" : "Radiology")}
                                size="small"
                                color={getTestTypeColor(assignment.testType)}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {assignment.maxDailyRequests && (
                                <Chip
                                  label={`${language === "ar" ? "يومي:" : "Daily:"} ${assignment.maxDailyRequests}`}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )}
                              {!assignment.maxDailyRequests && (
                                <Typography variant="caption" color="text.secondary">
                                  {language === "ar" ? "بدون قيود" : "No restrictions"}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {assignment.assignedAt
                                ? new Date(assignment.assignedAt).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={language === "ar" ? "تعديل" : "Edit"}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setEditingAssignment(assignment);
                                    setOpenEditDialog(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={language === "ar" ? "إلغاء" : "Revoke"}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRevoke(assignment.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={totalElements}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  labelRowsPerPage={language === "ar" ? "صفوف لكل صفحة:" : "Rows per page:"}
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Single Assignment Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {language === "ar" ? "تعيين فحص لطبيب" : "Assign Test to Doctor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  options={doctors}
                  getOptionLabel={(option) => `${option.fullName} - ${option.specialization || ""}`}
                  value={doctors.find((d) => d.id === assignmentForm.doctorId) || null}
                  onChange={(e, newValue) => {
                    setAssignmentForm({
                      ...assignmentForm,
                      doctorId: newValue?.id || "",
                      specialization: newValue?.specialization || "",
                    });
                  }}
                  sx={{ minWidth: 400 }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight="bold">{option.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.specialization || "General Practice"}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={language === "ar" ? "الطبيب" : "Doctor"} />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{language === "ar" ? "نوع الفحص" : "Test Type"}</InputLabel>
                <Select
                  value={assignmentForm.testType}
                  label={language === "ar" ? "نوع الفحص" : "Test Type"}
                  onChange={(e) => {
                    setAssignmentForm({ ...assignmentForm, testType: e.target.value, testId: "" });
                    fetchTests(e.target.value);
                  }}
                >
                  <MenuItem value="">{language === "ar" ? "الكل" : "All"}</MenuItem>
                  <MenuItem value="LAB">{language === "ar" ? "فحوصات مخبرية" : "Lab Tests"}</MenuItem>
                  <MenuItem value="RADIOLOGY">{language === "ar" ? "أشعة" : "Radiology"}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Autocomplete
                  options={tests.filter(t => !assignmentForm.testType || t.category === assignmentForm.testType)}
                  getOptionLabel={(option) => `${option.testName} (${option.category || ""})`}
                  value={tests.find((t) => t.id === assignmentForm.testId) || null}
                  onChange={(e, newValue) => {
                    setAssignmentForm({
                      ...assignmentForm,
                      testId: newValue?.id || "",
                      testType: newValue?.category || assignmentForm.testType,
                    });
                  }}
                  sx={{ minWidth: 300 }}
                  ListboxProps={{
                    sx: { maxHeight: 300 }
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight="bold">{option.testName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.category || ""}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={language === "ar" ? "الفحص" : "Test"} />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label={language === "ar" ? "الحد اليومي للطلبات" : "Max Daily Requests"}
                value={assignmentForm.maxDailyRequests}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, maxDailyRequests: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={language === "ar" ? "ملاحظات" : "Notes"}
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button variant="contained" onClick={handleAssign}>
            {language === "ar" ? "تعيين" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {language === "ar" ? "تعيين فحوصات متعددة لطبيب" : "Bulk Assign Tests to Doctor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={doctors}
                getOptionLabel={(option) => `${option.fullName} - ${option.specialization || ""}`}
                value={selectedDoctor}
                onChange={(e, newValue) => setSelectedDoctor(newValue)}
                sx={{ minWidth: 400 }}
                renderInput={(params) => (
                  <TextField {...params} label={language === "ar" ? "اختر الطبيب" : "Select Doctor"} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{language === "ar" ? "نوع الفحص" : "Test Type"}</InputLabel>
                <Select
                  value={filterTestType}
                  label={language === "ar" ? "نوع الفحص" : "Test Type"}
                  onChange={(e) => {
                    setFilterTestType(e.target.value);
                    setSelectedTests([]);
                    fetchTests(e.target.value);
                  }}
                >
                  <MenuItem value="">{language === "ar" ? "الكل" : "All"}</MenuItem>
                  <MenuItem value="LAB">{language === "ar" ? "فحوصات مخبرية" : "Lab Tests"}</MenuItem>
                  <MenuItem value="RADIOLOGY">{language === "ar" ? "أشعة" : "Radiology"}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tests.filter(t => !filterTestType || t.category === filterTestType)}
                getOptionLabel={(option) => `${option.testName} (${option.category || ""})`}
                value={selectedTests}
                onChange={(e, newValue) => setSelectedTests(newValue)}
                disableCloseOnSelect
                sx={{ minWidth: 400 }}
                ListboxProps={{
                  sx: { maxHeight: 300 }
                }}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight="bold">{option.testName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category || ""}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={language === "ar" ? "اختر الفحوصات" : "Select Tests"}
                    placeholder={language === "ar" ? "اختر..." : "Select..."}
                  />
                )}
              />
            </Grid>
            {selectedTests.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {language === "ar" ? "تم اختيار" : "Selected"}: {selectedTests.length}{" "}
                  {language === "ar" ? "فحص" : "tests"}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkAssign}
            disabled={!selectedDoctor || selectedTests.length === 0}
          >
            {language === "ar" ? "تعيين الكل" : "Assign All"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {language === "ar" ? "تعديل التعيين" : "Edit Assignment"}
        </DialogTitle>
        <DialogContent dividers>
          {editingAssignment && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{language === "ar" ? "الطبيب:" : "Doctor:"}</strong> {editingAssignment.doctorName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{language === "ar" ? "الفحص:" : "Test:"}</strong> {editingAssignment.testName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>{language === "ar" ? "النوع:" : "Type:"}</strong> {editingAssignment.testType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label={language === "ar" ? "الحد اليومي للطلبات" : "Max Daily Requests"}
                  value={editingAssignment.maxDailyRequests || ""}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      maxDailyRequests: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={language === "ar" ? "ملاحظات" : "Notes"}
                  value={editingAssignment.notes || ""}
                  onChange={(e) =>
                    setEditingAssignment({ ...editingAssignment, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button variant="contained" onClick={handleUpdateAssignment}>
            {language === "ar" ? "حفظ" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorTestAssignment;
