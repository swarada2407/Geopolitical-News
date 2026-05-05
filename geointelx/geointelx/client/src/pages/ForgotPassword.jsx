import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth auth-modern">
      <div className="auth-badge">Security</div>
      <h1>Forgot Password</h1>
      <p className="auth-subtext">Enter your email address and we'll send you a link to reset your password.</p>

      {message && <p className="message success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
