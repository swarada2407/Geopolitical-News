import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, googleAuth } from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic frontend email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await register({ name, email, password });
      
      localStorage.setItem("geointelx_token", data.token);
      localStorage.setItem("geointelx_logged_in", JSON.stringify(data));
      
      setMessage("Account created successfully. Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error("Registration failed:", err);
      setMessage(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(response) {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await googleAuth(response.credential);
      if (data.token) {
        localStorage.setItem("geointelx_token", data.token);
        localStorage.setItem("geointelx_logged_in", JSON.stringify(data));
        setMessage("Logged in with Google. Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 800);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      setMessage("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth auth-modern">
      <div className="auth-badge">Join GeoIntelX</div>
      <h1>Create Account</h1>
      <p className="auth-subtext">Start exploring world news, defense insights, and interactive tests.</p>

      {message && <p className="auth-info">{message}</p>}

      <div className="google-auth-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setMessage("Google registration failed")}
          theme="outline"
          size="large"
          width="100%"
          text="signup_with"
          shape="pill"
        />
      </div>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;