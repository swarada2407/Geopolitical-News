import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Country coordinates (approximate)
const countryCoordinates = {
  'India': [20.5937, 78.9629],
  'China': [35.8617, 104.1954],
  'USA': [37.0902, -95.7129],
  'United States': [37.0902, -95.7129],
  'Russia': [61.5240, 105.3188],
  'Russian Federation': [61.5240, 105.3188],
  'UK': [55.3781, -3.4360],
  'United Kingdom': [55.3781, -3.4360],
  'France': [46.2276, 2.2137],
  'Germany': [51.1657, 10.4515],
  'Japan': [36.2048, 138.2529],
  'South Korea': [35.9078, 127.7669],
  'Brazil': [-14.2350, -51.9253],
  'Australia': [-25.2744, 133.7751],
  'Italy': [41.8719, 12.5674],
  'Canada': [56.1304, -106.3468],
  'Israel': [31.0461, 34.8516],
  'Turkey': [38.9637, 35.2433],
  'Egypt': [26.8206, 30.8025],
  'Saudi Arabia': [23.8859, 45.0792],
  'Pakistan': [30.3753, 69.3451],
  'Indonesia': [-0.7893, 113.9213],
  'Vietnam': [14.0583, 108.2772],
  'Poland': [51.9194, 19.1451],
  'Spain': [40.4637, -3.7492],
  'Greece': [39.0742, 21.8243],
  'Ukraine': [48.3794, 31.1656],
  'Iran': [32.4279, 53.6880],
  'South Africa': [-30.5595, 22.9375],
  'Mexico': [23.6345, -102.5528],
  'Argentina': [-38.4161, -63.6167],
  'Colombia': [4.5709, -74.2973],
  'Philippines': [12.8797, 121.7740],
  'Thailand': [15.8700, 100.9925],
  'Singapore': [1.3521, 103.8198],
  'Nigeria': [9.0820, 8.6753],
  'Ethiopia': [9.1450, 40.4897],
  'Algeria': [28.0339, 1.6596],
  'Morocco': [31.7917, -7.0926],
  'Norway': [60.4720, 8.4689],
  'Sweden': [60.1282, 18.6435],
  'Finland': [61.9241, 25.7482],
  'Chile': [-35.6751, -71.5430]
};

// Country name mappings for GeoJSON
const countryNameMapping = {
  'United States of America': 'United States',
  'United States': 'United States',
  'United Kingdom': 'United Kingdom',
  'South Korea': 'South Korea',
  'Russian Federation': 'Russia',
  'Russia': 'Russia',
  'India': 'India',
  'China': 'China',
  'France': 'France',
  'Germany': 'Germany',
  'Japan': 'Japan',
  'Brazil': 'Brazil',
  'Australia': 'Australia',
  'Italy': 'Italy',
  'Canada': 'Canada',
  'Israel': 'Israel',
  'Turkey': 'Turkey',
  'Egypt': 'Egypt',
  'Saudi Arabia': 'Saudi Arabia',
  'Pakistan': 'Pakistan',
  'Indonesia': 'Indonesia',
  'Vietnam': 'Vietnam',
  'Poland': 'Poland',
  'Spain': 'Spain',
  'Greece': 'Greece',
  'Ukraine': 'Ukraine',
  'Iran': 'Iran',
  'South Africa': 'South Africa',
  'Mexico': 'Mexico',
  'Argentina': 'Argentina',
  'Colombia': 'Colombia',
  'Philippines': 'Philippines',
  'Thailand': 'Thailand',
  'Singapore': 'Singapore',
  'Nigeria': 'Nigeria',
  'Ethiopia': 'Ethiopia',
  'Algeria': 'Algeria',
  'Morocco': 'Morocco',
  'Norway': 'Norway',
  'Sweden': 'Sweden',
  'Finland': 'Finland',
  'Chile': 'Chile'
};

const MilitaryMap = ({ selectedCountry, onCountrySelect, militaryData = [] }) => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Load world countries GeoJSON
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading map data:', error);
        setLoading(false);
      });
  }, []);

  // Auto-zoom to selected country
  useEffect(() => {
    if (map && selectedCountry && countryCoordinates[selectedCountry]) {
      const coords = countryCoordinates[selectedCountry];
      map.flyTo(coords, 5, {
        duration: 1.5
      });
    }
  }, [selectedCountry, map]);

  const getMarkerColor = (countryName) => {
    if (!militaryData || militaryData.length === 0) return 'gray';

    const country = militaryData.find(c =>
      c.country.toLowerCase() === countryName.toLowerCase()
    );

    if (!country) return 'gray';

    // Color based on military strength (defense budget)
    const maxBudget = Math.max(...militaryData.map(c => c.defenseBudget || 0)) || 1;
    const intensity = (country.defenseBudget || 0) / maxBudget;

    if (intensity > 0.8) return 'red';
    if (intensity > 0.6) return 'orange';
    if (intensity > 0.4) return 'yellow';
    if (intensity > 0.2) return 'green';
    return 'blue';
  };

  const createCustomIcon = () => {
    const isSelected = militaryData?.some(c => c.country === selectedCountry);

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        transition: all 0.3s ease;
        ${isSelected ? 'transform: scale(1.3) translateY(-3px); filter: drop-shadow(0 0 6px #1d4ed8);' : ''}
      ">🎖️</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 18]
    });
  };

  const onEachCountry = (country, layer) => {
    const geoJsonName = country.properties.ADMIN || country.properties.name;
    const mappedName = countryNameMapping[geoJsonName];
    const countryData = militaryData.find(c =>
      c.country.toLowerCase() === (mappedName || geoJsonName)?.toLowerCase()
    );

    if (countryData) {
      const isSelected = selectedCountry === countryData.country;

      layer.setStyle({
        fillColor: 'transparent',
        weight: isSelected ? 2 : 0,
        color: isSelected ? '#2563eb' : 'transparent',
        fillOpacity: 0,
        opacity: isSelected ? 1 : 0
      });

      layer.on({
        click: () => onCountrySelect(countryData.country),
        mouseover: (e) => {
          if (!isSelected) {
            const layer = e.target;
            layer.setStyle({
              weight: 1.5,
              color: '#93c5fd',
              opacity: 0.7
            });
          }
        },
        mouseout: (e) => {
          if (!isSelected) {
            const layer = e.target;
            layer.setStyle({
              weight: 0,
              color: 'transparent',
              opacity: 0
            });
          }
        }
      });
    } else {
      layer.setStyle({
        fillColor: 'transparent',
        weight: 0,
        color: 'transparent',
        fillOpacity: 0,
        opacity: 0
      });
    }
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="map-skeleton"></div>
        <p>Loading world map...</p>
      </div>
    );
  }

  return (
    <div className="military-map-container">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%' }}
        className="military-map"
        ref={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Country boundaries */}
        {geoData && (
          <GeoJSON
            data={geoData}
            onEachFeature={onEachCountry}
            style={{ weight: 1, color: '#666', fillOpacity: 0 }}
          />
        )}

        {/* Country markers */}
        {militaryData.map((country) => {
          const coords = countryCoordinates[country.country];
          if (!coords) return null;

          return (
            <Marker
              key={country.country}
              position={coords}
              icon={createCustomIcon()}
              eventHandlers={{
                click: () => onCountrySelect(country.country),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3>{country.country}</h3>
                  <p><strong>Region:</strong> {country.strategicRegion}</p>
                  <p><strong>Defense Budget:</strong> ${formatBudget(country.defenseBudget)}</p>
                  <p><strong>Active Personnel:</strong> {country.activePersonnel.toLocaleString()}</p>
                  <p><strong>Tanks:</strong> {country.tanks.toLocaleString()}</p>
                  <p><strong>Fighter Jets:</strong> {country.fighterJets.toLocaleString()}</p>
                  <button
                    onClick={() => onCountrySelect(country.country)}
                    className="popup-btn"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
              <Tooltip>{country.country}</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="map-instructions">
        <p>🖱️ <strong>Click markers or boundaries</strong> to select countries</p>
        <p>🎨 <strong>Marker colors</strong> show defense budget strength</p>
        <p>🔵 <strong>Blue boundaries</strong> highlight selected country</p>
        <p>📍 <strong>Auto-zoom</strong> when country is selected</p>
      </div>
    </div>
  );
};

const formatBudget = (value) => {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  return `${value}`;
};

export default MilitaryMap;