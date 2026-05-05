import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaNewspaper, FaShieldAlt, FaBrain, FaBookmark } from "react-icons/fa";

function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("geointelx_logged_in"));

  function handleLogout() {
    localStorage.removeItem("geointelx_logged_in");
    localStorage.removeItem("geointelx_token");
    setMenuOpen(false);
    navigate("/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="burger-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <NavLink to="/" className="topbar-brand" onClick={closeSidebar}>
            🌍 GeoIntelX
          </NavLink>
        </div>

        <div className="topbar-right">
          {loggedInUser ? (
            <div className="profile-wrapper" ref={dropdownRef}>
              <div
                className="profile-icon"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {loggedInUser.name?.charAt(0).toUpperCase()}
              </div>

              {menuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {loggedInUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="profile-name">{loggedInUser.name}</p>
                      <p className="profile-email">{loggedInUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/profile")}>View profile</button>
                  {loggedInUser.role === "admin" && (
                    <button onClick={() => navigate("/admin")}>Admin Dashboard</button>
                  )}
                  <button onClick={() => navigate("/settings")}>Account settings</button>
                  <button onClick={() => navigate("/saved")}>Saved</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="signin-btn"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <nav className="menu">
          <NavLink to="/" onClick={closeSidebar}>
            <FaHome className="menu-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/news" onClick={closeSidebar}>
            <FaNewspaper className="menu-icon" />
            <span>News</span>
          </NavLink>

          <NavLink to="/military" onClick={closeSidebar}>
            <FaShieldAlt className="menu-icon" />
            <span>Military</span>
          </NavLink>

          <NavLink to="/saved" onClick={closeSidebar}>
            <FaBookmark className="menu-icon" />
            <span>Saved</span>
          </NavLink>

          <NavLink to="/test" onClick={closeSidebar}>
            <FaBrain className="menu-icon" />
            <span>Test</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Navbar;