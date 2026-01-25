import React, { useState } from "react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

function AddLabRequest({ onAdd }) {
  const { language, isRTL } = useLanguage();
  const [form, setForm] = useState({
    testName: "",
    notes: "",
    memberName: "", // 🟢 لازم يطابق الـ backend
  });

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/labs/create",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(t("labRequestCreatedSuccessfully", language));
      console.log("Created Lab Request:", res.data);

      // إذا بدك تحدث القائمة بعد الإضافة
      if (onAdd) onAdd(res.data);

      // 🟢 إعادة تعيين الفورم
      setForm({
        testName: "",
        notes: "",
        memberName: "",
      });
    } catch (err) {
      console.error("❌ Error creating lab request:", err);
      alert(t("failedToCreateLabRequest", language));
    }
  };

  return (
    <div className="form-container" dir={isRTL ? "rtl" : "ltr"}>
      <h2>{t("addLabRequest", language)}</h2>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group">
            <label>{t("testName", language)}</label>
            <input
              type="text"
              name="testName"
              value={form.testName}
              onChange={handleChange}
              placeholder={t("enterTestName", language)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t("memberName", language)}</label>
            <input
              type="text"
              name="memberName"
              value={form.memberName}
              onChange={handleChange}
              placeholder={t("enterMemberName", language)}
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>{t("notes", language)}</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder={t("enterNotes", language)}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn-primary">
          {t("addLabRequest", language)}
        </button>
      </form>
    </div>
  );
}

export default AddLabRequest;
