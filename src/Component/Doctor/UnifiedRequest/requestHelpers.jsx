// Utility functions for UnifiedCreateRequest

// Extract numeric age from age string (e.g., "25 years" -> 25)
export const extractAgeNumber = (ageString) => {
  if (!ageString) return null;
  const match = ageString.toString().match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

// Convert Arabic-Indic digits to Latin digits
export const toLatinDigits = (input) => {
  if (input === null || input === undefined) return "";
  const s = String(input);
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const latin = "0123456789";
  return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (ch) => latin[arabicIndic.indexOf(ch)]);
};

// Filter items by gender, age, and specialization restrictions
export const filterByRestrictions = (
  items,
  itemType,
  selectedFamilyMember,
  patientForm,
  selectedSpecializationData,
  setSpecializationRestrictionFailed,
  setRestrictionFailureReason,
  calculateAge
) => {
  // Ensure items is an array and has elements
  if (!items || !Array.isArray(items) || items.length === 0) {
    return Array.isArray(items) ? items : [];
  }

  // Determine patient info
  let patientAge = null;
  let patientGender = null;
  let patientName = "";
  let patientType = "";

  if (selectedFamilyMember) {
    patientType = "Family Member";
    patientName = selectedFamilyMember.fullName || "Family Member";
    if (selectedFamilyMember.dateOfBirth) {
      const ageString = calculateAge(selectedFamilyMember.dateOfBirth);
      patientAge = extractAgeNumber(ageString);
    }
    patientGender = selectedFamilyMember.gender?.toUpperCase();
  } else {
    patientType = "Main Client";
    patientName = patientForm.memberName || "Main Client";
    patientAge = extractAgeNumber(patientForm.age);
    patientGender = patientForm.gender?.toUpperCase();
  }

  // Check specialization restrictions
  if (selectedSpecializationData) {
    const patientDisplayName = patientName || (selectedFamilyMember ? "Family Member" : "Main Client");

    // Check gender field
    if (selectedSpecializationData.gender) {
      const specGender = selectedSpecializationData.gender.toUpperCase();
      if (specGender !== "ALL") {
        if (!patientGender) {
          const errorMsg = `${patientType} "${patientDisplayName}": Specialization requires gender "${specGender}", but patient gender is unknown.`;
          setSpecializationRestrictionFailed(true);
          setRestrictionFailureReason(errorMsg);
          return [];
        }
        if (patientGender !== specGender) {
          const errorMsg = `${patientType} "${patientDisplayName}": Patient gender "${patientGender}" doesn't match specialization gender requirement "${specGender}".`;
          setSpecializationRestrictionFailed(true);
          setRestrictionFailureReason(errorMsg);
          return [];
        }
      }
    }

    // Check allowed genders
    const allowedGenders = selectedSpecializationData.allowedGenders;
    if (allowedGenders && Array.isArray(allowedGenders) && allowedGenders.length > 0) {
      if (!patientGender) {
        const errorMsg = `${patientType} "${patientDisplayName}": Specialization has gender restrictions, but patient gender is unknown.`;
        setSpecializationRestrictionFailed(true);
        setRestrictionFailureReason(errorMsg);
        return [];
      }
      const allowedGendersUpper = allowedGenders.map((g) => (g || "").toUpperCase());
      if (!allowedGendersUpper.includes(patientGender)) {
        const errorMsg = `${patientType} "${patientDisplayName}": Patient gender "${patientGender}" not in specialization allowed genders [${allowedGendersUpper.join(", ")}].`;
        setSpecializationRestrictionFailed(true);
        setRestrictionFailureReason(errorMsg);
        return [];
      }
    }

    // Check age restrictions
    if (patientAge !== null && patientAge !== undefined) {
      if (selectedSpecializationData.minAge !== null && selectedSpecializationData.minAge !== undefined) {
        if (patientAge < selectedSpecializationData.minAge) {
          const errorMsg = `${patientType} "${patientDisplayName}": Patient age "${patientAge}" is less than specialization minimum age "${selectedSpecializationData.minAge}".`;
          setSpecializationRestrictionFailed(true);
          setRestrictionFailureReason(errorMsg);
          return [];
        }
      }
      if (selectedSpecializationData.maxAge !== null && selectedSpecializationData.maxAge !== undefined) {
        if (patientAge > selectedSpecializationData.maxAge) {
          const errorMsg = `${patientType} "${patientDisplayName}": Patient age "${patientAge}" is greater than specialization maximum age "${selectedSpecializationData.maxAge}".`;
          setSpecializationRestrictionFailed(true);
          setRestrictionFailureReason(errorMsg);
          return [];
        }
      }
    } else {
      if (selectedSpecializationData.minAge !== null || selectedSpecializationData.maxAge !== null) {
        let ageDisplay = "unknown";
        if (selectedFamilyMember && selectedFamilyMember.dateOfBirth) {
          const ageString = calculateAge(selectedFamilyMember.dateOfBirth);
          ageDisplay = ageString || "unknown";
        } else {
          ageDisplay = patientForm.age || "unknown";
        }
        const errorMsg = `${patientType} "${patientDisplayName}": Specialization has age restrictions, but patient age is ${ageDisplay}.`;
        setSpecializationRestrictionFailed(true);
        setRestrictionFailureReason(errorMsg);
        return [];
      }
    }

    setSpecializationRestrictionFailed(false);
    setRestrictionFailureReason("");
  } else {
    setSpecializationRestrictionFailed(false);
    setRestrictionFailureReason("");
  }

  // Filter items by their individual restrictions
  return items.filter((item) => {
    if (!item) return false;
    const fullItem = item.fullItem || item;

    // Check gender restrictions
    const itemAllowedGenders = fullItem.allowedGenders;
    if (itemAllowedGenders && Array.isArray(itemAllowedGenders) && itemAllowedGenders.length > 0) {
      if (!patientGender) return false;
      const allowedGendersUpper = itemAllowedGenders.map((g) => (g || "").toUpperCase());
      if (!allowedGendersUpper.includes(patientGender)) return false;
    }

    // Check age restrictions
    if (patientAge !== null) {
      if (fullItem.minAge !== null && fullItem.minAge !== undefined) {
        if (patientAge < fullItem.minAge) return false;
      }
      if (fullItem.maxAge !== null && fullItem.maxAge !== undefined) {
        if (patientAge > fullItem.maxAge) return false;
      }
    } else {
      // If patient age is unknown but item has age restrictions, exclude it
      if (fullItem.minAge !== null && fullItem.minAge !== undefined) return false;
      if (fullItem.maxAge !== null && fullItem.maxAge !== undefined) return false;
    }

    return true;
  });
};
