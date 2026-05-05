function AdminSettings() {
  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>System Settings</h2>
        <p>Configure global website parameters, AI integrations, and API keys.</p>
      </div>
      
      <div className="admin-form-card">
        <h3>Configuration Panel</h3>
        <div className="status-box" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '10px' }}>Settings module in development</h3>
          <p style={{ color: 'var(--muted)' }}>Global system configuration and API management will be centralized here in the next version.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
