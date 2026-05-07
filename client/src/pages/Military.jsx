import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import api, { searchNews, getMilitaryData } from "../services/api";
import MilitaryMap from "../components/MilitaryMap";
import { highlightText } from "../utils/searchUtils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function formatBudget(value) {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value}`;
}

function getGdp(item) {
  if (!item) return 0;
  if (item.gdp && item.gdp > 0) return item.gdp;
  const defaultDefenseShare = 0.028;
  return item.defenseBudget ? Math.round(item.defenseBudget / defaultDefenseShare) : 0;
}

function StrengthMeter({ label, value, color }) {
  return (
    <div className="strength-meter">
      <div className="strength-label-row">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="strength-track">
        <div
          className="strength-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function MilitaryDashboard() {
  const [militaryData, setMilitaryData] = useState([]);
  const [countryA, setCountryA] = useState("India");
  const [countryB, setCountryB] = useState("China");
  const [tab, setTab] = useState("overview");
  const [countryInfo, setCountryInfo] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");

  useEffect(() => {
    async function fetchMilitaryData() {
      try {
        const res = await getMilitaryData();
        setMilitaryData(res.data);
        if (res.data.length > 0) {
          // Check if default countries exist in fetched data
          const hasIndia = res.data.some(c => c.country === "India");
          const hasChina = res.data.some(c => c.country === "China");
          if (!hasIndia) setCountryA(res.data[0].country);
          if (!hasChina && res.data.length > 1) setCountryB(res.data[1].country);
        }
      } catch (err) {
        console.error("Failed to fetch military data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchMilitaryData();
  }, []);

  const filteredCountries = useMemo(() => {
    return militaryData.filter((item) => {
      const matchesSearch = item.country.toLowerCase().includes(search.toLowerCase());
      const matchesGroup =
        groupFilter === "All" || item.group.includes(groupFilter);
      return matchesSearch && matchesGroup;
    });
  }, [search, groupFilter, militaryData]);

  const selectedA = useMemo(
    () => militaryData.find((item) => item.country === countryA) || militaryData[0],
    [countryA, militaryData]
  );

  const selectedB = useMemo(
    () => militaryData.find((item) => item.country === countryB) || militaryData[1],
    [countryB, militaryData]
  );

  useEffect(() => {
    async function loadCountryInfo() {
      setLoadingInfo(true);
      try {
        const res = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(
            countryA
          )}?fullText=true`
        );
        const data = await res.json();
        setCountryInfo(data?.[0] || null);
      } catch (error) {
        console.log(error);
        setCountryInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    }

    loadCountryInfo();
  }, [countryA]);

  useEffect(() => {
    async function loadRelatedNews() {
      setLoadingNews(true);
      try {
        const query = `${countryA} military OR defence OR air force OR navy`;
        const { data } = await searchNews(query);
        setRelatedNews(data || []);
      } catch (error) {
        console.error("Military news fetch error:", error);
        setRelatedNews([]);
      } finally {
        setLoadingNews(false);
      }
    }

    loadRelatedNews();
  }, [countryA]);

  const comparisonData = useMemo(() => {
    if (!selectedA || !selectedB) {
      return {
        labels: ["Tanks", "Jets", "Submarines", "Budget (B USD)", "GDP (T USD)", "Manpower"],
        datasets: []
      };
    }

    return {
      labels: ["Tanks", "Jets", "Submarines", "Budget (B USD)", "GDP (T USD)", "Manpower"],
      datasets: [
        {
          label: selectedA.country,
          data: [
            selectedA.tanks || 0,
            selectedA.fighterJets || 0,
            selectedA.submarines || 0,
            Math.round((selectedA.defenseBudget || 0) / 1_000_000_000),
            Math.round(getGdp(selectedA) / 1_000_000_000_000),
            Math.round((selectedA.activePersonnel || 0) / 1000),
          ],
          backgroundColor: "rgba(37, 99, 235, 0.7)",
          borderColor: "rgba(37, 99, 235, 1)",
          borderWidth: 1,
        },
        {
          label: selectedB.country,
          data: [
            selectedB.tanks || 0,
            selectedB.fighterJets || 0,
            selectedB.submarines || 0,
            Math.round((selectedB.defenseBudget || 0) / 1_000_000_000),
            Math.round(getGdp(selectedB) / 1_000_000_000_000),
            Math.round((selectedB.activePersonnel || 0) / 1000),
          ],
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [selectedA, selectedB]);

  const comparisonOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Country Military Comparison" },
    },
  };

  const topByTanks = [...militaryData].sort((a, b) => b.tanks - a.tanks).slice(0, 10);
  const topByJets = [...militaryData].sort((a, b) => b.fighterJets - a.fighterJets).slice(0, 10);
  const topByBudget = [...militaryData]
    .sort((a, b) => b.defenseBudget - a.defenseBudget)
    .slice(0, 10);
  const topByNavy = [...militaryData].sort((a, b) => b.warships - a.warships).slice(0, 10);
  const topByPersonnel = [...militaryData]
    .sort((a, b) => b.activePersonnel - a.activePersonnel)
    .slice(0, 10);

  if (loadingData) {
    return (
      <div className="military-page">
        <div className="page-header">
          <h1 className="page-title">Military Intelligence Dashboard</h1>
          <p className="page-subtitle">Loading military data...</p>
        </div>
        <div className="loading-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (militaryData.length === 0) {
    return (
      <div className="military-page">
        <div className="page-header">
          <h1 className="page-title">Military Intelligence Dashboard</h1>
          <p className="page-subtitle">No military data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="military-page">
      <div className="page-header">
        <h1 className="page-title">Military Intelligence Dashboard</h1>
        <p className="page-subtitle">
          Country-level defence capability, comparison, charts, rankings, and related news.
        </p>
      </div>

      <div className="military-toolbar">
        <div className="military-toolbar-group">
          <label>Select Country</label>
          <select value={countryA} onChange={(e) => setCountryA(e.target.value)}>
            {militaryData.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </select>
        </div>

        <div className="military-toolbar-group">
          <label>Compare With</label>
          <select value={countryB} onChange={(e) => setCountryB(e.target.value)}>
            {militaryData.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </select>
        </div>

        <div className="military-toolbar-group">
          <label>Search Country</label>
          <input
            type="text"
            placeholder="Search country"
            value={search}
            onChange={(e) => {
              const query = e.target.value;
              setSearch(query);
              
              // Find matching country and update selection
              if (query.trim()) {
                const matchedCountry = militaryData.find((item) =>
                  item.country.toLowerCase().includes(query.toLowerCase())
                );
                if (matchedCountry) {
                  setCountryA(matchedCountry.country);
                }
              }
            }}
          />
        </div>

        <div className="military-toolbar-group">
          <label>Filter Group</label>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="NATO">NATO</option>
            <option value="BRICS">BRICS</option>
            <option value="G20">G20</option>
          </select>
        </div>
      </div>

      <div className="military-tabs">
        {["overview", "land", "air", "naval", "comparison", "map", "news", "rankings"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item === "land" && "Land Forces"}
            {item === "air" && "Air Forces"}
            {item === "naval" && "Naval Forces"}
            {item === "overview" && "Overview"}
            {item === "comparison" && "Comparison"}
            {item === "map" && "World Map"}
            {item === "news" && "Related News"}
            {item === "rankings" && "Rankings"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="country-compare-grid">
            <div className="country-card-large">
              <div className="country-card-header">
                {loadingInfo ? (
                  <div className="flag-skeleton"></div>
                ) : countryInfo?.flags?.png ? (
                  <img
                    src={countryInfo.flags.png}
                    alt={selectedA.country}
                    className="country-flag"
                  />
                ) : (
                  <div className="flag-skeleton"></div>
                )}

                <div>
                  <h2>{selectedA.country}</h2>
                  <p>{selectedA.strategicRegion}</p>
                  <p>{selectedA.region}</p>
                  <p>Capital: {countryInfo?.capital?.[0] || "N/A"}</p>
                  <p>Population: {countryInfo?.population?.toLocaleString() || "N/A"}</p>
                  <p>Area: {countryInfo?.area?.toLocaleString() || "N/A"} km²</p>
                </div>
              </div>

              <div className="strategic-note">
                <h4>Strategic Notes</h4>
                <p>{selectedA.strategicNotes}</p>
              </div>

              <div className="strength-box">
                <StrengthMeter
                  label="Air Power"
                  value={selectedA.airPowerScore}
                  color="linear-gradient(90deg, #3b82f6, #06b6d4)"
                />
                <StrengthMeter
                  label="Naval Power"
                  value={selectedA.navalPowerScore}
                  color="linear-gradient(90deg, #2563eb, #1d4ed8)"
                />
                <StrengthMeter
                  label="Land Power"
                  value={selectedA.landPowerScore}
                  color="linear-gradient(90deg, #10b981, #22c55e)"
                />
              </div>
            </div>

            <div className="country-card-large compare-card">
              <h3>{selectedA.country} vs {selectedB.country}</h3>
              <div className="compare-mini-grid">
                <div><span>Tanks</span><strong>{selectedA.tanks.toLocaleString()} vs {selectedB.tanks.toLocaleString()}</strong></div>
                <div><span>Jets</span><strong>{selectedA.fighterJets.toLocaleString()} vs {selectedB.fighterJets.toLocaleString()}</strong></div>
                <div><span>Warships</span><strong>{selectedA.warships.toLocaleString()} vs {selectedB.warships.toLocaleString()}</strong></div>
                <div><span>Submarines</span><strong>{selectedA.submarines.toLocaleString()} vs {selectedB.submarines.toLocaleString()}</strong></div>
                <div><span>Personnel</span><strong>{selectedA.activePersonnel.toLocaleString()} vs {selectedB.activePersonnel.toLocaleString()}</strong></div>
                <div><span>Budget</span><strong>{formatBudget(selectedA.defenseBudget)} vs {formatBudget(selectedB.defenseBudget)}</strong></div>
                <div><span>GDP</span><strong>{formatBudget(getGdp(selectedA))} vs {formatBudget(getGdp(selectedB))}</strong></div>
              </div>
            </div>
          </div>

          <div className="military-stats-grid">
            <div className="military-stat-card"><p>Number of Tanks</p><h3>{selectedA.tanks.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Armored Vehicles</p><h3>{selectedA.armoredVehicles.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Fighter Jets</p><h3>{selectedA.fighterJets.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Helicopters</p><h3>{selectedA.helicopters.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Warships</p><h3>{selectedA.warships.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Submarines</p><h3>{selectedA.submarines.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Artillery / Rocket Systems</p><h3>{selectedA.artillery.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Active Personnel</p><h3>{selectedA.activePersonnel.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Reserve Personnel</p><h3>{selectedA.reservePersonnel.toLocaleString()}</h3></div>
            <div className="military-stat-card"><p>Defence Budget</p><h3>{formatBudget(selectedA.defenseBudget)}</h3></div>
            <div className="military-stat-card"><p>GDP</p><h3>{formatBudget(getGdp(selectedA))}</h3></div>
            <div className="military-stat-card"><p>Air Power Score</p><h3>{selectedA.airPowerScore}%</h3></div>
            <div className="military-stat-card"><p>Naval Power Score</p><h3>{selectedA.navalPowerScore}%</h3></div>
            <div className="military-stat-card"><p>Land Power Score</p><h3>{selectedA.landPowerScore}%</h3></div>
          </div>
        </>
      )}

      {tab === "land" && (
        <div className="military-stats-grid">
          <div className="military-stat-card"><p>Number of Tanks</p><h3>{selectedA.tanks.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Armored Vehicles</p><h3>{selectedA.armoredVehicles.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Artillery / Rocket Systems</p><h3>{selectedA.artillery.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Active Personnel</p><h3>{selectedA.activePersonnel.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Reserve Personnel</p><h3>{selectedA.reservePersonnel.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Land Power Score</p><h3>{selectedA.landPowerScore}%</h3></div>
        </div>
      )}

      {tab === "air" && (
        <div className="military-stats-grid">
          <div className="military-stat-card"><p>Fighter Jets</p><h3>{selectedA.fighterJets.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Helicopters</p><h3>{selectedA.helicopters.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Air Power Score</p><h3>{selectedA.airPowerScore}%</h3></div>
        </div>
      )}

      {tab === "naval" && (
        <div className="military-stats-grid">
          <div className="military-stat-card"><p>Warships</p><h3>{selectedA.warships.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Submarines</p><h3>{selectedA.submarines.toLocaleString()}</h3></div>
          <div className="military-stat-card"><p>Naval Power Score</p><h3>{selectedA.navalPowerScore}%</h3></div>
        </div>
      )}

      {tab === "comparison" && (
        <div className="chart-panel">
          <Bar data={comparisonData} options={comparisonOptions} />
        </div>
      )}

      {tab === "map" && (
        <div className="map-panel">
          <MilitaryMap 
            selectedCountry={selectedA.country} 
            onCountrySelect={setCountryA} 
            militaryData={militaryData} 
          />
        </div>
      )}

      {tab === "news" && (
        <div className="news-grid">
          {loadingNews && <p>Loading related military news...</p>}
          {!loadingNews && relatedNews.length === 0 && (
            <div className="status-box">
              <h3>No related military news found</h3>
              <p>Try another country.</p>
            </div>
          )}
          {!loadingNews &&
            relatedNews.map((news, index) => (
              <article key={index} className="news-card">
                {news.urlToImage && <img src={news.urlToImage} alt={news.title} />}
                <div className="news-card-body">
                  <p className="source">{highlightText(news.source?.name || "News Source", search)}</p>
                  <h3>{highlightText(news.title, search)}</h3>
                  <p>{highlightText(news.description || "Read more for full details.", search)}</p>
                  <div className="btn-center">
                    <a href={news.url} target="_blank" rel="noreferrer">
                      <button className="read-btn">Read Article</button>
                    </a>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}

      {tab === "rankings" && (
        <div className="ranking-grid">
          <div className="ranking-card">
            <h3>Top 10 by Tanks</h3>
            {topByTanks.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {c.country}</span>
                <strong>{c.tanks.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="ranking-card">
            <h3>Top 10 by Jets</h3>
            {topByJets.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {c.country}</span>
                <strong>{c.fighterJets.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="ranking-card">
            <h3>Top 10 by Budget</h3>
            {topByBudget.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {c.country}</span>
                <strong>{formatBudget(c.defenseBudget)}</strong>
              </div>
            ))}
          </div>

          <div className="ranking-card">
            <h3>Top 10 by Navy</h3>
            {topByNavy.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {c.country}</span>
                <strong>{c.warships.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="ranking-card">
            <h3>Top 10 by Personnel</h3>
            {topByPersonnel.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {c.country}</span>
                <strong>{c.activePersonnel.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="ranking-card">
            <h3>Filtered Countries</h3>
            {filteredCountries.map((c, i) => (
              <div key={c.country} className="ranking-row">
                <span>{i + 1}. {highlightText(c.country, search)}</span>
                <strong>{c.group.join(", ")}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MilitaryDashboard;