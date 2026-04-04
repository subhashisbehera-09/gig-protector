import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_COORDS, ZONE_CIRCLES, calculateRiskFromML } from '../utils/zoneUtils';

const RISK_COLORS = {
  EXTREME: { color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.5, weight: 3 },
  HIGH: { color: '#ea580c', fillColor: '#f97316', fillOpacity: 0.5, weight: 3 },
  MEDIUM: { color: '#ca8a04', fillColor: '#eab308', fillOpacity: 0.4, weight: 2 },
  LOW: { color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.4, weight: 2 },
};

const hospitalIcon = L.divIcon({
  className: '',
  html: `<div style="
    position: relative;
    width: 44px;
    height: 54px;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="
      font-size: 36px;
      line-height: 1;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
      animation: bounce 2s ease-in-out infinite;
    ">🏥</div>
    <div style="
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 10px solid #ef4444;
      margin-top: -4px;
    "></div>
  </div>`,
  iconSize: [44, 54],
  iconAnchor: [22, 54],
  popupAnchor: [0, -54],
});

const policeIcon = L.divIcon({
  className: '',
  html: `<div style="
    position: relative;
    width: 44px;
    height: 54px;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="
      font-size: 36px;
      line-height: 1;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
      animation: bounce 2s ease-in-out infinite;
    ">🚔</div>
    <div style="
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 10px solid #3b82f6;
      margin-top: -4px;
    "></div>
  </div>`,
  iconSize: [44, 54],
  iconAnchor: [22, 54],
  popupAnchor: [0, -54],
});

const locationIcon = L.divIcon({
  className: '',
  html: `<div style="
    position: relative;
    width: 30px;
    height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  ">
    <div style="
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    ">📍</div>
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #6366f1;
      margin-top: -2px;
    "></div>
  </div>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});

const SearchResult = ({ result, onClick }) => (
  <div className="search-result-item" onClick={() => onClick(result)}>
    <span className="result-icon">📍</span>
    <div className="result-info">
      <span className="result-name">{result.display_name.split(',')[0]}</span>
      <span className="result-address">{result.display_name.split(',').slice(1, 3).join(',')}</span>
    </div>
  </div>
);

const MapController = ({ center, zoom }) => {
  const map = useMap();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (center) {
      if (isFirstRender.current) {
        map.setView(center, zoom || 13);
        isFirstRender.current = false;
      } else {
        map.flyTo(center, zoom || 13, { duration: 0.5 });
      }
    }
  }, [center, zoom, map]);
  
  return null;
};

const ZoneCircles = ({ zones, onZoneClick }) => {
  if (!zones || zones.length === 0) return null;
  
  return zones.map((zone, idx) => {
    let risk;
    if (zone.baseFloodDays >= 12) {
      risk = 'EXTREME';
    } else if (zone.baseFloodDays >= 8) {
      risk = 'HIGH';
    } else if (zone.baseFloodDays >= 4) {
      risk = 'MEDIUM';
    } else {
      risk = 'LOW';
    }
    
    return (
      <Circle
        key={idx}
        center={zone.center}
        radius={zone.radius}
        pathOptions={RISK_COLORS[risk] || RISK_COLORS.MEDIUM}
        eventHandlers={{
          click: () => onZoneClick && onZoneClick(zone)
        }}
      />
    );
  });
};

const POIMarkers = ({ pois }) => {
  if (!pois || pois.length === 0) return null;
  
  return pois.map((poi, idx) => {
    const icon = poi.type === 'hospital' ? hospitalIcon : policeIcon;
    return (
      <Marker
        key={`poi-${idx}`}
        position={[poi.lat, poi.lon]}
        icon={icon}
      >
        <Popup>
          <div className="poi-popup">
            <strong>{poi.type === 'hospital' ? '🏥' : '🚔'} {poi.name}</strong>
            <span>{poi.address}</span>
          </div>
        </Popup>
      </Marker>
    );
  });
};

export const ZoneMap = ({ 
  city = '',
  height = '400px',
  showControls = true,
  compact = false,
  onLocationSelect = null,
  initialCenter = null,
  initialZoom = 13
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [mapStyle, setMapStyle] = useState('streets');
  const [pois, setPOIs] = useState([]);
  const [showZones, setShowZones] = useState(true);
  const [selectedCity, setSelectedCity] = useState(city?.toLowerCase() || null);
  const searchTimeout = useRef(null);
  
  const cityKey = selectedCity || city?.toLowerCase() || 'default';
  const cityCoords = CITY_COORDS[cityKey] || { lat: 19.076, lng: 72.877 };
  const cityZones = ZONE_CIRCLES[cityKey] || [];
  
  useEffect(() => {
    if (city) {
      const newCityKey = city.toLowerCase();
      const newCityCoords = CITY_COORDS[newCityKey] || { lat: 19.076, lng: 72.877 };
      if (!initialCenter) {
        setMapCenter([newCityCoords.lat, newCityCoords.lng]);
      }
      setSelectedCity(newCityKey);
    }
  }, [city]);
  
  useEffect(() => {
    if (initialCenter) {
      setMapCenter(initialCenter);
      setMapZoom(initialZoom);
    } else if (!mapCenter || mapCenter[0] === 0) {
      setMapCenter([cityCoords.lat, cityCoords.lng]);
    }
  }, [initialCenter]);
  
  useEffect(() => {
    if (mapCenter) {
      fetchPOIs(mapCenter[0], mapCenter[1]);
    }
  }, [mapCenter]);
  
  const fetchPOIs = async (lat, lng) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"]["name"](around:5000,${lat},${lng});
          node["amenity"="clinic"]["name"](around:5000,${lat},${lng});
          node["amenity"="police"]["name"](around:5000,${lat},${lng});
          way["amenity"="hospital"]["name"](around:5000,${lat},${lng});
          way["amenity"="police"]["name"](around:5000,${lat},${lng});
        );
        out body center;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      
      const data = await response.json();
      
      const poisData = data.elements
        .filter(el => el.tags && el.tags.name)
        .slice(0, 15)
        .map(el => ({
          name: el.tags.name,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          type: el.tags.amenity === 'police' ? 'police' : 'hospital',
          address: el.tags['addr:street'] || el.tags.location || '',
        }))
        .filter(poi => poi.lat && poi.lon);
      
      setPOIs(poisData);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      setPOIs([]);
    }
  };
  
  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&accept-language=en`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };
  
  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapCenter([lat, lng]);
    setMapZoom(15);
    setShowResults(false);
    setSearchQuery('');
    
    const mlResult = calculateRiskFromML(lat, lng);
    setSelectedCity(mlResult.city);
    
    if (onLocationSelect) {
      onLocationSelect({
        lat,
        lng,
        name: result.display_name.split(',')[0],
        fullAddress: result.display_name,
        risk: mlResult.risk,
        baseAdj: mlResult.baseAdj,
        floodDays: mlResult.floodDays,
        zoneName: mlResult.zoneName,
        zoneValue: mlResult.zoneValue,
        city: mlResult.city
      });
    }
  };
  
  const handleZoneClick = (zone) => {
    const center = zone.center;
    const mlResult = calculateRiskFromML(center[0], center[1]);
    
    setMapCenter(center);
    setMapZoom(15);
    
    if (onLocationSelect) {
      onLocationSelect({
        lat: center[0],
        lng: center[1],
        name: zone.name,
        fullAddress: `${zone.name}, ${mlResult.city}`,
        risk: mlResult.risk,
        baseAdj: zone.baseAdj || mlResult.baseAdj,
        floodDays: zone.baseFloodDays || mlResult.floodDays,
        zoneName: zone.name,
        zoneValue: zone.value,
        city: mlResult.city
      });
    }
  };
  
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter([lat, lng]);
          setMapZoom(16);
          
          const mlResult = calculateRiskFromML(lat, lng);
          setSelectedCity(mlResult.city);
          
          if (onLocationSelect) {
            onLocationSelect({
              lat,
              lng,
              name: 'Current Location',
              accuracy: position.coords.accuracy,
              risk: mlResult.risk,
              baseAdj: mlResult.baseAdj,
              floodDays: mlResult.floodDays,
              zoneName: mlResult.zoneName,
              zoneValue: mlResult.zoneValue,
              city: mlResult.city
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };
  
  const tileUrl = mapStyle === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : mapStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  const tileAttribution = mapStyle === 'satellite'
    ? 'Tiles © Esri'
    : mapStyle === 'dark'
    ? '© OpenStreetMap contributors © CARTO'
    : '© OpenStreetMap contributors';

  return (
    <div className="zone-map-wrapper">
      <div className="map-search-container">
        <div className="map-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search anywhere in the world..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {isSearching && <span className="search-loading">⏳</span>}
          <button className="locate-btn" onClick={handleLocateMe} title="My Location">
            📍
          </button>
        </div>
        
        {showResults && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map((result, idx) => (
              <SearchResult
                key={idx}
                result={result}
                onClick={handleResultClick}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className={`real-map-container ${compact ? 'compact' : ''}`} style={{ height }}>
        <MapContainer
          center={mapCenter || [cityCoords.lat, cityCoords.lng]}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url={tileUrl}
            attribution=""
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {showZones && <ZoneCircles zones={cityZones} onZoneClick={handleZoneClick} />}
          
          <POIMarkers pois={pois} />
          
          <Marker
            position={mapCenter || [cityCoords.lat, cityCoords.lng]}
            icon={locationIcon}
          />
        </MapContainer>
        
        {showControls && !compact && (
          <div className="map-controls-overlay">
            <button className="map-ctrl-btn zoom-in" onClick={() => setMapZoom(z => Math.min(z + 1.5, 18))} title="Zoom In">
              +
            </button>
            <button className="map-ctrl-btn zoom-out" onClick={() => setMapZoom(z => Math.max(z - 1.5, 3))} title="Zoom Out">
              −
            </button>
          </div>
        )}
        
        {showControls && !compact && (
          <div className="map-style-selector">
            <button
              className={`style-opt ${mapStyle === 'streets' ? 'active' : ''}`}
              onClick={() => setMapStyle('streets')}
              title="Street Map"
            >
              🗺️
            </button>
            <button
              className={`style-opt ${mapStyle === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapStyle('satellite')}
              title="Satellite"
            >
              🛰️
            </button>
            <button
              className={`style-opt ${mapStyle === 'dark' ? 'active' : ''}`}
              onClick={() => setMapStyle('dark')}
              title="Dark Mode"
            >
              🌙
            </button>
            <div className="style-divider"></div>
            <button
              className={`style-opt zone-toggle ${showZones ? 'active' : ''}`}
              onClick={() => setShowZones(!showZones)}
              title="Toggle Zones"
              style={showZones ? { background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderColor: '#f59e0b' } : {}}
            >
              {showZones ? '🔴' : '⚪'}
            </button>
          </div>
        )}
      </div>
      
      <div className="map-zone-legend">
        {showZones && (
          <>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> EXTREME</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }} /> HIGH</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }} /> MEDIUM</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /> LOW</span>
          </>
        )}
        {pois.length > 0 && (
          <>
            {showZones && <span className="legend-divider">|</span>}
            <span className="legend-item"><span className="legend-dot poi-hospital" /> Hospital</span>
            <span className="legend-item"><span className="legend-dot poi-police" /> Police</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoneMap;
