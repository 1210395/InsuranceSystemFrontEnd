// src/Component/Radiology/RadiologyRequestList.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PersonIcon from "@mui/icons-material/Person";
import { api, getToken } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import RadiologyRequestCard from "./RadiologyRequestCard";
import RadiologyRequestDialogs from "./RadiologyRequestDialogs";
import PatientSearchBar from "../Shared/PatientSearchBar";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const RadiologyRequestList = ({ requests, userInfo, onSetClaimData, onSubmitClaim, onUploaded }) => {
  const { language, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("employeeId");
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [, setEmployeeIdToNameMap] = useState({});
  const [nameToEmployeeIdMap, setNameToEmployeeIdMap] = useState({}); // Map patient names to employee IDs
  const [clientInfoMap, setClientInfoMap] = useState({}); // Map member names to client info (age, gender)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    icon: null,
  });
  const [acceptDialog, setAcceptDialog] = useState({
    open: false,
    request: null,
  });
  const [uploadDialog, setUploadDialog] = useState({
    open: false,
    request: null,
  });
  const [imageDialog, setImageDialog] = useState({
    open: false,
    imageUrl: null,
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [enteredPrice, setEnteredPrice] = useState("");

  // Family member filter state
  const [familyMemberFilter, setFamilyMemberFilter] = useState("all"); // "all", "main", or family member name

  // ✅ استخدام useRef لحفظ claimData بشكل موثوق (لا يتأثر بـ re-renders)
  const claimDataRef = useRef(null);
  // ✅ منع الاستدعاء المزدوج للـ claim
  const isSubmittingClaimRef = useRef(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Calculate age from date of birth
  const calculateAgeFromDOB = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? `${age} years` : null;
    } catch {
      return null;
    }
  };

  // Get family member info from DTO (extracted by mapper) or parse from notes field
  const getFamilyMemberInfo = (request) => {
    // First, try to use DTO fields (if mapper has extracted them)
    if (request.isFamilyMember === true && request.familyMemberName) {
      const info = {
        name: request.familyMemberName,
        relation: request.familyMemberRelation,
        insuranceNumber: request.familyMemberInsuranceNumber,
        age: request.familyMemberAge || null,
        gender: request.familyMemberGender || null,
        nationalId: request.familyMemberNationalId || null,
      };
      console.log("Using DTO fields:", info);
      return info;
    }
    
    // Fallback: Parse from notes field (for backward compatibility or if mapper hasn't extracted yet)
    if (request.notes) {
      // Backend format: "\nFamily Member: [Name] ([Relation]) - Insurance: [Insurance Number] - Age: [Age] - Gender: [Gender]"
      let familyMemberPattern = /Family\s+Member:\s*([^-]+?)\s*\(([^)]+)\)\s*-\s*Insurance:\s*([^-]+?)\s*-\s*Age:\s*([^-]+?)\s*-\s*Gender:\s*([^\n\r]+?)(?:\n|$|$)/i;
      let match = request.notes.match(familyMemberPattern);
      
      if (match && match.length >= 6) {
        let age = match[4] ? match[4].trim() : null;
        let gender = match[5] ? match[5].trim() : null;
        
        // Handle "N/A" or empty values
        if (!age || age === "N/A" || age === "N/A years" || age === "null" || age === "") age = null;
        if (!gender || gender === "N/A" || gender === "null" || gender === "") gender = null;
        
        const info = {
          name: match[1].trim(),
          relation: match[2].trim(),
          insuranceNumber: match[3].trim(),
          age: age,
          gender: gender,
        };
        console.log("✅ Parsed family member info (with age/gender):", info);
        return info;
      }
      
      // Pattern 2: Without age and gender (old format)
      familyMemberPattern = /Family\s+Member:\s*([^-]+?)\s*\(([^)]+)\)\s*-\s*Insurance:\s*([^\n\r]+?)(?:\n|$)/i;
      match = request.notes.match(familyMemberPattern);
      
      if (match) {
        const info = {
          name: match[1].trim(),
          relation: match[2].trim(),
          insuranceNumber: match[3].trim(),
          age: null,
          gender: null,
        };
        console.log("✅ Parsed family member info (old format):", info);
        return info;
      }
    }
    
    return null;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          color: "warning",
          label: t("pending", language),
          icon: "⏳",
        };
      case "in_progress":
        return {
          color: "info",
          label: t("inProgress", language),
          icon: "🔄",
        };
      case "completed":
        return {
          color: "success",
          label: t("completed", language),
          icon: "✅",
        };
      case "rejected":
        return {
          color: "error",
          label: t("rejected", language),
          icon: "❌",
        };
      default:
        return {
          color: "default",
          label: t("unknown", language),
          icon: "❓",
        };
    }
  };

  // Open Accept dialog (Step 1: price only)
  const handleOpenAcceptDialog = (request) => {
    setAcceptDialog({ open: true, request });
    setEnteredPrice("");
    isSubmittingClaimRef.current = false;
  };

  // Open Upload dialog (Step 2: file only)
  const handleOpenUploadDialog = (request) => {
    setUploadDialog({ open: true, request });
    setUploadFile(null);
  };

  const handleImageClick = (imageUrl) => {
    setImageDialog({ open: true, imageUrl });
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  // Step 1: Accept request + enter price + submit claim
  const handleAcceptSubmit = async () => {
    if (!enteredPrice || parseFloat(enteredPrice) <= 0) {
      setSnackbar({
        open: true,
        message: t("pleaseEnterValidPrice", language),
        severity: "warning",
        icon: <ErrorIcon fontSize="inherit" />,
      });
      return;
    }

    try {
      setUploading(true);

      // Call accept endpoint
      const response = await api.patch(
        API_ENDPOINTS.RADIOLOGY.ACCEPT(acceptDialog.request.id),
        { price: parseFloat(enteredPrice) }
      );

      const unionPrice = parseFloat(acceptDialog.request.unionPrice) || 0;
      const enteredPriceNum = parseFloat(enteredPrice) || 0;
      const approvedPrice = response?.approvedPrice || (unionPrice > 0 ? Math.min(unionPrice, enteredPriceNum) : enteredPriceNum);
      const finalAmount = approvedPrice;

      // Extract diagnosis and treatment
      let diagnosis = acceptDialog.request.diagnosis || acceptDialog.request.Diagnosis || "";
      let treatment = acceptDialog.request.treatment || acceptDialog.request.Treatment || "";

      if (!diagnosis && acceptDialog.request.notes) {
        const notesMatch = acceptDialog.request.notes.match(/Diagnosis:\s*(.+?)(?:\n|$)/i);
        if (notesMatch) {
          diagnosis = notesMatch[1].trim();
        } else if (acceptDialog.request.notes && !acceptDialog.request.notes.includes("Treatment:")) {
          diagnosis = acceptDialog.request.notes.trim();
        }
      }

      if (!treatment && acceptDialog.request.notes) {
        const treatmentMatch = acceptDialog.request.notes.match(/Treatment:\s*(.+?)(?:\n|$)/i);
        if (treatmentMatch) {
          treatment = treatmentMatch[1].trim();
        }
      }

      // Determine correct clientId
      let clientIdToUse = acceptDialog.request.memberId;
      let memberNameToUse = acceptDialog.request.memberName || "";

      if (acceptDialog.request.isFamilyMember === true && acceptDialog.request.familyMemberId) {
        clientIdToUse = acceptDialog.request.familyMemberId;
        memberNameToUse = acceptDialog.request.familyMemberName || acceptDialog.request.memberName || "";
      }

      const claimData = {
        clientId: clientIdToUse,
        memberName: memberNameToUse,
        description: `Radiology examination completed - ${acceptDialog.request.testName || "Radiology Result"}`,
        amount: finalAmount,
        serviceDate: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis,
        treatmentDetails: treatment,
        roleSpecificData: JSON.stringify({
          testId: acceptDialog.request.id,
          testName: acceptDialog.request.testName,
          patientName: acceptDialog.request.memberName,
          enteredPrice: enteredPriceNum,
          approvedPrice: approvedPrice,
          finalPrice: finalAmount,
          diagnosis: diagnosis,
          treatment: treatment,
          notes: `Examination performed by ${userInfo?.fullName || "Radiologist"}`
        }),
      };

      onSetClaimData(JSON.parse(JSON.stringify(claimData)));
      claimDataRef.current = JSON.parse(JSON.stringify(claimData));

      setSnackbar({
        open: true,
        message: t("testAcceptedSuccess", language),
        severity: "success",
        icon: <CheckCircleIcon fontSize="inherit" />,
      });

      onUploaded?.(response);
      setAcceptDialog({ open: false, request: null });
      setEnteredPrice("");

      // Submit claim
      if (onSubmitClaim && !isSubmittingClaimRef.current) {
        isSubmittingClaimRef.current = true;
        try {
          await onSubmitClaim(null, JSON.parse(JSON.stringify(claimData)));
          isSubmittingClaimRef.current = false;
          claimDataRef.current = null;
        } catch (claimErr) {
          console.error("Error submitting claim:", claimErr);
          isSubmittingClaimRef.current = false;
          setSnackbar({
            open: true,
            message: `${t("uploadSucceededButClaimFailed", language)}: ${claimErr.response?.data?.message || claimErr.message || t("unknownError", language)}`,
            severity: "warning",
            icon: <ErrorIcon fontSize="inherit" />,
          });
        }
      }
    } catch (err) {
      isSubmittingClaimRef.current = false;
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToUploadResult", language),
        severity: "error",
        icon: <ErrorIcon fontSize="inherit" />,
      });
    } finally {
      setUploading(false);
    }
  };

  // Step 2: Upload results file only (no price, no claim)
  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setSnackbar({
        open: true,
        message: t("pleaseSelectFileToUpload", language),
        severity: "warning",
        icon: <ErrorIcon fontSize="inherit" />,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      setUploading(true);
      const response = await api.patch(
        API_ENDPOINTS.RADIOLOGY.UPLOAD_RESULT(uploadDialog.request.id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSnackbar({
        open: true,
        message: t("resultsUploadedSuccess", language),
        severity: "success",
        icon: <CheckCircleIcon fontSize="inherit" />,
      });

      onUploaded?.(response);
      setUploadDialog({ open: false, request: null });
      setUploadFile(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("failedToUploadResult", language),
        severity: "error",
        icon: <ErrorIcon fontSize="inherit" />,
      });
    } finally {
      setUploading(false);
    }
  };

  // ✅ Fetch Client Information (age, gender) for main clients using employee ID endpoint
  // NOTE: These hooks must be called before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    const fetchClientInfo = async () => {
      const token = getToken();
      if (!requests || requests.length === 0 || !token) {
        return;
      }

      // Get unique employee IDs for main clients (from requests or from the nameToEmployeeIdMap)
      const employeeIdToNameMap = {};
      const uniqueEmployeeIds = new Set();
      
      requests
        .filter(req => req.memberName && !req.isFamilyMember) // Only main clients
        .forEach(req => {
          // Try to get employee ID from request data first, then from map
          const employeeId = req.memberEmployeeId || req.employeeId || nameToEmployeeIdMap[req.memberName?.toLowerCase()];
          if (employeeId) {
            uniqueEmployeeIds.add(employeeId);
            employeeIdToNameMap[employeeId] = req.memberName;
          }
        });

      if (uniqueEmployeeIds.size === 0) {
        console.log("⚠️ No employee IDs found to fetch client info");
        return;
      }

      console.log("🔄 Fetching client info (age, gender) for", uniqueEmployeeIds.size, "main clients by employee ID");

      // Fetch all client info in parallel and update state as each completes
      Array.from(uniqueEmployeeIds).forEach(async (employeeId) => {
        try {
          const response = await api.get(
            API_ENDPOINTS.CLIENTS.SEARCH_BY_EMPLOYEE_ID(encodeURIComponent(employeeId))
          );
          
          if (response.data) {
            const memberName = employeeIdToNameMap[employeeId];
            if (!memberName) return;
            
            // Calculate age from dateOfBirth if available
            // Note: endpoint returns "dateofbirth" (lowercase) not "dateOfBirth"
            const dateOfBirth = response.data.dateofbirth || response.data.dateOfBirth;
            let age = null;
            if (dateOfBirth) {
              age = calculateAgeFromDOB(dateOfBirth);
            }
            
            const info = {
              age: age,
              gender: response.data.gender || null,
              dateOfBirth: dateOfBirth || null,
            };
            
            console.log("✅ Fetched client info for", memberName, "(Employee ID:", employeeId, "):", info);
            
            // Update state immediately when each request completes (incremental updates)
            setClientInfoMap(prev => ({
              ...prev,
              [memberName]: info
            }));
          }
        } catch (err) {
          const memberName = employeeIdToNameMap[employeeId];
          console.warn("⚠️ Could not fetch client info for employee ID", employeeId, ":", err.response?.data?.error || err.message);
          if (memberName) {
            // Still update state with null values so we don't retry
            setClientInfoMap(prev => ({
              ...prev,
              [memberName]: { age: null, gender: null }
            }));
          }
        }
      });
    };

    // Run immediately, no delay - fetch as soon as we have employee IDs
    fetchClientInfo();
  }, [requests, nameToEmployeeIdMap]);

  // ✅ Fetch Employee IDs for all unique patients when requests load
  useEffect(() => {
    const fetchEmployeeIdsForPatients = async () => {
      const token = getToken();
      if (!requests || requests.length === 0 || !token) {
        console.log("No requests to process for employee IDs");
        return;
      }

      console.log("🔄 Processing", requests.length, "requests for employee IDs");
      
      // First, check if any requests already have employee ID in data
      const requestsWithEmployeeId = requests.filter(req => req.memberEmployeeId || req.employeeId);
      console.log("📋 Requests with employee ID in data:", requestsWithEmployeeId.length);
      
      // Build map from data that already has employee ID
      const mapFromData = {};
      requestsWithEmployeeId.forEach(req => {
        if (req.memberName && (req.memberEmployeeId || req.employeeId)) {
          const name = req.memberName.toLowerCase();
          const employeeId = req.memberEmployeeId || req.employeeId;
          mapFromData[name] = employeeId;
        }
      });
      
      if (Object.keys(mapFromData).length > 0) {
        console.log("✅ Found employee IDs in data:", mapFromData);
        setNameToEmployeeIdMap(prev => ({ ...prev, ...mapFromData }));
      }

      // Get unique patient names (that don't already have employee ID in data)
      const uniquePatients = Array.from(
        new Set(
          requests
            .filter(req => req.memberName && !req.memberEmployeeId && !req.employeeId)
            .map(req => ({
              name: req.memberName?.toLowerCase(),
              memberId: req.memberId,
              originalName: req.memberName // Keep original for matching
            }))
            .filter(p => p.name && p.memberId)
        )
      );

      console.log("Unique patients to fetch from API:", uniquePatients.length, uniquePatients);

      if (uniquePatients.length === 0) {
        console.log("✅ All patients already have employee IDs from data");
        return;
      }

      // Try to get all clients list first, then match by memberId
      try {
        console.log("Fetching clients list...");
        const clientsResponse = await api.get(API_ENDPOINTS.CLIENTS.LIST);

        console.log("Clients response:", clientsResponse.data?.length, "clients");

        if (clientsResponse.data && Array.isArray(clientsResponse.data)) {
          const clientsMap = new Map();
          clientsResponse.data.forEach(client => {
            if (client.id && client.employeeId) {
              clientsMap.set(client.id, client.employeeId);
            }
          });

          console.log("Clients map size:", clientsMap.size);

          // Map patient names to employee IDs
          const newMap = {};
          uniquePatients.forEach(patient => {
            const employeeId = clientsMap.get(patient.memberId);
            console.log(`Patient: ${patient.originalName}, memberId: ${patient.memberId}, employeeId: ${employeeId}`);
            if (employeeId && patient.name) {
              newMap[patient.name] = employeeId;
            }
          });

          console.log("New employee ID map:", newMap);

          if (Object.keys(newMap).length > 0) {
            setNameToEmployeeIdMap(prev => {
              const updated = { ...prev, ...newMap };
              console.log("Updated nameToEmployeeIdMap:", updated);
              return updated;
            });
          } else {
            console.log("No employee IDs found to map");
          }
        }
      } catch (err) {
        // Log error for debugging
        console.error("❌ Could not fetch clients list for employee IDs:", err.response?.status, err.message);
        console.log("⚠️ Endpoint /api/clients/list is not authorized.");
        console.log("💡 Employee IDs should come from backend DTO (employeeId field). If not present, they will only appear after search.");
        // Note: Employee IDs should be included in the response from backend DTO
        // If they're not present, they will only appear after user searches
      }
    };

    // Only fetch if we have requests
    if (requests && requests.length > 0) {
      console.log("🚀 Starting to fetch employee IDs...");
      fetchEmployeeIdsForPatients();
    } else {
      console.log("⏸️ Skipping fetch - no requests");
    }
  }, [requests]);

  // Early return for loading state - must be after all hooks
  if (!Array.isArray(requests)) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" fontWeight="bold" color="text.secondary">
          {t("loading", language)}
        </Typography>
      </Box>
    );
  }

  // Search handler - validates client exists then filters results
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setSearchLoading(true);
    try {
      const endpoint = searchType === "employeeId"
        ? `/api/clients/search/employeeId/${encodeURIComponent(searchInput.trim())}`
        : `/api/clients/search/nationalId/${encodeURIComponent(searchInput.trim())}`;
      const clientData = await api.get(endpoint);

      if (clientData) {
        // Use client's full name for exact matching in filter
        setSearchTerm(clientData.fullName || searchInput.trim());
        setHasSearched(true);

        if (clientData.fullName && clientData.employeeId) {
          setNameToEmployeeIdMap(prev => ({
            ...prev,
            [clientData.fullName.toLowerCase()]: clientData.employeeId
          }));
        }
      }
    } catch {
      setSearchTerm("");
      setHasSearched(false);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setHasSearched(false);
    setFamilyMemberFilter("all");
  };

  // ✅ Sorting and filtering - Show PENDING and IN_PROGRESS
  const activeRequests = requests.filter(
    (r) => {
      const status = r.status?.toLowerCase();
      return status === "pending" || status === "in_progress";
    }
  );

  const sortedRequests = [...activeRequests].sort(
    (a, b) => {
      // Sort by date (newest first) - all are PENDING
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  );

  // First filter by search term - only show results after searching
  const searchFilteredRequests = sortedRequests.filter(
    (r) => {
      // Only show results when search has been performed
      if (!hasSearched || !searchTerm.trim()) return false;

      const searchLower = searchTerm.toLowerCase();

      // Exact match by patient name (main client)
      const matchesName = r.memberName?.toLowerCase() === searchLower;

      // Exact match by Employee ID (main client)
      const matchesEmployeeId = r.employeeId?.toLowerCase() === searchLower;

      // Exact match by National ID (main client)
      const matchesNationalId = r.memberNationalId?.toLowerCase() === searchLower;

      // Exact match by family member info if exists
      const familyInfo = getFamilyMemberInfo(r);
      const matchesFamilyMemberName = familyInfo?.name?.toLowerCase() === searchLower;
      const matchesFamilyMemberInsuranceNumber = familyInfo?.insuranceNumber?.toLowerCase() === searchLower;
      const matchesFamilyMemberNationalId = familyInfo?.nationalId?.toLowerCase() === searchLower;

      return matchesName || matchesEmployeeId || matchesNationalId || matchesFamilyMemberName || matchesFamilyMemberInsuranceNumber || matchesFamilyMemberNationalId;
    }
  );

  // Extract unique family members from filtered requests
  const getUniqueFamilyMembers = () => {
    const mainClientName = searchFilteredRequests.length > 0 ? searchFilteredRequests[0].memberName : null;
    const familyMembers = new Map();

    searchFilteredRequests.forEach(r => {
      const familyInfo = getFamilyMemberInfo(r);
      if (familyInfo && familyInfo.name) {
        // Add family member with their relation
        familyMembers.set(familyInfo.name, familyInfo.relation || "Family");
      }
    });

    return { mainClientName, familyMembers: Array.from(familyMembers.entries()) };
  };

  const { mainClientName, familyMembers } = getUniqueFamilyMembers();
  const hasFamilyMembers = familyMembers.length > 0 && hasSearched;

  // Apply family member filter
  const filteredRequests = searchFilteredRequests.filter((r) => {
    if (familyMemberFilter === "all") return true;

    const familyInfo = getFamilyMemberInfo(r);
    const isFamilyMemberRequest = familyInfo !== null;

    if (familyMemberFilter === "main") {
      // Show only main client requests (not family members)
      return !isFamilyMemberRequest;
    } else {
      // Show only specific family member requests
      return isFamilyMemberRequest && familyInfo?.name === familyMemberFilter;
    }
  });

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <LocalHospitalIcon sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" color="text.secondary">
          {t("noRadiologyRequestsFound", language)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? "rtl" : "ltr"} sx={{ px: { xs: 2, md: 4 }, py: 3, backgroundColor: "#FAF8F5", minHeight: "100vh" }}>
      <Box>
        {/* 📌 Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #556B2F 0%, #7B8B5E 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: "#556B2F",
                width: 56,
                height: 56,
              }}
            >
              <LocalHospitalIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                {t("radiologyRequests", language)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t("radiologyRequestList", language)}
              </Typography>
            </Box>
          </Stack>

          {/* Stats Summary */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  p: 2,
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="h4" fontWeight="700">
                  {activeRequests.length}
                </Typography>
                <Typography variant="body2">{t("totalRequests", language)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Patient Search Section */}
        <PatientSearchBar
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          searchValue={searchInput}
          onSearchValueChange={setSearchInput}
          onSearch={handleSearch}
          loading={searchLoading}
          onClear={handleClearSearch}
          hasSearched={hasSearched}
        />

        {/* Family Member Filter - Only show if there are family members in the results */}
        {hasFamilyMembers && (
          <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8EDE0", mb: 4, bgcolor: "#fef3c7" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FamilyRestroomIcon sx={{ color: "#92400e" }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#92400e">
                    {language === "ar" ? "تصفية حسب أفراد العائلة:" : "Filter by Family Member:"}
                  </Typography>
                </Stack>
                <FormControl size="small" sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1 }}>
                  <Select
                    value={familyMemberFilter}
                    onChange={(e) => setFamilyMemberFilter(e.target.value)}
                    displayEmpty
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="all">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>{language === "ar" ? "🔍 الكل" : "🔍 All"}</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="main">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon sx={{ fontSize: 18, color: "#556B2F" }} />
                        <span>{mainClientName || (language === "ar" ? "العميل الرئيسي" : "Main Client")}</span>
                      </Stack>
                    </MenuItem>
                    {familyMembers.map(([name, relation]) => (
                      <MenuItem key={name} value={name}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FamilyRestroomIcon sx={{ fontSize: 18, color: "#92400e" }} />
                          <span>{name}</span>
                          <Chip label={relation} size="small" sx={{ height: 18, fontSize: "0.65rem", bgcolor: "#fde68a" }} />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {familyMemberFilter !== "all" && (
                  <Button
                    size="small"
                    onClick={() => setFamilyMemberFilter("all")}
                    sx={{ color: "#92400e", textTransform: "none" }}
                  >
                    {language === "ar" ? "إظهار الكل" : "Show All"}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Prompt to search - shown when no search performed */}
        {!hasSearched && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "2px dashed #E8EDE0",
              bgcolor: "#fafaf5",
              mb: 4,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "#556B2F", mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="#556B2F" fontWeight={600} gutterBottom>
              {t("enterIdToSearch", language)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("searchToViewLabRequests", language)}
            </Typography>
          </Paper>
        )}

        {/* Results Count - only show when searching */}
        {hasSearched && (
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            {filteredRequests.length === 0
              ? `${t("noRadiologyRequestsFound", language)}`
              : `${t("showing", language)} ${filteredRequests.length} ${t("radiologyRequests", language)}`}
          </Typography>
        )}

        {/* Grid of Cards - 3 columns */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            "@media (max-width: 1200px)": {
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            },
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {filteredRequests.map((req, index) => {
            const status = getStatusStyle(req.status);
            const familyMemberInfo = getFamilyMemberInfo(req);
            const patientEmployeeId = nameToEmployeeIdMap[req.memberName] || null;
            const universityCardImage = req.universityCardImage || 
                          (req.universityCardImages && req.universityCardImages.length > 0 ? req.universityCardImages[0] : null);
            const displayAge = clientInfoMap[req.memberName]?.age || calculateAgeFromDOB(req.dateOfBirth) || null;
            const displayGender = clientInfoMap[req.memberName]?.gender || null;

            return (
              <RadiologyRequestCard
                key={req.id}
                request={req}
                index={index}
                status={status}
                familyMemberInfo={familyMemberInfo}
                patientEmployeeId={patientEmployeeId}
                displayAge={displayAge}
                displayGender={displayGender}
                formatDate={formatDate}
                onOpenAcceptDialog={handleOpenAcceptDialog}
                onOpenUploadDialog={handleOpenUploadDialog}
              />
            );
          })}
        </Box>

        {/* No Results Message */}
        {filteredRequests.length === 0 && searchTerm && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed #d1d5db",
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "#cbd5e0", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t("noRadiologyRequestsFound", language)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("tryAdjustingSearch", language)}
            </Typography>
          </Paper>
        )}
      </Box>

      <RadiologyRequestDialogs
        acceptDialog={acceptDialog}
        uploadDialog={uploadDialog}
        imageDialog={imageDialog}
        snackbar={snackbar}
        uploadFile={uploadFile}
        uploading={uploading}
        enteredPrice={enteredPrice}
        onAcceptDialogClose={() => {
          setAcceptDialog({ open: false, request: null });
          setEnteredPrice("");
        }}
        onUploadDialogClose={() => {
          setUploadDialog({ open: false, request: null });
        }}
        onFileChange={handleFileChange}
        onPriceChange={(e) => setEnteredPrice(e.target.value)}
        onAcceptConfirm={handleAcceptSubmit}
        onUploadConfirm={handleUploadSubmit}
        onImageDialogClose={() => setImageDialog({ open: false, imageUrl: null })}
        onSnackbarClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};


export default RadiologyRequestList;
