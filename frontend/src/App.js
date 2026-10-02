import { useEffect, useState, useCallback } from "react";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintList from "./components/ComplaintList";
import { getComplaints, getStats } from "./api";

function App() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [complaintsRes, statsRes] = await Promise.all([getComplaints(), getStats()]);
      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
      setError("");
    } catch (err) {
      setError("Could not reach the backend API. Is it running?");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitted = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    loadData(); // refresh stats
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>AI-Powered Civic Grievance Analysis System</h1>
        <p>Submit civic issues and let NLP automatically categorize and analyze them.</p>
      </header>

      {error && <p style={{ color: "#c0392b" }}>{error}</p>}

      {stats && (
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <strong>{stats.total}</strong>
            <span>Total Complaints</span>
          </div>
          {Object.entries(stats.by_category).map(([cat, count]) => (
            <div style={styles.statCard} key={cat}>
              <strong>{count}</strong>
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}

      <ComplaintForm onSubmitted={handleSubmitted} />
      <ComplaintList complaints={complaints} />
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Segoe UI, Arial, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "2rem",
  },
  header: { marginBottom: "1.5rem" },
  stats: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" },
  statCard: {
    background: "#fff",
    padding: "12px 18px",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 100,
  },
};

export default App;
