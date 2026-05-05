import { useState, useEffect } from "react";
import AdminMilitary from "./AdminMilitary";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";
import api, { getQuizStats } from "../services/api";

function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({
    countries: 0,
    totalBudget: 0,
    activePersonnel: 0,
    users: 1,
    totalQuizzes: 0,
    avgQuizScore: 0,
    topicStats: []
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [milRes, quizRes, userRes] = await Promise.all([
          api.get("/military"),
          getQuizStats(),
          api.get("/auth/users")
        ]);

        const countries = milRes.data;
        const totalBudget = countries.reduce((sum, c) => sum + (c.defenseBudget || 0), 0);
        const totalPersonnel = countries.reduce((sum, c) => sum + (c.activePersonnel || 0), 0);
        
        setStats(prev => ({
          ...prev,
          countries: countries.length,
          totalBudget,
          activePersonnel: totalPersonnel,
          users: userRes.data.length,
          totalQuizzes: quizRes.data.totalQuizzes,
          avgQuizScore: quizRes.data.averageScore,
          topicStats: quizRes.data.topicStats
        }));
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    return `$${(value / 1e6).toFixed(0)}M`;
  };

  const formatNumber = (value) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value;
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>GeoIntelX Admin</h2>
        </div>
        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${tab === "overview" ? "active" : ""}`}
            onClick={() => setTab("overview")}
          >
            Dashboard Overview
          </button>
          <button 
            className={`admin-nav-item ${tab === "military" ? "active" : ""}`}
            onClick={() => setTab("military")}
          >
            Military Database
          </button>
          <button 
            className={`admin-nav-item ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            User Management
          </button>
          <button 
            className={`admin-nav-item ${tab === "settings" ? "active" : ""}`}
            onClick={() => setTab("settings")}
          >
            System Settings
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {tab === "overview" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Dashboard Overview</h2>
              <p>System-wide summary and quick actions.</p>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span>Tracked Countries</span>
                <h3>{stats.countries}</h3>
              </div>
              <div className="admin-stat-card">
                <span>Quizzes Completed</span>
                <h3>{stats.totalQuizzes}</h3>
              </div>
              <div className="admin-stat-card">
                <span>Avg. Quiz Score</span>
                <h3>{stats.avgQuizScore}%</h3>
              </div>
              <div className="admin-stat-card">
                <span>System Users</span>
                <h3>{stats.users}</h3>
              </div>
            </div>

            <div className="admin-dashboard-layout">
              <div className="admin-form-card">
                <h3>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="btn-save" onClick={() => setTab("military")}>Add Military Data</button>
                  <button className="btn-cancel" onClick={() => setTab("users")}>Manage Users</button>
                </div>
              </div>

              {stats.topicStats.length > 0 && (
                <div className="admin-form-card">
                  <h3>Popular Quiz Topics</h3>
                  <div className="popular-topics-list">
                    {stats.topicStats.slice(0, 5).map((t, i) => (
                      <div key={i} className="topic-stat-row">
                        <span>{t._id}</span>
                        <span className="topic-count">{t.count} attempts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "military" && <AdminMilitary />}
        {tab === "users" && <AdminUsers />}
        {tab === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}

export default AdminDashboard;