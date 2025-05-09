import React, { useState } from "react";
import "./FormStyles.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const togglePassword = () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMessage(data.message || "Logged in!");
  };

  return (
    <section className="auth-section">
      <div className="leaf-bg"></div>
      <div className="login">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit} id="loginForm">
          <div className="inputBox">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="inputBox password-container">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span className="toggle-password" onClick={togglePassword}>👁️</span>
          </div>
          <div className="inputBox">
            <button type="submit" id="btn">Login</button>
          </div>
        </form>
        <div className="group">
          <a href="/register">No account yet? <span className="register-link">Register Now</span></a>
        </div>
        {message && <p className="error-message">{message}</p>}
      </div>
    </section>
  );
}
