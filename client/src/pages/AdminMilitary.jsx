import { useState, useEffect } from "react";
import api, { getMilitaryData } from "../services/api";

function AdminMilitary() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCountry, setCurrentCountry] = useState(null);
  const [formData, setFormData] = useState({
    country: "",
    code: "",
    region: "",
    strategicRegion: "",
    group: "",
    tanks: 0,
    armoredVehicles: 0,
    fighterJets: 0,
    helicopters: 0,
    warships: 0,
    submarines: 0,
    artillery: 0,
    activePersonnel: 0,
    reservePersonnel: 0,
    defenseBudget: 0,
    airPowerScore: 0,
    navalPowerScore: 0,
    landPowerScore: 0,
    strategicNotes: "",
  });

  useEffect(() => {
    fetchMilitaryData();
  }, []);

  const fetchMilitaryData = async () => {
    try {
      const res = await getMilitaryData();
      setCountries(res.data);
    } catch (err) {
      console.error("Failed to fetch military data:", err);
      setMessage("Failed to load military data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "group" ? value : (e.target.type === "number" ? Number(value) : value),
    });
  };

  const resetForm = () => {
    setFormData({
      country: "",
      code: "",
      region: "",
      strategicRegion: "",
      group: "",
      tanks: 0,
      armoredVehicles: 0,
      fighterJets: 0,
      helicopters: 0,
      warships: 0,
      submarines: 0,
      artillery: 0,
      activePersonnel: 0,
      reservePersonnel: 0,
      defenseBudget: 0,
      airPowerScore: 0,
      navalPowerScore: 0,
      landPowerScore: 0,
      strategicNotes: "",
    });
    setIsEditing(false);
    setCurrentCountry(null);
  };

  const handleEdit = (country) => {
    setFormData({
      ...country,
      group: Array.isArray(country.group) ? country.group.join(", ") : country.group,
    });
    setCurrentCountry(country);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this country?")) return;
    try {
      await api.delete(`/api/military/${id}`);
      setMessage("Country deleted successfully");
      fetchMilitaryData();
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("Failed to delete country");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      group: formData.group.split(",").map((g) => g.trim()).filter((g) => g !== ""),
    };

    try {
      if (isEditing) {
        await api.put(`/api/military/${currentCountry._id}`, dataToSend);
        setMessage("Country updated successfully");
      } else {
        await api.post("/api/military", dataToSend);
        setMessage("Country added successfully");
      }
      resetForm();
      fetchMilitaryData();
    } catch (err) {
      console.error("Submit failed:", err);
      setMessage("Failed to save country data");
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Military Data Management</h2>
        <p>Add, edit, or delete military records from the global database.</p>
      </div>
      
      {message && <p className={`message ${message.includes("Failed") ? "error" : "success"}`}>{message}</p>}

      <div className="admin-form-card">
        <h3>{isEditing ? "Edit Country" : "Add New Country"}</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Country Name</label>
              <input name="country" value={formData.country} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Country Code (e.g. USA)</label>
              <input name="code" value={formData.code} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input name="region" value={formData.region} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Strategic Region</label>
              <input name="strategicRegion" value={formData.strategicRegion} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Groups (comma separated)</label>
              <input name="group" value={formData.group} onChange={handleInputChange} placeholder="NATO, G20" />
            </div>
            <div className="form-group">
              <label>Defense Budget ($)</label>
              <input type="number" name="defenseBudget" value={formData.defenseBudget} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Active Personnel</label>
              <input type="number" name="activePersonnel" value={formData.activePersonnel} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Tanks</label>
              <input type="number" name="tanks" value={formData.tanks} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Fighter Jets</label>
              <input type="number" name="fighterJets" value={formData.fighterJets} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Warships</label>
              <input type="number" name="warships" value={formData.warships} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Submarines</label>
              <input type="number" name="submarines" value={formData.submarines} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-group full-width">
            <label>Strategic Notes</label>
            <textarea name="strategicNotes" value={formData.strategicNotes} onChange={handleInputChange} rows="3"></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">{isEditing ? "Update Country" : "Add Country"}</button>
            {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>
      
      {loading ? (
        <p>Loading military data...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Region</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c._id}>
                  <td>{c.country}</td>
                  <td>{c.region}</td>
                  <td>${(c.defenseBudget / 1e9).toFixed(1)}B</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(c)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminMilitary;
