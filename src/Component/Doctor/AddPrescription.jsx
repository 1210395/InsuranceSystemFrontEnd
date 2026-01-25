import React, { useState } from "react";
import axios from "axios";
import "./DoctorDashboard.md.css";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

function AddPrescription() {
  const { language, isRTL } = useLanguage();
  const [form, setForm] = useState({
    medicine: "",
    dosage: "",
    instructions: "",
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
        "http://localhost:8080/api/prescriptions/create",
        form, // 👈 backend يستقبل memberName + medicine + dosage + instructions
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(t("prescriptionCreatedSuccessfully", language));
      setForm({
        medicine: "",
        dosage: "",
        instructions: "",
        memberName: "",
      });
    } catch (err) {
      console.error("❌ Error creating prescription:", err.response || err);
      alert(t("failedToCreatePrescription", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="form-title">{t("addNewPrescription", language)}</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>{t("medicine", language)}</label>
          <input
            type="text"
            name="medicine"
            value={form.medicine}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("dosage", language)}</label>
          <input
            type="text"
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("instructions", language)}</label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            rows="3"
          />
        </div>

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

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("saving", language) : t("addPrescription", language)}
        </button>
      </form>
    </div>
  );
}

export default AddPrescription;
