// Helper functions for medicine form detection and dosage calculations

export const detectFormFromName = (medicineName) => {
  if (!medicineName) return null;
  const nameUpper = medicineName.toUpperCase();
  // Check for Arabic "سائل" or English "liquid" or "syrup"
  if (nameUpper.includes("سائل") || nameUpper.includes("LIQUID") || nameUpper.includes("SYRUP")) {
    return "Syrup";
  }
  if (nameUpper.includes("TABLET") || nameUpper.includes("حبة")) {
    return "Tablet";
  }
  if (nameUpper.includes("CREAM") || nameUpper.includes("كريم")) {
    return "Cream";
  }
  if (nameUpper.includes("DROPS") || nameUpper.includes("قطرة")) {
    return "Drops";
  }
  if (nameUpper.includes("INJECTION") || nameUpper.includes("حقن")) {
    return "Injection";
  }
  return null;
};

export const getDosageLabel = (form, medicineName = null) => {
  // If form is null, try to detect from medicine name
  if (!form && medicineName) {
    const detectedForm = detectFormFromName(medicineName);
    if (detectedForm) {
      form = detectedForm;
    }
  }
  
  if (!form) {
    return "Dosage";
  }
  
  const formUpper = form.toUpperCase();
  
  if (formUpper === "TABLET") return "How many tablets";
  if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") {
    return "Dosage in ml";
  }
  if (formUpper === "INJECTION") return "How many injections";
  if (formUpper === "CREAM") return "How many grams";
  if (formUpper === "DROPS") return "How many drops";
  
  return "Dosage";
};

export const isDosagePerDay = (form) => {
  if (!form) return false;
  const formUpper = form.toUpperCase();
  return formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE";
};

export const getDosageHelperText = (form, medicineName = null) => {
  // If form is null, try to detect from medicine name
  if (!form && medicineName) {
    const detectedForm = detectFormFromName(medicineName);
    if (detectedForm) {
      form = detectedForm;
    }
  }
  if (!form) return "Enter dosage";
  const formUpper = form.toUpperCase();
  if (formUpper === "TABLET") return "Number of tablets per dose";
  if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") return "Total ml per day";
  if (formUpper === "INJECTION") return "Number of injections";
  if (formUpper === "CREAM") return "Grams per dose";
  if (formUpper === "DROPS") return "Drops per dose";
  return "Enter dosage";
};

export const getDosagePlaceholder = (form, medicineName = null) => {
  // If form is null, try to detect from medicine name
  if (!form && medicineName) {
    const detectedForm = detectFormFromName(medicineName);
    if (detectedForm) {
      form = detectedForm;
    }
  }
  if (!form) return "Enter dosage";
  const formUpper = form.toUpperCase();
  if (formUpper === "TABLET") return "e.g., 1 or 2 tablets";
  if (formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID") return "e.g., 15 or 20 ml per day";
  if (formUpper === "INJECTION") return "e.g., 1 or 2 injections";
  if (formUpper === "CREAM") return "e.g., 5 or 10 grams";
  if (formUpper === "DROPS") return "e.g., 2 or 3 drops";
  return "Enter dosage";
};

export const isLiquidMedicine = (form, medicineName = null) => {
  // If form is null, try to detect from medicine name
  if (!form && medicineName) {
    const detectedForm = detectFormFromName(medicineName);
    if (detectedForm) {
      form = detectedForm;
    }
  }
  if (!form) return false;
  const formUpper = form.toUpperCase();
  return formUpper === "SYRUP" || formUpper === "LIQUID PACKAGE" || formUpper === "LIQUID";
};

export const calculateDuration = (medicine, dosage, timesPerDay) => {
  if (!medicine || !dosage || !timesPerDay) return null;
  // Ensure we have valid numeric values
  const dosageNum = parseFloat(dosage) || 0;
  const timesNum = parseFloat(timesPerDay) || 0;
  const quantity = parseFloat(medicine.quantity) || 0;

  // Prevent division by zero
  const dailyConsumption = dosageNum * timesNum;
  if (dailyConsumption <= 0 || quantity <= 0) return null;

  const days = Math.floor(quantity / dailyConsumption);
  return days > 0 ? days : null;
};

/**
 * Calculate required quantity based on drug form and prescription parameters
 * Rules:
 * - Tablets/Injections: quantity = dosage × timesPerDay × duration
 * - Syrups/Drops/Creams: Based on duration (system calculates bottles needed)
 */
export const calculateRequiredQuantity = (form, dosage, timesPerDay, duration, _packageQuantity) => {
  if (!duration || duration <= 0) return null;
  
  const formUpper = (form || "").toUpperCase();
  
  switch (formUpper) {
    case "TABLET":
    case "CAPSULE":
      // Tablets: quantity = dosage × timesPerDay × duration
      if (!dosage || !timesPerDay || dosage <= 0 || timesPerDay <= 0) return null;
      return dosage * timesPerDay * duration;
      
    case "INJECTION":
      // Injections: quantity = dosage × duration (dosage = number of injections)
      if (!dosage || !duration || dosage <= 0 || duration <= 0) return null;
      return dosage * duration;
      
    case "SYRUP":
    case "DROPS":
      // For liquids: System calculates based on duration
      // Frontend just shows duration, backend calculates bottles needed
      return duration; // Return duration as indicator
      
    case "CREAM":
    case "OINTMENT":
      // For creams: System calculates based on duration and timesPerDay
      // Frontend shows timesPerDay and duration, backend calculates tubes needed
      // Calculation: ceil((duration × timesPerDay) / 7)
      if (!duration || !timesPerDay || duration <= 0 || timesPerDay <= 0) return null;
      return Math.ceil((duration * timesPerDay) / 7); // Approximate calculation for display
      
    default:
      // Default: dosage × timesPerDay × duration if all values present
      if (dosage && timesPerDay && dosage > 0 && timesPerDay > 0) {
        return dosage * timesPerDay * duration;
      }
      return duration;
  }
};
