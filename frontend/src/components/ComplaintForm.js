import { useState } from "react";
import "./ComplaintForm.css";
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
      setError("Add your name and a description before filing.");
      return;
    }
    setLoading(true);
    try {
      const res = await createComplaint(form);
      onSubmitted(res.data);
      setForm({ name: "", contact: "", description: "" });
    } catch (err) {
      setError("The report didn't go through. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Asha Sharma"
        />
      </div>

      <div className="field">
        <label htmlFor="contact">
          Contact <span className="hint">(optional)</span>
        </label>
        <input
          id="contact"
          name="contact"
          value={form.contact}
          onChange={handleChange}
          placeholder="Phone or email"
        />
      </div>

      <div className="field">
        <label htmlFor="description">What's the issue?</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe what's happening, and where."
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Filing report…" : "File report"}
      </button>
    </form>
  );
}
