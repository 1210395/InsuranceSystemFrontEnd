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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicationIcon from "@mui/icons-material/Medication";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { api } from "../../../utils/apiService";
import { useLanguage } from "../../../context/LanguageContext";

const DoctorMedicineAssignment = () => {
  const { language, isRTL } = useLanguage();

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");

  // Dialog states
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Form states
  const [assignmentForm, setAssignmentForm] = useState({
    doctorId: "",
    medicineId: "",
    specialization: "",
    maxDailyPrescriptions: "",
    maxQuantityPerPrescription: "",
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/doctor-medicines?page=${page}&size=${rowsPerPage}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (filterSpecialization) url += `&specialization=${encodeURIComponent(filterSpecialization)}`;

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
  }, [page, rowsPerPage, searchQuery, filterSpecialization, language]);

  const fetchDoctors = async () => {
    try {
      const data = await api.get("/api/doctor-medicines/doctors");
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await api.get("/api/doctor-medicines/medicines");
      setMedicines(data || []);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const data = await api.get("/api/doctor-medicines/specializations");
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
    fetchMedicines();
    fetchSpecializations();
  }, []);

  // Handlers
  const handleAssign = async () => {
    if (!assignmentForm.doctorId || !assignmentForm.medicineId) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "يرجى اختيار الطبيب والدواء" : "Please select doctor and medicine",
        severity: "warning",
      });
      return;
    }

    try {
      await api.post("/api/doctor-medicines/assign", assignmentForm);
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
    if (!selectedDoctor || selectedMedicines.length === 0) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "يرجى اختيار الطبيب والأدوية" : "Please select doctor and medicines",
        severity: "warning",
      });
      return;
    }

    try {
      const result = await api.post("/api/doctor-medicines/bulk-assign", {
        doctorId: selectedDoctor.id,
        medicineIds: selectedMedicines.map((m) => m.id),
        specialization: selectedDoctor.specialization,
      });
      setSnackbar({
        open: true,
        message: `${language === "ar" ? "تم تعيين" : "Assigned"} ${result.assignedCount} ${language === "ar" ? "دواء" : "medicines"}`,
        severity: "success",
      });
      setOpenBulkDialog(false);
      setSelectedDoctor(null);
      setSelectedMedicines([]);
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
      await api.delete(`/api/doctor-medicines/revoke/${assignmentId}`);
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
      await api.patch(`/api/doctor-medicines/${editingAssignment.id}`, {
        maxDailyPrescriptions: editingAssignment.maxDailyPrescriptions,
        maxQuantityPerPrescription: editingAssignment.maxQuantityPerPrescription,
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
      medicineId: "",
      specialization: "",
      maxDailyPrescriptions: "",
      maxQuantityPerPrescription: "",
      notes: "",
    });
  };

  const handleSearch = () => {
    setPage(0);
    fetchAssignments();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f4f6f9",
          minHeight: "100vh",
          marginLeft: "240px",
        }}
      >
        <Header />

        <Box sx={{ p: 3 }} dir={isRTL ? "rtl" : "ltr"}>
          {/* Title and Actions */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: "#120460" }}>
              <LocalHospitalIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              {language === "ar" ? "تعيين الأدوية للأطباء" : "Doctor Medicine Assignments"}
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
                {language === "ar" ? "تعيين دواء" : "Assign Medicine"}
              </Button>
            </Box>
          </Box>

          {/* Search and Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={language === "ar" ? "بحث بالطبيب أو الدواء..." : "Search by doctor or medicine..."}
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
                          {language === "ar" ? "الدواء" : "Medicine"}
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
                          <TableCell colSpan={6} align="center">
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
                                <MedicationIcon color="success" fontSize="small" />
                                <Box>
                                  <Typography variant="body2" fontWeight="bold">
                                    {assignment.medicineName}
                                  </Typography>
                                  {assignment.medicineGenericName && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignment.medicineGenericName}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {assignment.maxDailyPrescriptions && (
                                <Chip
                                  label={`${language === "ar" ? "يومي:" : "Daily:"} ${assignment.maxDailyPrescriptions}`}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )}
                              {assignment.maxQuantityPerPrescription && (
                                <Chip
                                  label={`${language === "ar" ? "كمية:" : "Qty:"} ${assignment.maxQuantityPerPrescription}`}
                                  size="small"
                                  sx={{ mb: 0.5 }}
                                />
                              )}
                              {!assignment.maxDailyPrescriptions && !assignment.maxQuantityPerPrescription && (
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
          {language === "ar" ? "تعيين دواء لطبيب" : "Assign Medicine to Doctor"}
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  options={medicines}
                  getOptionLabel={(option) => `${option.drugName} (${option.genericName || option.type || ""})`}
                  value={medicines.find((m) => m.id === assignmentForm.medicineId) || null}
                  onChange={(e, newValue) => {
                    setAssignmentForm({
                      ...assignmentForm,
                      medicineId: newValue?.id || "",
                    });
                  }}
                  sx={{ minWidth: 400 }}
                  ListboxProps={{
                    sx: { maxHeight: 300 }
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight="bold">{option.drugName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.genericName || option.type || ""}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={language === "ar" ? "الدواء" : "Medicine"} />
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label={language === "ar" ? "الحد اليومي" : "Max Daily Prescriptions"}
                value={assignmentForm.maxDailyPrescriptions}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, maxDailyPrescriptions: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label={language === "ar" ? "الحد الأقصى للكمية" : "Max Quantity"}
                value={assignmentForm.maxQuantityPerPrescription}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, maxQuantityPerPrescription: e.target.value })
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
          {language === "ar" ? "تعيين أدوية متعددة لطبيب" : "Bulk Assign Medicines to Doctor"}
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
              <Autocomplete
                multiple
                options={medicines}
                getOptionLabel={(option) => `${option.drugName} (${option.genericName || option.type || ""})`}
                value={selectedMedicines}
                onChange={(e, newValue) => setSelectedMedicines(newValue)}
                disableCloseOnSelect
                sx={{ minWidth: 400 }}
                ListboxProps={{
                  sx: { maxHeight: 300 }
                }}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight="bold">{option.drugName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.genericName || option.type || ""}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={language === "ar" ? "اختر الأدوية" : "Select Medicines"}
                    placeholder={language === "ar" ? "اختر..." : "Select..."}
                  />
                )}
              />
            </Grid>
            {selectedMedicines.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  {language === "ar" ? "تم اختيار" : "Selected"}: {selectedMedicines.length}{" "}
                  {language === "ar" ? "دواء" : "medicines"}
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
            disabled={!selectedDoctor || selectedMedicines.length === 0}
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
                  <strong>{language === "ar" ? "الدواء:" : "Medicine:"}</strong> {editingAssignment.medicineName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={language === "ar" ? "الحد اليومي" : "Max Daily Prescriptions"}
                  value={editingAssignment.maxDailyPrescriptions || ""}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      maxDailyPrescriptions: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={language === "ar" ? "الحد الأقصى للكمية" : "Max Quantity"}
                  value={editingAssignment.maxQuantityPerPrescription || ""}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      maxQuantityPerPrescription: e.target.value ? parseInt(e.target.value) : null,
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

export default DoctorMedicineAssignment;
