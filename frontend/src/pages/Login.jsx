import { useState } from "react";
import { login } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login({ email, password }); // call backend
      navigate("/houses", { replace: true }); // go to houses
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="page">
      <div className="auth-card">
        <h2 className="page-title">Login</h2>
        <p className="text-muted mb-sm">
          Welcome back. Sign in to manage listings, swaps, and messages.
        </p>

        <form onSubmit={handleSubmit} className="stack-sm">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error ? <div className="text-error">{error}</div> : null}

          <button type="submit">Login</button>
        </form>

        <p className="text-muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
