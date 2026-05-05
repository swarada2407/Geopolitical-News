function Profile() {
  const loggedInUser = JSON.parse(localStorage.getItem("geointelx_logged_in"));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Review your account details and profile information.</p>
      </div>

      <div className="status-box">
        <h3>{loggedInUser?.name || "No user found"}</h3>
        <p>Email: {loggedInUser?.email || "—"}</p>
        <p>Role: {loggedInUser?.role || "User"}</p>
        <p>Member since: {loggedInUser?.createdAt || "Not available"}</p>
      </div>
    </div>
  );
}

export default Profile;
