import { useState } from "react";
import { createComplaint } from "../api";

export default function ComplaintForm({ onSubmitted }) {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.description.trim()) {
      setError("Please fill in your name and a description of the issue.");
      return;
    }
    setLoading(true);
    try {
      const res = await createComplaint(form);
      onSubmitted(res.data);
      setForm({ name: "", contact: "", description: "" });
    } catch (err) {
      setError("Something went wrong while submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Report a Civic Issue</h2>

      <label style={styles.label}>Your Name</label>
      <input
        style={styles.input}
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="e.g. Asha Sharma"
      />

      <label style={styles.label}>Contact (optional)</label>
      <input
        style={styles.input}
        name="contact"
        value={form.contact}
        onChange={handleChange}
        placeholder="Phone or email"
      />

      <label style={styles.label}>Describe the issue</label>
      <textarea
        style={{ ...styles.input, height: 100 }}
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Describe the civic issue in detail..."
      />

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    maxWidth: 480,
    marginBottom: "2rem",
  },
  label: { display: "block", marginTop: 10, marginBottom: 4, fontWeight: 600, fontSize: 14 },
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    marginTop: 16,
    padding: "10px 18px",
    background: "#1f3864",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
  },
  error: { color: "#c0392b", fontSize: 13, marginTop: 8 },
};
