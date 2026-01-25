import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

const MyClaims = ({ claims }) => {
  const { language, isRTL } = useLanguage();
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "#F59E0B";
      case "approved": return "#059669";
      case "rejected": return "#DC2626";
      default: return "#6B7280";
    }
  };

  return (
    <div className="page-content" dir={isRTL ? "rtl" : "ltr"}>
      {/* 🔹 العنوان */}
      <div className="page-header">
        <h1>{t("myClaims", language)}</h1>
        <p>{t("listOfSubmittedClaims", language)}</p>
      </div>

      {/* 🔹 جدول الكليمات */}
      <div className="table-section">
        <div className="table-container">
          {!claims || claims.length === 0 ? (
            <div
              style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}
            >
              {t("noClaimsFound", language)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("policy", language)}</th>
                  <th>{t("member", language)}</th>
                  <th>{t("description", language)}</th>
                  <th>{t("amount", language)}</th>
                  <th>{t("provider", language)}</th>
                  <th>{t("doctor", language)}</th>
                  <th>{t("date", language)}</th>
                  <th>{t("status", language)}</th>
                  <th>{t("invoice", language)}</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id}>
                    <td>{claim.policyName || "-"}</td>
                    <td>{claim.memberName || "-"}</td>
                    <td>{claim.description}</td>
                    <td>${claim.amount}</td>
                    <td>{claim.providerName}</td>
                    <td>{claim.doctorName}</td>
                    <td>{formatDate(claim.serviceDate)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(claim.status) }}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      {claim.invoiceImagePath ? (
                        <a
                          href={
                            claim.invoiceImagePath.startsWith("http")
                              ? claim.invoiceImagePath
                              : `http://localhost:8080${claim.invoiceImagePath}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("viewInvoice", language)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClaims;
