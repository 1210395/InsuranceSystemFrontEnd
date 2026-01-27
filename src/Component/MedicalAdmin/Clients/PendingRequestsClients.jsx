import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import Header from "../MedicalAdminHeader";
import Sidebar from "../MedicalAdminSidebar";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS, API_BASE_URL } from "../../../config/api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../config/translations";

const getUniversityCardSrc = (client) => {
  const imgs = client?.universityCardImages || [];
  const last = imgs[imgs.length - 1];
  return last ? `${API_BASE_URL}${last}?t=${client.updatedAt || Date.now()}` : null;
};

const PendingRequestsClients = () => {
  const { language, isRTL } = useLanguage();
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]); // Store all clients for filtering
const [filterRole, setFilterRole] = useState("INSURANCE_CLIENT");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
const [openFamilyDialog, setOpenFamilyDialog] = useState(false);
const [familyLoading, setFamilyLoading] = useState(false);
const [familyMembers, setFamilyMembers] = useState([]);

  // ✅ جلب البيانات من الباك اند
  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.CLIENTS.LIST);
const filtered = res.data.filter(
  (u) =>
    u.roleRequestStatus === "PENDING" &&
    u.requestedRole?.toUpperCase() === "INSURANCE_CLIENT"
);

        const sorted = filtered.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setAllClients(sorted);
        setClients(sorted);
      } catch (err) {
        console.error("❌ Fetch failed:", err.response?.data || err.message);
      }
    };

    fetchAllRequests();
  }, []);

  // ✅ Color the card based on status
  const getCardColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "#E6F4EA"; // Green light
      case "REJECTED":
        return "#FDECEA"; // Red light
      default:
        return "white"; // Default white
    }
  };

  // ✅ Color the status
  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  // ✅ Handle approve request
  const handleApprove = async (client) => {
    setLoadingId(client.id);
    try {
      await api.patch(`/api/clients/${client.id}/role-requests/approve`);

      // 🟢 Remove approved client from list
      setAllClients((prev) => prev.filter((c) => c.id !== client.id));
      setClients((prev) => prev.filter((c) => c.id !== client.id));

      setSnackbar({
        open: true,
        message: t("requestApprovedFor", language).replace("{name}", client.fullName),
        severity: "success",
      });
    } catch (err) {
      console.error("❌ Approval failed:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: t("approvalFailed", language),
        severity: "error",
      });
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Handle reject request click
  const handleRejectClick = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  // ✅ Filter clients by requested role
 useEffect(() => {
  setClients(
    allClients.filter(
      (client) => client.requestedRole?.toUpperCase() === "INSURANCE_CLIENT"
    )
  );
}, [filterRole, allClients]);

  // ✅ Handle reject request confirmation
  const handleRejectConfirm = async () => {
    setLoadingId(selectedClient.id);
    try {
      await api.patch(
        API_ENDPOINTS.CLIENTS.REJECT(selectedClient.id),
        { reason: rejectReason }
      );

      // 🟢 Remove rejected client from list
      setAllClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
      setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));

      setSnackbar({
        open: true,
        message: t("requestRejectedFor", language).replace("{name}", selectedClient.fullName),
        severity: "error",
      });
    } catch (err) {
      console.error(
        "❌ Reject failed:",
        err.response?.status,
        err.response?.data || err.message
      );
      setSnackbar({
        open: true,
        message:
          err.response?.status === 401
            ? t("unauthorizedLoginAgain", language)
            : t("rejectFailedServerError", language),
        severity: "error",
      });
    } finally {
      setLoadingId(null);
      setOpenDialog(false);
      setRejectReason("");
    }
  };
const fetchClientFamily = async (client) => {
  setSelectedClient(client);
  setOpenFamilyDialog(true);
  setFamilyLoading(true);

  try {
    const res = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.BY_CLIENT(client.id));

    setFamilyMembers(res.data);
  } catch (err) {
    console.error("❌ Failed to fetch family:", err);
    setFamilyMembers([]);
  } finally {
    setFamilyLoading(false);
  }
};

  return (
    <Box sx={{ display: "flex" }} dir={isRTL ? "rtl" : "ltr"}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#FAF8F5",
          minHeight: "100vh",
          marginLeft: isRTL ? 0 : { xs: 0, sm: "72px", md: "240px" },
          marginRight: isRTL ? { xs: 0, sm: "72px", md: "240px" } : 0,
          pt: { xs: "56px", sm: 0 },
          transition: "margin 0.3s ease",
        }}
      >
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#3D4F23", display: "flex", alignItems: "center" }}
          >
            <GroupAddIcon sx={{ mr: isRTL ? 0 : 1, ml: isRTL ? 1 : 0, fontSize: 35, color: "#556B2F" }} />
            {t("clientRoleRequests", language)}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("reviewManageClientRequests", language)}
          </Typography>

          {/* Role Filter */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                color: "#1e293b",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.5px",
              }}
            >
              {t("requestedRoleLabel", language)}
            </Typography>
           <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
  {[
    {
      role: "INSURANCE_CLIENT",
      label: t("insuranceClient", language),
      count: allClients.filter(
        (c) => c.requestedRole?.toUpperCase() === "INSURANCE_CLIENT"
      ).length,
    },
  ].map(({ role, label, count }) => (
    <Chip
      key={role}
      label={`${label} (${count})`}
      onClick={() => setFilterRole(role)}
      variant="filled"
      color="primary"
      sx={{ fontWeight: 600, borderRadius: 2, cursor: "pointer" }}
    />
  ))}
</Stack>
          </Paper>

          {/* Results Count */}
          <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
            {t("showing", language)} <strong>{clients.length}</strong> {clients.length !== 1 ? t("requests", language) : t("request", language)}
            {filterRole !== "ALL" && ` ${t("forRole", language)} ${t("insuranceClient", language)}`}
          </Typography>

          {clients.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("noPendingRequestsFound", language)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterRole !== "ALL"
                  ? t("noPendingRequestsForRole", language)
                  : t("noPendingRoleRequests", language)}
              </Typography>
            </Paper>
          ) : (
            clients.map((client) => (
            <Paper
              key={client.id}
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 4,
                mb: 4,
                borderLeft: `6px solid ${
                  client.roleRequestStatus === "APPROVED"
                    ? "#2e7d32"
                    : client.roleRequestStatus === "REJECTED"
                    ? "#d32f2f"
                    : "#1E8EAB"
                }`,
                backgroundColor: getCardColor(client.roleRequestStatus),
                transition: "0.3s ease-in-out",
              }}
            >
              <Grid container spacing={3}>
              {/* General Info */}
{/* General Info */}
<Grid item xs={12} md={6}>
  <Paper sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, color: "#556B2F" }}>
      {t("generalInformationTitle", language)}
    </Typography>
    <Stack spacing={1}>
      <Typography variant="body2">
        <PersonIcon sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />
        <b>{t("nameLabel", language)}</b> {client.fullName}
      </Typography>

      <Typography variant="body2">
        <EmailIcon sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />
        <b>{t("emailLabel", language)}</b> {client.email}
      </Typography>

      {/* إخفاء الكلية والقسم للجميع إلا العميل */}
      {client.requestedRole === "INSURANCE_CLIENT" && (
        <>
          <Typography variant="body2">
            <b>{t("facultyLabel", language)}</b> {client.faculty}
          </Typography>

          <Typography variant="body2">
            <b>{t("departmentLabel", language)}</b> {client.department}
          </Typography>
        </>
      )}

      <Typography variant="body2">
        <b>{t("employeeIdLabel", language)}</b> {client.employeeId}
      </Typography>

      <Typography variant="body2">
        <b>{t("genderLabel", language)}</b> {client.gender}
      </Typography>

      <Typography variant="body2">
        <b>{t("nationalIdLabel", language)}</b> {client.nationalId}
      </Typography>

      <Typography variant="body2">
        <b>{t("dateOfBirthLabel", language)}</b> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : t("notAvailable", language)}
      </Typography>
    </Stack>
  </Paper>
</Grid>

<Grid item xs={12} md={6}>
  {/* فقط عرض هذا القسم للعميل الذي يمتلك دور INSURANCE_CLIENT */}
  {client.requestedRole === "INSURANCE_CLIENT" && (
    <>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#556B2F" }}>
        {t("chronicDiseasesSection", language)}
      </Typography>
      <Stack spacing={1}>
        {/* عرض الأمراض المزمنة */}
        {client.chronicDiseases && client.chronicDiseases.length > 0 ? (
          client.chronicDiseases.map((disease, index) => (
            <Paper key={index} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              {/* Disease Name */}
              <Typography variant="body2" fontWeight="bold">
                <b>{disease}</b>
              </Typography>

              {/* Disease Document Images */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {client.chronicDocumentPaths && client.chronicDocumentPaths.length > 0 ? (
                  client.chronicDocumentPaths.map((doc, docIndex) => (
                    <Avatar
                      key={docIndex}
                      src={`${API_BASE_URL}${doc}`}
                      alt={`${t("document", language)} ${docIndex + 1}`}
                      variant="rounded"
                      sx={{
                        width: 80,
                        height: 80,
                        cursor: "pointer",
                        border: "1px solid #ddd",
                      }}
                      onClick={() => {
                        setPreviewImage(`${API_BASE_URL}${doc}`);
                        setOpenImageDialog(true); // Show the document in a dialog
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("noDocumentsUploaded", language)}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t("noChronicDiseases", language)}
          </Typography>
        )}
      </Stack>
    </>
  )}
</Grid>

{/* Dialog to display enlarged image */}
<Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)} maxWidth="md">
  <DialogTitle>{t("documentPreview", language)}</DialogTitle>
  <DialogContent dividers>
    {previewImage && (
      <img
        src={previewImage}
        alt={t("documentPreview", language)}
        style={{ width: "100%", height: "auto", borderRadius: "10px" }}
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenImageDialog(false)} color="primary">
      {t("close", language)}
    </Button>
  </DialogActions>
</Dialog>

                
                {/* Contact Info */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#556B2F" }}
                    >
                      {t("contactInfoSection", language)}
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <PhoneIcon sx={{ fontSize: 18, mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0 }} />
                        <b>{t("phoneLabel", language)}</b> {client.phone}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2">
                          <b>{t("statusLabel", language)}</b>
                        </Typography>
                        <Chip
                          label={client.status}
                          color={client.status === "ACTIVE" ? "success" : "warning"}
                          size="small"
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>


                {/* Requested Role */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#556B2F" }}
                    >
                      {t("requestedRoleLabel", language)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={client.requestedRole} color="secondary" />
                    </Box>
                  </Paper>
                </Grid>

                {/* University Card */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#556B2F" }}
                    >
                      {t("universityCardSection", language)}
                    </Typography>

                    {getUniversityCardSrc(client) ? (
                      <Avatar
                        src={getUniversityCardSrc(client)}
                        alt={t("universityCardSection", language)}
                        variant="rounded"
                        sx={{ width: 80, height: 100, cursor: "pointer" }}
                        onClick={() => {
                          setPreviewImage(getUniversityCardSrc(client));
                          setOpenImageDialog(true);
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("noCardUploaded", language)}
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Request Status */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ mb: 1, color: "#556B2F" }}
                    >
                      {t("requestStatusLabel", language)}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={client.roleRequestStatus}
                        color={getStatusColor(client.roleRequestStatus)}
                      />
                    </Box>
                    {client.roleRequestStatus === "REJECTED" && client.rejectReason && (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{ mt: 1, fontStyle: "italic" }}
                      >
                        <b>{t("reasonLabel", language)}</b> {client.rejectReason}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

    {client.roleRequestStatus === "PENDING" && (
  <>
    <Divider sx={{ my: 2 }} />

    <Box sx={{ display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end", gap: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => fetchClientFamily(client)}
      >
        👨‍👩‍👧‍👦 {t("viewFamily", language)}
      </Button>

      <Button
        variant="contained"
        color="success"
        disabled={loadingId === client.id}
        onClick={() => handleApprove(client)}
        startIcon={
          loadingId === client.id ? <CircularProgress size={18} /> : null
        }
      >
        {loadingId === client.id ? t("approving", language) : t("approve", language)}
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => handleRejectClick(client)}
      >
        {t("reject", language)}
      </Button>
    </Box>
  </>
)}

            </Paper>
            ))
          )}
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("rejectRequest", language)}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {t("pleaseProvideReasonRejecting", language)}{" "}
            <strong>{selectedClient?.fullName}</strong>:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={t("reasonLabel", language)}
            type="text"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t("cancel", language)}</Button>
          <Button color="error" variant="contained" onClick={handleRejectConfirm}>
            {t("confirmReject", language)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Preview */}
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>{t("universityCardSection", language)}</DialogTitle>
        <DialogContent dividers>
          {previewImage && (
            <img
              src={previewImage}
              alt={t("universityCardSection", language)}
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)} color="primary">
            {t("close", language)}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
  open={openFamilyDialog}
  onClose={() => setOpenFamilyDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    {t("familyMembersOf", language)} {selectedClient?.fullName}
  </DialogTitle>

  <DialogContent dividers>
    {familyLoading ? (
      <Box textAlign="center">
        <CircularProgress />
      </Box>
    ) : familyMembers.length === 0 ? (
      <Typography color="text.secondary">
        {t("noFamilyMembers", language)}
      </Typography>
    ) : (
      <Stack spacing={2}>
        {familyMembers.map((member) => (
         <Paper key={member.id} sx={{ p: 2, borderRadius: 2 }}>
  <Typography fontWeight="bold">
    {member.fullName}
  </Typography>

  <Typography variant="body2">
    <b>{t("relationLabel", language)}</b> {member.relation}
  </Typography>

  <Typography variant="body2">
    <b>{t("nationalIdLabel", language)}</b> {member.nationalId}
  </Typography>

  {/* ✅ رقم التأمين */}
  <Typography variant="body2">
    <b>{t("insuranceNumberLabel", language)}</b>{" "}
    {member.insuranceNumber || t("notAssigned", language)}
  </Typography>

  <Typography variant="body2">
    <b>{t("dateOfBirthLabel", language)}</b> {member.dateOfBirth}
  </Typography>

  {/* ✅ الحالة */}
  <Chip
    label={member.status}
    color={
      member.status === "APPROVED"
        ? "success"
        : member.status === "REJECTED"
        ? "error"
        : "warning"
    }
    size="small"
    sx={{ mt: 1 }}
  />

  {/* ✅ صور الوثائق */}
  <Divider sx={{ my: 1 }} />

  {member.documentImages && member.documentImages.length > 0 ? (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {member.documentImages.map((imagePath, index) => (
        <Avatar
          key={index}
          src={`${API_BASE_URL}${imagePath}`}
          variant="rounded"
          sx={{
            width: 80,
            height: 80,
            cursor: "pointer",
            border: "1px solid #ddd",
          }}
          onClick={() => {
            setPreviewImage(`${API_BASE_URL}${imagePath}`);
            setOpenImageDialog(true);
          }}
        />
      ))}
    </Stack>
  ) : (
    <Typography variant="body2" color="text.secondary">
      {t("noDocumentsUploaded", language)}
    </Typography>
  )}
</Paper>

        ))}
      </Stack>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenFamilyDialog(false)}>{t("close", language)}</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default PendingRequestsClients;
