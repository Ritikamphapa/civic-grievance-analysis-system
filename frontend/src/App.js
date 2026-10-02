import { useEffect, useState, useCallback } from "react";
import "./App.css";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintList from "./components/ComplaintList";
import { getComplaints, getStats } from "./api";
import { CATEGORY_COLORS } from "./theme";

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
      setError("Can't reach the backend API right now. Make sure it's running, then refresh.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitted = (newComplaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    loadData();
  };

  return (
    <div className="page">
      <header className="banner">
        <div className="seal">CG</div>
        <div>
          <h1>Civic Grievance Desk</h1>
          <p>Report a local issue. It's classified and routed automatically.</p>
        </div>
      </header>

      {stats && (
        <div className="stat-strip">
          <div className="stat-total">
            {stats.total}
            <span>reports filed</span>
          </div>
          {Object.entries(stats.by_category).map(([cat, count]) => (
            <div className="stat-chip" key={cat}>
              <span className="dot" style={{ background: CATEGORY_COLORS[cat] || "#888" }} />
              {cat} &middot; {count}
            </div>
          ))}
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      <div className="layout">
        <div className="form-col">
          <p className="section-label">File a report</p>
          <ComplaintForm onSubmitted={handleSubmitted} />
        </div>
        <div className="log-col">
          <p className="section-label">Case log</p>
          <ComplaintList complaints={complaints} />
        </div>
      </div>

      <div className="legend">
        Category colors follow the standard utility-marking code:
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span className="dot" style={{ background: color }} />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
