import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;

// Helper to recenter the map view dynamically
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export default function HospitalMap({ diseaseType, onHospitalSelect }) {
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
    let isFetched = false;
    
    // 8-second timeout for geolocation
    const geoTimeout = setTimeout(() => {
      if (!isFetched) {
        isFetched = true;
        console.warn("[Map] Geolocation timed out. Using fallback.");
        const fallback = { lat: 19.0760, lon: 72.8777 }; // Mumbai Fallback
        setLocation(fallback);
        fetchHospitals(fallback.lat, fallback.lon);
      }
    }, 8000);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isFetched) {
            isFetched = true;
            clearTimeout(geoTimeout);
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setLocation({ lat, lon });
            await fetchHospitals(lat, lon);
          }
        },
        (error) => {
          if (!isFetched) {
            isFetched = true;
            console.error("Geolocation error:", error);
            clearTimeout(geoTimeout);
            const fallback = { lat: 19.0760, lon: 72.8777 };
            setLocation(fallback);
            fetchHospitals(fallback.lat, fallback.lon);
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      isFetched = true;
      clearTimeout(geoTimeout);
      const fallback = { lat: 19.0760, lon: 72.8777 };
      setLocation(fallback);
      fetchHospitals(fallback.lat, fallback.lon);
    }
    return () => clearTimeout(geoTimeout);
  }, []);

  const fetchHospitals = async (lat, lon) => {
    let query = `[out:json][timeout:25];(`;
    
    if (currentSpecialty) {
      const tag = currentSpecialty.tag;
      query += `
        node["amenity"~"hospital|clinic"]["healthcare:speciality"~"${tag}",i](around:20000,${lat},${lon});
        way["amenity"~"hospital|clinic"]["healthcare:speciality"~"${tag}",i](around:20000,${lat},${lon});
        node["amenity"~"hospital|clinic"]["name"~"${tag}",i](around:20000,${lat},${lon});
        way["amenity"~"hospital|clinic"]["name"~"${tag}",i](around:20000,${lat},${lon});
      `;
    }
    
    query += `
      node["amenity"="hospital"](around:15000,${lat},${lon});
      way["amenity"="hospital"](around:15000,${lat},${lon});
    );out center;`;

    setLoading(true);

    // Optimized Mirror Rotation Logic
    for (const mirror of MIRRORS) {
      try {
        console.log(`[Map] Requesting Overpass from: ${mirror}`);
        const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
        
        if (response.status === 429) {
          console.warn(`[Map] Mirror ${mirror} rate limited (429). Trying next...`);
          continue;
        }

        if (!response.ok) continue;
        
        const data = await response.json();
        if (data.elements && data.elements.length > 0) {
          const hs = data.elements
            .map(h => {
              const hLat = h.lat || h.center?.lat;
              const hLon = h.lon || h.center?.lon;
              if (!hLat || !hLon) return null;
              
              const tags = h.tags || {};
              const name = (tags.name || "").toLowerCase();
              const spec = (tags['healthcare:speciality'] || tags.speciality || "").toLowerCase();
              const isMatch = currentSpecialty && (
                name.includes(currentSpecialty.tag.toLowerCase()) || 
                spec.includes(currentSpecialty.tag.toLowerCase()) ||
                name.includes(currentSpecialty.name.toLowerCase())
              );

              return { 
                ...h, 
                lat: hLat, 
                lon: hLon, 
                distance: calculateDistance(lat, lon, hLat, hLon),
                isBig: tags.amenity === 'hospital',
                isSpecialist: isMatch
              };
            })
            .filter(Boolean)
            .sort((a,b) => {
              if (a.isSpecialist && !b.isSpecialist) return -1;
              if (!a.isSpecialist && b.isSpecialist) return 1;
              if (a.isBig && !b.isBig) return -1;
              if (!a.isBig && b.isBig) return 1;
              return a.distance - b.distance;
            });

          setHospitals(hs);
          if(hs.length > 0) {
            setSelectedHospital(hs[0]);
            if(onHospitalSelect) {
              onHospitalSelect({
                name: hs[0].tags?.name || (hs[0].isSpecialist ? `Specialist ${currentSpecialty?.name}` : "Medical Facility"),
                phone: hs[0].tags?.phone || hs[0].tags?.['contact:phone'] || "N/A",
                address: formatAddress(hs[0].tags)
              });
            }
          }
          setLoading(false);
          return; // Success!
        }
      } catch (e) {
        console.warn(`[Map] Mirror failed: ${mirror}`);
      }
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes clinical-pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        .pulse-marker {
          animation: clinical-pulse 2s infinite ease-in-out;
        }
      `}} />

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
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
               <div className="px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 shadow-sm rounded-lg inline-flex items-center gap-1.5">
                 <span>📍</span> Distance: {selectedHospital.distance?.toFixed(2)} km away
               </div>
               {(selectedHospital.tags?.phone || selectedHospital.tags?.['contact:phone']) && (
                 <div className="px-3 py-1.5 bg-emerald-600 text-white shadow-sm rounded-lg inline-flex items-center gap-1.5">
                   <span>📞</span> {selectedHospital.tags?.phone || selectedHospital.tags?.['contact:phone']}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      <div style={{ height: '350px', width: '100%', zIndex: 0 }}>
        <MapContainer center={[location.lat, location.lon]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
          <RecenterMap center={[location.lat, location.lon]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Solid User Marker (Blue Pulse) */}
          <CircleMarker 
            center={[location.lat, location.lon]}
            radius={8}
            color="#2563eb" // blue-600
            fillColor="#2563eb"
            fillOpacity={1}
            weight={3}
          >
            <Popup><span className="font-bold text-blue-600">🔵 You are here</span></Popup>
          </CircleMarker>

          {hospitals.map(h => {
             const isNearest = nearest && h.id === nearest.id;
             const isBig = h.isBigHospital;
             return (
               <CircleMarker 
                 key={h.id || `${h.lat}-${h.lon}`} 
                 center={[h.lat, h.lon]} 
                 radius={isBig ? (isNearest ? 14 : 11) : (isNearest ? 10 : 7)}
                 color={isBig ? "#064e3b" : "#059669"} // Darker shade for big hospitals
                 fillColor={isBig ? "#10b981" : "#34d399"} 
                 fillOpacity={0.9}
                 weight={isNearest ? 4 : 2}
                 className={isNearest ? "pulse-marker" : ""}
                 eventHandlers={{
                   click: () => {
                     setSelectedHospital(h);
                     if(onHospitalSelect) {
                        onHospitalSelect({
                          name: h.tags?.name || "Medical Facility",
                          phone: h.tags?.phone || h.tags?.['contact:phone'] || "N/A",
                          address: formatAddress(h.tags)
                        });
                     }
                   }
                 }}
               >
                 <Popup>
                   <div className="p-1">
                     <strong className="text-slate-800 text-sm">{h.tags?.name || "Medical Facility"}</strong><br/>
                     <div className="flex gap-1 mt-1">
                       {isBig && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">🏥 Major Hospital</span>}
                       {isNearest && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">📍 Nearest</span>}
                     </div>
                     <span className="text-slate-500 text-[11px] block mt-1.5">{formatAddress(h.tags)}</span>
                   </div>
                 </Popup>
               </CircleMarker>
             );
          })}
        </MapContainer>

        {/* --- MAP LEGEND --- */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white z-[1000] flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Medical Center</span>
            </div>
            <div className="w-px h-3 bg-slate-200"></div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Your Location</span>
            </div>
        </div>
      </div>
    </div>
  );
}
