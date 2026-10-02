import "./ComplaintList.css";
import { CATEGORY_COLORS, SENTIMENT_COLORS } from "../theme";

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(isoString).toLocaleDateString();
}

export default function ComplaintList({ complaints }) {
  if (!complaints.length) {
    return (
      <div className="empty-state">
        No reports yet. File the first one using the form.
      </div>
    );
  }

  return (
    <div className="case-list">
      {complaints.map((c) => {
        const color = CATEGORY_COLORS[c.category] || "#888";
        return (
          <div key={c.id} className="case-row" style={{ borderLeftColor: color }}>
            <div className="case-head">
              <span className="case-name">{c.name}</span>
              <span className="case-time">{timeAgo(c.created_at)}</span>
            </div>
            <p className="case-desc">{c.description}</p>
            <div className="case-tags">
              <span className="tag" style={{ background: color }}>
                {c.category}
              </span>
              <span
                className="tag"
                style={{ background: SENTIMENT_COLORS[c.sentiment_label] || "#888" }}
              >
                {c.sentiment_label}
              </span>
              <span className="tag outline">{Math.round(c.confidence * 100)}% confidence</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
