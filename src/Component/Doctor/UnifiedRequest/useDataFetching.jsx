import { useState, useEffect } from "react";
import { api } from "../../../utils/apiService";
import { API_ENDPOINTS } from "../../../config/api";

// Custom hook for fetching specializations and available options
export const useDataFetching = (doctorId, showError) => {
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);

  // Fetch specializations on mount
  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Fetch specializations
  // Note: api.get() returns response.data directly
  const fetchSpecializations = async () => {
    try {
      setLoadingSpecializations(true);
      const data = await api.get("/api/doctor-specializations/with-details");
      // Ensure we have an array, default to empty array if null/undefined
      setSpecializations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching specializations:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error loading specializations";
      showError(errorMessage);
      setSpecializations([]);
    } finally {
      setLoadingSpecializations(false);
    }
  };

  // Fetch available medicines, lab tests, and radiology tests
  const fetchAvailableOptions = async (patientForm, selectedFamilyMember, noDiagnosisTreatment) => {
    try {
      const isForEmployee = !selectedFamilyMember;
      const memberId = isForEmployee ? null : selectedFamilyMember?.id;
      const employeeId = isForEmployee ? patientForm.employeeId : null;
      const diagnosis = noDiagnosisTreatment ? "" : patientForm.diagnosis;
      const treatment = noDiagnosisTreatment ? "" : patientForm.treatment;

      const medicineRes = await api.get("/api/prescriptions/available-items", {
        params: { isForEmployee, memberId, employeeId, diagnosis, treatment },
      });

      const labRes = await api.get("/api/labs/available-tests", {
        params: { isForEmployee, memberId, employeeId, diagnosis, treatment },
      });

      const radiologyRes = await api.get("/api/radiology/available-tests", {
        params: { isForEmployee, memberId, employeeId, diagnosis, treatment },
      });

      // api.get() returns data directly, not wrapped in .data
      return {
        availableMedicines: Array.isArray(medicineRes) ? medicineRes : [],
        availableLabTests: Array.isArray(labRes) ? labRes : [],
        availableRadiologyTests: Array.isArray(radiologyRes) ? radiologyRes : [],
      };
    } catch (error) {
      console.error("Error fetching available options:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error loading available services";
      showError(errorMessage);
      return {
        availableMedicines: [],
        availableLabTests: [],
        availableRadiologyTests: [],
      };
    }
  };

  // Check if visit is a follow-up visit
  const checkFollowUpVisit = async (employeeId, specializationId) => {
    try {
      const response = await api.get("/api/visits/is-follow-up", {
        params: { employeeId, specializationId, doctorId },
      });
      // api.get() returns data directly, not wrapped in .data
      return response?.isFollowUp || false;
    } catch (error) {
      console.error("Error checking follow-up visit:", error);
      return false;
    }
  };

  // Check if visit is same specialization same day
  const checkSameSpecializationSameDay = async (employeeId, specializationId) => {
    try {
      const response = await api.get("/api/visits/same-specialization-same-day", {
        params: { employeeId, specializationId, doctorId },
      });
      // api.get() returns data directly, not wrapped in .data
      return response?.sameSpecializationSameDay || false;
    } catch (error) {
      console.error("Error checking same specialization same day:", error);
      return false;
    }
  };

  return {
    specializations,
    loadingSpecializations,
    fetchSpecializations,
    fetchAvailableOptions,
    checkFollowUpVisit,
    checkSameSpecializationSameDay,
  };
};
