import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleAuth } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await login({ email, password });
      
      if (data.token) {
        localStorage.setItem("geointelx_token", data.token);
        localStorage.setItem("geointelx_logged_in", JSON.stringify(data));
        navigate("/");
      } else {
        setError("Login successful but no token received.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Show the specific error message from the backend if available
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(response) {
    setLoading(true);
    setError("");
    try {
      const { data } = await googleAuth(response.credential);
      if (data.token) {
        localStorage.setItem("geointelx_token", data.token);
        localStorage.setItem("geointelx_logged_in", JSON.stringify(data));
        navigate("/");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth auth-modern">
      <div className="auth-badge">Welcome Back</div>
      <h1>Login</h1>
      <p className="auth-subtext">Access your personalized global intelligence dashboard.</p>

      {error && <p className="auth-error">{error}</p>}

      <div className="google-auth-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed")}
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
          shape="pill"
        />
      </div>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--blue)', textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="auth-switch">
        Don’t have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

export default Login;