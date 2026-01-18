import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  InputAdornment,
  Checkbox,
  Toolbar,
  Tooltip,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import MedicationIcon from "@mui/icons-material/Medication";
import BiotechIcon from "@mui/icons-material/Biotech";
import ScannerIcon from "@mui/icons-material/Scanner";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Sidebar from "../Sidebar";
import api from "../../../utils/apiService";
import { useLanguage } from "../../../context/LanguageContext";

const COVERAGE_STATUS = {
  COVERED: { label: "Covered", labelAr: "مغطى", color: "success" },
  REQUIRES_APPROVAL: { label: "Requires Approval", labelAr: "يحتاج موافقة", color: "warning" },
  NOT_COVERED: { label: "Not Covered", labelAr: "غير مغطى", color: "error" },
};

const TABS = [
  { id: "medicines", label: "Medicines", labelAr: "الأدوية", icon: MedicationIcon, endpoint: "/api/coverage-management/medicines" },
  { id: "lab-tests", label: "Lab Tests", labelAr: "الفحوصات", icon: BiotechIcon, endpoint: "/api/coverage-management/lab-tests" },
  { id: "radiology", label: "Radiology", labelAr: "الأشعة", icon: ScannerIcon, endpoint: "/api/coverage-management/radiology" },
  { id: "procedures", label: "Procedures", labelAr: "الإجراءات", icon: AssignmentIcon, endpoint: "/api/coverage-management/procedures" },
];

const CoverageManagement = () => {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [coveragePercentages, setCoveragePercentages] = useState({});
  const [bulkPercentage, setBulkPercentage] = useState(100);

  const currentTab = TABS[activeTab];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: rowsPerPage.toString(),
      });

      if (search) params.append("search", search);
      if (filterStatus) params.append("coverageStatus", filterStatus);

      // api.get returns response.data directly
      const responseData = await api.get(`${currentTab.endpoint}?${params}`);
      setData(responseData.content || []);
      setTotalElements(responseData.totalElements || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: language === "ar" ? "خطأ في جلب البيانات" : "Error fetching data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [currentTab.endpoint, page, rowsPerPage, search, filterStatus, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(0);
    setSelected([]);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearch("");
    setFilterStatus("");
  };

  const handleCoverageChange = async (itemId, newStatus, percentage = null) => {
    try {
      const requestBody = {
        coverageStatus: newStatus,
      };

      if (newStatus === "COVERED" && percentage !== null) {
        requestBody.coveragePercentage = percentage;
      }

      await api.patch(`${currentTab.endpoint}/${itemId}/coverage`, requestBody);

      setData((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                coverageStatus: newStatus,
                coveragePercentage: newStatus === "COVERED" ? (percentage ?? item.coveragePercentage ?? 100) : 0
              }
            : item
        )
      );

      setSnackbar({
        open: true,
        message: language === "ar" ? "تم تحديث حالة التغطية" : "Coverage status updated",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "خطأ في تحديث الحالة" : "Error updating status",
        severity: "error",
      });
    }
  };

  const handlePercentageChange = (itemId, percentage) => {
    const value = Math.max(0, Math.min(100, parseInt(percentage) || 0));
    setCoveragePercentages(prev => ({ ...prev, [itemId]: value }));
  };

  const handlePercentageBlur = async (itemId, currentStatus) => {
    const percentage = coveragePercentages[itemId];
    if (percentage !== undefined && currentStatus === "COVERED") {
      await handleCoverageChange(itemId, currentStatus, percentage);
      setCoveragePercentages(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  const handleBulkUpdate = async (newStatus, percentage = null) => {
    if (selected.length === 0) return;

    try {
      const requestBody = {
        itemType: currentTab.id,
        ids: selected,
        coverageStatus: newStatus,
      };

      if (newStatus === "COVERED" && percentage !== null) {
        requestBody.coveragePercentage = percentage;
      }

      await api.post("/api/coverage-management/bulk-update", requestBody);

      setSelected([]);
      fetchData();

      setSnackbar({
        open: true,
        message: language === "ar" ? `تم تحديث ${selected.length} عنصر` : `Updated ${selected.length} items`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "خطأ في التحديث الجماعي" : "Error in bulk update",
        severity: "error",
      });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(data.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelected((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleExport = async (format) => {
    setExportMenuAnchor(null);
    try {
      const endpoint = currentTab.id === "medicines" ? "medicines" :
                       currentTab.id === "lab-tests" ? "lab-tests" :
                       currentTab.id === "radiology" ? "radiology" : "procedures";

      // api.download returns the blob directly
      const blob = await api.download(`/api/export/${endpoint}/${format}`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${currentTab.id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: language === "ar" ? "تم تصدير الملف" : "File exported successfully",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: language === "ar" ? "خطأ في التصدير" : "Error exporting file",
        severity: "error",
      });
    }
  };

  const getItemName = (item) => {
    if (currentTab.id === "medicines") return item.drugName;
    if (currentTab.id === "procedures") return item.procedureName;
    return item.testName;
  };

  const renderTableHeaders = () => {
    if (currentTab.id === "medicines") {
      return (
        <>
          <TableCell>{language === "ar" ? "اسم الدواء" : "Drug Name"}</TableCell>
          <TableCell>{language === "ar" ? "الاسم العلمي" : "Generic Name"}</TableCell>
          <TableCell>{language === "ar" ? "السعر" : "Price"}</TableCell>
          <TableCell>{language === "ar" ? "حالة التغطية" : "Coverage Status"}</TableCell>
          <TableCell>{language === "ar" ? "نسبة التغطية %" : "Coverage %"}</TableCell>
        </>
      );
    }

    if (currentTab.id === "procedures") {
      return (
        <>
          <TableCell>{language === "ar" ? "اسم الإجراء" : "Procedure Name"}</TableCell>
          <TableCell>{language === "ar" ? "الفئة" : "Category"}</TableCell>
          <TableCell>{language === "ar" ? "السعر" : "Price"}</TableCell>
          <TableCell>{language === "ar" ? "حالة التغطية" : "Coverage Status"}</TableCell>
          <TableCell>{language === "ar" ? "نسبة التغطية %" : "Coverage %"}</TableCell>
        </>
      );
    }

    return (
      <>
        <TableCell>{language === "ar" ? "اسم الفحص" : "Test Name"}</TableCell>
        <TableCell>{language === "ar" ? "الفئة" : "Category"}</TableCell>
        <TableCell>{language === "ar" ? "حالة التغطية" : "Coverage Status"}</TableCell>
        <TableCell>{language === "ar" ? "نسبة التغطية %" : "Coverage %"}</TableCell>
      </>
    );
  };

  const renderCoveragePercentageCell = (item) => {
    const isCovered = item.coverageStatus === "COVERED";
    const currentPercentage = coveragePercentages[item.id] ?? item.coveragePercentage ?? 100;

    return (
      <TableCell>
        {isCovered ? (
          <TextField
            size="small"
            type="number"
            value={currentPercentage}
            onChange={(e) => handlePercentageChange(item.id, e.target.value)}
            onBlur={() => handlePercentageBlur(item.id, item.coverageStatus)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePercentageBlur(item.id, item.coverageStatus);
              }
            }}
            inputProps={{ min: 0, max: 100, style: { textAlign: "center" } }}
            sx={{ width: 120, minWidth: 120 }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )}
      </TableCell>
    );
  };

  const renderTableRow = (item) => {
    const isSelected = selected.includes(item.id);

    if (currentTab.id === "medicines") {
      return (
        <TableRow key={item.id} hover selected={isSelected}>
          <TableCell padding="checkbox">
            <Checkbox checked={isSelected} onChange={() => handleSelectItem(item.id)} />
          </TableCell>
          <TableCell>{item.drugName}</TableCell>
          <TableCell>{item.genericName || "-"}</TableCell>
          <TableCell>{item.price ? `${item.price} NIS` : "-"}</TableCell>
          <TableCell>
            <Select
              size="small"
              value={item.coverageStatus || "NOT_COVERED"}
              onChange={(e) => {
                const newStatus = e.target.value;
                const percentage = newStatus === "COVERED" ? 100 : null;
                handleCoverageChange(item.id, newStatus, percentage);
              }}
              sx={{ minWidth: 140 }}
            >
              {Object.entries(COVERAGE_STATUS).map(([key, val]) => (
                <MenuItem key={key} value={key}>
                  <Chip
                    label={language === "ar" ? val.labelAr : val.label}
                    color={val.color}
                    size="small"
                  />
                </MenuItem>
              ))}
            </Select>
          </TableCell>
          {renderCoveragePercentageCell(item)}
        </TableRow>
      );
    }

    if (currentTab.id === "procedures") {
      return (
        <TableRow key={item.id} hover selected={isSelected}>
          <TableCell padding="checkbox">
            <Checkbox checked={isSelected} onChange={() => handleSelectItem(item.id)} />
          </TableCell>
          <TableCell>{item.procedureName}</TableCell>
          <TableCell>{item.category || "-"}</TableCell>
          <TableCell>{item.price ? `${item.price} NIS` : "-"}</TableCell>
          <TableCell>
            <Select
              size="small"
              value={item.coverageStatus || "NOT_COVERED"}
              onChange={(e) => {
                const newStatus = e.target.value;
                const percentage = newStatus === "COVERED" ? 100 : null;
                handleCoverageChange(item.id, newStatus, percentage);
              }}
              sx={{ minWidth: 140 }}
            >
              {Object.entries(COVERAGE_STATUS).map(([key, val]) => (
                <MenuItem key={key} value={key}>
                  <Chip
                    label={language === "ar" ? val.labelAr : val.label}
                    color={val.color}
                    size="small"
                  />
                </MenuItem>
              ))}
            </Select>
          </TableCell>
          {renderCoveragePercentageCell(item)}
        </TableRow>
      );
    }

    return (
      <TableRow key={item.id} hover selected={isSelected}>
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={() => handleSelectItem(item.id)} />
        </TableCell>
        <TableCell>{item.testName}</TableCell>
        <TableCell>{item.category || "-"}</TableCell>
        <TableCell>
          <Select
            size="small"
            value={item.coverageStatus || "NOT_COVERED"}
            onChange={(e) => {
              const newStatus = e.target.value;
              const percentage = newStatus === "COVERED" ? 100 : null;
              handleCoverageChange(item.id, newStatus, percentage);
            }}
            sx={{ minWidth: 140 }}
          >
            {Object.entries(COVERAGE_STATUS).map(([key, val]) => (
              <MenuItem key={key} value={key}>
                <Chip
                  label={language === "ar" ? val.labelAr : val.label}
                  color={val.color}
                  size="small"
                />
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        {renderCoveragePercentageCell(item)}
      </TableRow>
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
            {language === "ar" ? "إدارة التغطية" : "Coverage Management"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {language === "ar"
              ? "إدارة حالة التغطية للأدوية والفحوصات والأشعة والإجراءات الطبية."
              : "Manage coverage status for medicines, tests, radiology, and medical procedures."}
          </Typography>
        </Paper>

        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.id}
                  icon={<Icon />}
                  iconPosition="start"
                  label={language === "ar" ? tab.labelAr : tab.label}
                />
              );
            })}
          </Tabs>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              size="small"
              placeholder={language === "ar" ? "بحث..." : "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{language === "ar" ? "فلترة بالحالة" : "Filter by Status"}</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label={language === "ar" ? "فلترة بالحالة" : "Filter by Status"}
              >
                <MenuItem value="">{language === "ar" ? "الكل" : "All"}</MenuItem>
                {Object.entries(COVERAGE_STATUS).map(([key, val]) => (
                  <MenuItem key={key} value={key}>
                    {language === "ar" ? val.labelAr : val.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            >
              {language === "ar" ? "تصدير" : "Export"}
            </Button>

            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={() => setExportMenuAnchor(null)}
            >
              <MenuItem onClick={() => handleExport("excel")}>
                {language === "ar" ? "تصدير إلى Excel" : "Export to Excel"}
              </MenuItem>
              <MenuItem onClick={() => handleExport("pdf")}>
                {language === "ar" ? "تصدير إلى PDF" : "Export to PDF"}
              </MenuItem>
            </Menu>
          </Box>
        </Paper>

        {selected.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.light" }}>
            <Toolbar sx={{ pl: 0, pr: 0, flexWrap: "wrap", gap: 1 }}>
              <Typography sx={{ flex: 1, color: "white", minWidth: 120 }}>
                {language === "ar"
                  ? `تم تحديد ${selected.length} عنصر`
                  : `${selected.length} selected`}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={bulkPercentage}
                  onChange={(e) => setBulkPercentage(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  inputProps={{ min: 0, max: 100, style: { textAlign: "center" } }}
                  sx={{
                    width: 120,
                    minWidth: 120,
                    bgcolor: "white",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": { bgcolor: "white" }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
                <Tooltip title={language === "ar" ? "تحديد كمغطى" : "Set as Covered"}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleBulkUpdate("COVERED", bulkPercentage)}
                  >
                    {language === "ar" ? "مغطى" : "Covered"}
                  </Button>
                </Tooltip>
              </Box>

              <Tooltip title={language === "ar" ? "يحتاج موافقة" : "Requires Approval"}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleBulkUpdate("REQUIRES_APPROVAL")}
                >
                  {language === "ar" ? "يحتاج موافقة" : "Needs Approval"}
                </Button>
              </Tooltip>

              <Tooltip title={language === "ar" ? "غير مغطى" : "Not Covered"}>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleBulkUpdate("NOT_COVERED")}
                >
                  {language === "ar" ? "غير مغطى" : "Not Covered"}
                </Button>
              </Tooltip>
            </Toolbar>
          </Paper>
        )}

        <Paper>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < data.length}
                          checked={data.length > 0 && selected.length === data.length}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      {renderTableHeaders()}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            {language === "ar" ? "لا توجد بيانات" : "No data found"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map(renderTableRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={totalElements}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage={language === "ar" ? "صفوف في الصفحة:" : "Rows per page:"}
              />
            </>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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

export default CoverageManagement;
