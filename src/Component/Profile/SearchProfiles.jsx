import React, { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../../utils/apiService";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../config/translations";

// SearchProfiles component does not receive any props
// PropTypes import included for potential future use
const SearchProfiles = () => {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      if (!searchQuery) return;

      const res = await api.get(API_ENDPOINTS.SEARCH_PROFILES.BY_NAME, {
        params: { name: searchQuery },
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error("Error searching profiles:", err);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Search Input */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder={t("searchProvidersPlaceholder", language)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: "#556B2F",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {t("search", language)}
        </button>
      </div>

      {/* Results as Cards */}
      {searchResults.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>{t("searchResults", language)}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                style={{
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ color: "#556B2F", marginBottom: "0.5rem" }}>
                  {profile.name}
                </h3>
                <p><b>{t("type", language)}:</b> {profile.type}</p>
                <p><b>{t("address", language)}:</b> {profile.address}</p>
                <p><b>{t("contact", language)}:</b> {profile.contactInfo}</p>
                <p><b>{t("owner", language)}:</b> {profile.ownerName}</p>
                <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                  {profile.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProfiles;
