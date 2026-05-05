import { useState, useEffect } from "react";
import { getAllUsers } from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setMessage("Failed to load users. Please check if you have admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>User Management</h2>
        <p>Manage registered users, roles, and system permissions.</p>
      </div>
      
      {message && <p className="auth-error">{message}</p>}

      <div className="admin-form-card">
        <h3>User List</h3>
        {loading ? (
          <div className="status-box">
            <p>Loading user data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="status-box">
            <p>No users found in the system.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Quizzes</th>
                  <th>Saved News</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user.avatar && <img src={user.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.quizCount || 0}</td>
                    <td>{user.savedNewsCount || 0}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
