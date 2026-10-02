const categoryColors = {
  "Water Supply": "#2980b9",
  Electricity: "#f39c12",
  "Roads & Infrastructure": "#7f8c8d",
  "Sanitation & Garbage": "#27ae60",
  "Public Safety": "#c0392b",
  Other: "#8e44ad",
};

const sentimentColors = {
  Positive: "#27ae60",
  Neutral: "#7f8c8d",
  Negative: "#c0392b",
};

export default function ComplaintList({ complaints }) {
  if (!complaints.length) {
    return <p>No complaints yet. Submit one using the form above.</p>;
  }

  return (
    <div>
      <h2>Recent Complaints ({complaints.length})</h2>
      <div style={styles.list}>
        {complaints.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <strong>{c.name}</strong>
              <span style={styles.date}>
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <p style={styles.description}>{c.description}</p>
            <div style={styles.tags}>
              <span
                style={{ ...styles.tag, background: categoryColors[c.category] || "#555" }}
              >
                {c.category} ({Math.round(c.confidence * 100)}%)
              </span>
              <span
                style={{
                  ...styles.tag,
                  background: sentimentColors[c.sentiment_label] || "#555",
                }}
              >
                {c.sentiment_label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#fff",
    padding: "1rem",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", fontSize: 14 },
  date: { color: "#888" },
  description: { margin: "8px 0" },
  tags: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    color: "#fff",
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 12,
  },
};
