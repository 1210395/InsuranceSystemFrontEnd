import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const AddEmergency = ({ onAdded }) => {
  const { language, isRTL } = useLanguage();
  const [newRequest, setNewRequest] = useState({
    description: "",
    location: "",
    contactPhone: "",
    incidentDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8080/api/emergencies",
        newRequest,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t("emergencyRequestSubmittedSuccessfully", language));

      if (onAdded) {
        onAdded(res.data); // تحديث القائمة إذا حابب
      }

      setNewRequest({
        description: "",
        location: "",
        contactPhone: "",
        incidentDate: "",
        notes: "",
      });
    } catch (err) {
      console.error("❌ Error submitting emergency:", err);
      alert(t("failedToSubmitEmergencyRequest", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" dir={isRTL ? "rtl" : "ltr"}>
      <div className="page-header">
        <h1>{t("addEmergencyRequest", language)}</h1>
        <p>{t("fillEmergencyRequestDetails", language)}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="table-section"
        style={{ padding: "1rem", marginTop: "1rem" }}
      >
        <div className="claim-form">
          <div className="form-group">
            <label>{t("description", language)}</label>
            <input
              type="text"
              name="description"
              value={newRequest.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("location", language)}</label>
            <input
              type="text"
              name="location"
              value={newRequest.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("contactPhone", language)}</label>
            <input
              type="text"
              name="contactPhone"
              value={newRequest.contactPhone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("incidentDate", language)}</label>
            <input
              type="date"
              name="incidentDate"
              value={newRequest.incidentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label>{t("notes", language)}</label>
            <textarea
              name="notes"
              value={newRequest.notes}
              onChange={handleChange}
              style={{ minHeight: "80px", padding: "0.6rem" }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#DC2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          {loading ? t("submitting", language) : t("submitEmergencyRequest", language)}
        </button>
      </form>
    </div>
  );
};

export default AddEmergency;
