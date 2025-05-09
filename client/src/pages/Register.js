import React, { useState } from "react";
import "./FormStyles.css";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || "Registered successfully!");
  };

  return (
    <section className="auth-section">
      <div className="leaf-bg"></div>
      <div className="register">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="inputBox">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="inputBox">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="inputBox">
            <button type="submit" id="btn">Register</button>
          </div>
        </form>
        {message && <p className="error-message">{message}</p>}
      </div>
    </section>
  );
}
