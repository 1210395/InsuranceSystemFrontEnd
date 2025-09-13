import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PharmacistDashboard.module.css";

import PrescriptionList from "./PrescriptionList";
import PharmacistProfile from "../Profile/PharmacistProfile";
import NotificationsList from "../Notification/NotificationsList"; // ✅ استدعاء

const PharmacistDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [unreadCount, setUnreadCount] = useState(0); // ✅ عداد الإشعارات

  const token = localStorage.getItem("token");

  // ✅ الوصفات
  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/prescriptions/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptions(res.data);
    } catch (err) {
      console.error("❌ Error fetching prescriptions", err);
    }
  };

  // ✅ الإحصائيات
  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/prescriptions/pharmacist/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error("❌ Error fetching stats", err);
    }
  };

  // ✅ عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/notifications/unread-count",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(res.data);
    } catch (err) {
      console.error("❌ Error fetching unread count", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchPrescriptions();
    fetchStats();
    fetchUnreadCount();

    // ✅ Polling كل 3 ثواني
    const interval = setInterval(() => {
      fetchPrescriptions();
      fetchStats();
      fetchUnreadCount();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Verify Prescription
  const handleVerify = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/prescriptions/${id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPrescriptions();
      await fetchStats();
    } catch (err) {
      console.error("❌ Error verifying prescription:", err);
    }
  };

  // ❌ Reject Prescription
  const handleReject = async (id) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/prescriptions/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPrescriptions();
      await fetchStats();
    } catch (err) {
      console.error("❌ Error rejecting prescription:", err);
    }
  };

  const handlePrint = (id) => console.log("🖨 Print prescription:", id);

  const handleDetails = (id) => {
    axios
      .get(`http://localhost:8080/api/prescriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => alert(JSON.stringify(res.data, null, 2)))
      .catch((err) => console.error("Error fetching prescription details", err));
  };

  // 📊 إحصائيات
  const statistics = [
    { id: 1, title: "Pending Prescriptions", value: stats.pending || 0, icon: "📋", color: "#F59E0B", bgColor: "#FEF3C7" },
    { id: 2, title: "Verified", value: stats.verified || 0, icon: "✅", color: "#059669", bgColor: "#F0FDF4" },
    { id: 3, title: "Rejected", value: stats.rejected || 0, icon: "❌", color: "#DC2626", bgColor: "#FEF2F2" },
    { id: 4, title: "Total Processed", value: stats.total || 0, icon: "📊", color: "#7C3AED", bgColor: "#F3E8FF" },
  ];

 

  return (
    <div className="pharmacist-dashboard" dir="ltr">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Pharmacy System</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-sections">
            <div className="nav-section">
              <h3>🏠 Dashboard</h3>
              <ul>
                <li>
                  <a
                    href="#dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveView("dashboard");
                    }}
                  >
                    📊 Main Dashboard
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-section">
              <h3>💊 Prescriptions</h3>
              <ul>
                <li>
                  <a
                    href="#prescriptions"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveView("prescriptions");
                    }}
                  >
                    📄 Prescription List
                  </a>
                </li>
              </ul>
            </div>

            <div className="nav-bottom">
              <hr className="sidebar-divider" />
              <div className="nav-section">
                <h3>👤 Account</h3>
                <ul>
                  <li>
                    <a
                      href="#profile"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveView("profile");
                      }}
                    >
                      👤 Profile
                    </a>
                  </li>
                  <li>
                    <a
                      href="#logout"
                      style={{ color: "#FF6B6B" }}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      🚪 Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-nav">
          <div className="nav-left">
            <div className="logo">
              <h1>Birzeit Insurance</h1>
            </div>
          </div>
          <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* ✅ زر الجرس */}
            <div
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => setActiveView("notifications")}
            >
                 <button
              className="notification-btn"
              onClick={() => setActiveView("notifications")}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "#EF4444",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="user-info">
              <div className="user-avatar">
                <img
                  src={
                    user?.universityCardImage
                      ? user.universityCardImage.startsWith("http")
                        ? user.universityCardImage
                        : `http://localhost:8080${user.universityCardImage}`
                      : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="User Avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.fullName || "Pharmacist"}</span>
                <span className="user-role">{user?.roles?.[0] || "PHARMACIST"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        {activeView === "dashboard" && (
          <>
            <div className="page-header">
              <h1>Pharmacist Dashboard</h1>
              <p>Manage prescriptions and medicines</p>
            </div>
            <div className="stats-grid">
              {statistics.map((stat) => (
                <div key={stat.id} className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Prescription List */}
        {activeView === "prescriptions" && (
          <>
            <div className="page-header">
              <h1>Prescription List</h1>
              <p>Manage and review all prescriptions</p>
            </div>
            <PrescriptionList
              prescriptions={prescriptions}
              onVerify={handleVerify}
              onReject={handleReject}
              onPrint={handlePrint}
              onDetails={handleDetails}
            />
          </>
        )}

        {/* Notifications */}
        {activeView === "notifications" && (
          <NotificationsList refreshUnread={fetchUnreadCount} />
        )}

        {/* Profile */}
        {activeView === "profile" && (
          <PharmacistProfile userInfo={user} setUser={setUser} />
        )}
      </main>

    
    </div>
  );
};

export default PharmacistDashboard;
