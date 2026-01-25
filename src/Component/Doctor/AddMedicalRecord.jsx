import React, { useState } from "react";
import axios from "axios";
import "./DoctorDashboard.md.css";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

function AddMedicalRecord() {
  const { language, isRTL } = useLanguage();
  const [form, setForm] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
    memberName: "", // 👈 إدخال اسم المريض بدل ID
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8080/api/medical-records/create-medical",
        form, // 👈 backend يستقبل memberName + diagnosis + treatment + notes
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(t("medicalRecordCreatedSuccessfully", language));
      setForm({
        diagnosis: "",
        treatment: "",
        notes: "",
        memberName: "",
      });
    } catch (err) {
      console.error("❌ Error creating medical record:", err.response || err);
      alert(t("failedToCreateMedicalRecord", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="form-title">{t("addNewMedicalRecord", language)}</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>{t("memberName", language)}</label>
          <input
            type="text"
            name="memberName"
            value={form.memberName}
            onChange={handleChange}
            placeholder={t("enterPatientFullName", language)}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("diagnosis", language)}</label>
          <input
            type="text"
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("treatment", language)}</label>
          <input
            type="text"
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("notes", language)}</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("saving", language) : t("addMedicalRecord", language)}
        </button>
      </form>
    </div>
  );
}

export default AddMedicalRecord;
