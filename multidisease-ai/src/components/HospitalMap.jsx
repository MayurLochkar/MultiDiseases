import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function HospitalMap({ diseaseType }) {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const specialtyMap = {
    Heart: { name: "Cardiology", tag: "cardiology" },
    Diabetes: { name: "Endocrinology", tag: "endocrinology" },
    Pneumonia: { name: "Pulmonology", tag: "pulmonology" },
    BrainTumor: { name: "Neurology", tag: "neurology" },
    SkinCancer: { name: "Dermatology", tag: "dermatology" }
  };

  const currentSpecialty = specialtyMap[diseaseType];

  const formatAddress = (tags) => {
    if (!tags) return "Address not available";
    if (tags['addr:full']) return tags['addr:full'];
    
    const parts = [];
    if (tags['addr:housenumber'] || tags['addr:street']) {
        parts.push(`${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}`.trim());
    }
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    if (parts.length > 0) return parts.join(', ');
    return "Complete address not listed on OpenStreetMap";
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          await fetchHospitals(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const fetchHospitals = async (lat, lon) => {
    // OpenStreetMap Overpass API
    // Attempt 1: Search for specialized facilities
    let query = "";
    if (currentSpecialty) {
      query = `
        [out:json];
        (
          node["amenity"~"hospital|clinic"]["healthcare:speciality"~"${currentSpecialty.tag}",i](around:7000,${lat},${lon});
          node["amenity"~"hospital|clinic"]["name"~"${currentSpecialty.tag}",i](around:7000,${lat},${lon});
        );
        out;
      `;
    } else {
      query = `
        [out:json];
        node["amenity"="hospital"](around:5000,${lat},${lon});
        out;
      `;
    }

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      
      if (response.status === 429) {
        console.warn("Overpass API rate limited. Attempting simple fallback...");
        const simpleQuery = `[out:json];node["amenity"="hospital"](around:10000,${lat},${lon});out;`;
        const simpleRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(simpleQuery)}`);
        if (!simpleRes.ok) throw new Error(`API Error: ${simpleRes.status}`);
        const data = await simpleRes.json();
        if (data.elements) {
           setHospitals(data.elements.map(h => ({ ...h, distance: calculateDistance(lat, lon, h.lat, h.lon) })).sort((a,b) => a.distance - b.distance));
        }
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      
      // Fallback if no specialized results found
      if (currentSpecialty && (!data.elements || data.elements.length === 0)) {
        const fallbackQuery = `
          [out:json];
          node["amenity"="hospital"](around:5000,${lat},${lon});
          out;
        `;
        const fallbackRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(fallbackQuery)}`);
        if (fallbackRes.ok) {
           const fallbackData = await fallbackRes.json();
           if (fallbackData.elements) data = fallbackData;
        }
      }
      
      if (data.elements) {
        const hs = data.elements.map(h => {
          const d = calculateDistance(lat, lon, h.lat, h.lon);
          return { ...h, distance: d };
        }).sort((a,b) => a.distance - b.distance);

        setHospitals(hs);
        if(hs.length > 0) setSelectedHospital(hs[0]);
      }
    } catch (e) {
      console.error("Technical Error loading medical facilities:", e);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  if (loading) return (
    <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-sm animate-pulse">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-500 font-medium">Locating nearby hospitals...</p>
    </div>
  );
  
  if (!location) return (
    <div className="p-6 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl text-center shadow-sm mb-6">
      <p>Location access needed to find nearby hospitals.</p>
    </div>
  );

  const nearest = hospitals[0];

  return (
    <div className="mb-6 border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white mt-4 flex flex-col">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">
            {currentSpecialty ? `Nearby ${currentSpecialty.name} Specialists` : "Nearby Hospitals"}
          </h4>
          <p className="text-sm text-slate-500">
            {currentSpecialty 
              ? `Showing centers related to ${currentSpecialty.name} within 7km.` 
              : "Showing hospitals within 5km from your location."}
          </p>
        </div>
      </div>

      {selectedHospital && (
        <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex items-start gap-4 transition-all">
          <div className="text-3xl text-emerald-600 drop-shadow-sm mt-1 animate-bounce">🏥</div>
          <div className="flex-1">
            <h5 className="font-extrabold text-slate-800 text-lg mb-1">{selectedHospital.tags?.name || "Unnamed Medical Facility"}</h5>
            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-xl">{formatAddress(selectedHospital.tags)}</p>
            <div className="mt-3 text-xs font-bold px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 shadow-sm rounded-lg inline-flex items-center gap-1.5">
              <span>📍</span> Distance: {selectedHospital.distance?.toFixed(2)} km away
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '350px', width: '100%', zIndex: 0 }}>
        <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[location.lat, location.lon]}>
            <Popup><span className="font-bold text-blue-600">📍 You are here</span></Popup>
          </Marker>

          {hospitals.map(h => (
            <CircleMarker 
              key={h.id || `${h.lat}-${h.lon}`} 
              center={[h.lat, h.lon]} 
              radius={nearest && h.id === nearest.id ? 10 : 8}
              color={nearest && h.id === nearest.id ? '#22c55e' : '#3b82f6'} // green-500 or blue-500
              fillOpacity={0.8}
              eventHandlers={{
                click: () => setSelectedHospital(h)
              }}
            >
              <Popup>
                <strong className="text-slate-800">{h.tags?.name || "Medical Facility"}</strong><br/>
                {nearest && h.id === nearest.id && <span className="text-green-600 font-bold block my-1">✅ Nearest Hospital</span>}
                <span className="text-slate-500 text-xs block mb-1">{formatAddress(h.tags)}</span>
                <span className="text-slate-700 font-bold text-xs">Distance: {h.distance.toFixed(2)} km</span>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
