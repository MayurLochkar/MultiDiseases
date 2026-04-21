import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import VoiceAssistant from "../components/VoiceAssistant";
import DoctorSuggestion from "../components/DoctorSuggestion";
import HospitalMap from "../components/HospitalMap";
import AdvancedReport from "../components/AdvancedReport";
import EmergencyAlert from "../components/EmergencyAlert";

export default function Heart() {
  // Ab poore 13 parameters add kar diye hain as per your screenshot
  const [form, setForm] = useState({
    age: "",
    sex: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: ""
  });

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/heart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data);
      
      // Sync with Chatbot
      localStorage.setItem('latest_diagnosis', JSON.stringify({
        disease: "Heart Disease",
        result: data.prediction,
        confidence: data.risk_score >= 5 ? "High" : "Normal"
      }));

      if (data.risk_score >= 5) {
        setShowEmergency(true);
      }
      if (patientName) {
        saveToRecords(data);
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
    setLoading(false);
  };

  const saveToRecords = async (predictionData) => {
    try {
      await fetch("http://localhost:5001/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientAge,
          patientGender,
          diseaseType: "Heart",
          result: predictionData.prediction,
          confidence: predictionData.risk_score >= 5 ? "High Risk" : "Normal Risk",
          advancedReport: predictionData.advanced_report,
          date: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  // Graph Data (Important vitals ke liye)
  const graphData = [
    { name: "Resting BP", value: form.trestbps || 0, normal: 120 },
    { name: "Cholesterol", value: form.chol || 0, normal: 200 },
    { name: "Max HR", value: form.thalach || 0, normal: 150 },
  ];

  // Risk Score Logic
  const isHighRisk = result?.risk_score >= 5;
  const riskScore = isHighRisk ? 85 : result ? 15 : 0;

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-slate-800 font-sans pt-32 pb-16 px-6 overflow-hidden">
      <div className="w-full max-w-[1900px] mx-auto px-6 lg:px-12">
      <EmergencyAlert 
        isOpen={showEmergency} 
        onClose={() => setShowEmergency(false)} 
        diseaseType="Heart"
        severity={result?.prediction || "High Risk"}
      />
      <div className="space-y-6">

        {/* Header */}
        <div className="text-center md:text-left ml-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            CardioCare AI
          </h1>
          <p className="text-slate-500 mt-1 text-lg">Comprehensive Heart Disease Assessment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: FORM SECTION (Updated to fit 13 fields cleanly) */}
          <div className="lg:col-span-6 bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-6 sm:p-8 border border-slate-100">
            <h2 className="text-xl font-extrabold text-[#1e293b] mb-6 flex justify-between items-center">
            Patient Vitals
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Patient Name" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none w-32 font-bold"
              />
              <input 
                type="number" 
                placeholder="Age" 
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none w-16 font-bold"
              />
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                <input name="age" type="number" placeholder="e.g. 45" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sex (0=F, 1=M)</label>
                <input name="sex" type="number" placeholder="0 or 1" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chest Pain Type (0-3)</label>
                <input name="cp" type="number" placeholder="0:Typical 1:Atypical 2:Non-anginal 3:Asymptomatic" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resting BP</label>
                <input name="trestbps" type="number" placeholder="mm Hg" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cholesterol</label>
                <input name="chol" type="number" placeholder="mg/dl" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fasting Blood Sugar &gt;120? (1=Y, 0=N)</label>
                <input name="fbs" type="number" placeholder="0 or 1" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resting ECG (0-2)</label>
                <input name="restecg" type="number" placeholder="0, 1, or 2" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Max Heart Rate</label>
                <input name="thalach" type="number" placeholder="bpm" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Exercise-Induced Angina (1=Y, 0=N)</label>
                <input name="exang" type="number" placeholder="0 or 1" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">ST Depression (Oldpeak)</label>
                <input name="oldpeak" type="number" placeholder="e.g. 1.2" step="0.1" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">ST Slope (0-2)</label>
                <input name="slope" type="number" placeholder="0, 1, or 2" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Major Vessels (0-3)</label>
                <input name="ca" type="number" placeholder="Colored by flourosopy" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thalassemia (1-3)</label>
                <input name="thal" type="number" placeholder="1:Normal 2:Fixed 3:Reversible" onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-7 bg-gradient-to-r from-[#f43f5e] to-[#6366f1] hover:opacity-90 text-white font-bold text-[15px] py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? "Analyzing Models..." : "Generate AI Prediction"}
            </button>
          </div>

          {/* RIGHT: RESULTS & VISUALS */}
          <div className="lg:col-span-6 flex flex-col gap-6">

            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-6 sm:p-8 border border-slate-100 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-xl font-extrabold text-slate-800 mb-6">Real-time Vitals Chart</h3>

              <div className="w-full" style={{ minHeight: "250px", height: "100%" }}>
                {form.trestbps || form.chol || form.thalach ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar key="pt-val" dataKey="value" name="Patient Value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar key="norm-val" dataKey="normal" name="Healthy Baseline" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-medium text-sm">
                    Enter core vitals on the left to see chart
                  </div>
                )}
              </div>
            </div>

            {/* AI Result Card */}
            {result && (
              <div className={`rounded-3xl shadow-lg p-6 sm:p-8 border transition-all duration-500 ${isHighRisk ? 'bg-[#fff1f2] border-[#ffe4e6]' : 'bg-[#f0fdf4] border-[#dcfce7]'}`}>

                <div className="mb-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 mb-2">AI Assessment</h3>
                      <VoiceAssistant 
                        message={isHighRisk ? "Heart risk detect hua hai. Kripya kisi Cardiology specialist ko zaroor dikhayein." : "Aapki heart health completely stable hai."} 
                        startSpeaking={true} 
                      />
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${isHighRisk ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {result.prediction}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3 shadow-inner">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${isHighRisk ? 'bg-gradient-to-r from-orange-400 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                      style={{ width: `${riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-5">
                  {result.issues_found && result.issues_found.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white">
                      <h4 className="font-bold text-rose-700 flex items-center mb-2 text-xs uppercase tracking-wide">
                        <span className="text-lg mr-2">⚠️</span> Flags
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                        {result.issues_found.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-rose-500 mr-2 mt-0.5">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.precautions && result.precautions.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white">
                      <h4 className="font-bold text-emerald-700 flex items-center mb-2 text-xs uppercase tracking-wide">
                        <span className="text-lg mr-2">🛡️</span> Plan
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                        {result.precautions.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-emerald-500 mr-2 mt-0.5">✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 space-y-12 border-t border-slate-100 pt-12"
                  >
                    {/* 1st Row: Full Width Clinical Report */}
                    <div className="w-full">
                      <AdvancedReport 
                        data={result.advanced_report} 
                        diseaseType="Heart" 
                        patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
                      />
                    </div>

                    {/* 2nd Row: Full Width Doctor Suggestion */}
                    <div className="w-full">
                      <DoctorSuggestion diseaseType="Heart" />
                    </div>

                    {/* 3rd Row: MASSIVE Full Width Horizontal Map */}
                    <div id="hospital-map" className="w-full rounded-[3rem] overflow-hidden shadow-3xl border border-slate-100 h-[600px]">
                      <HospitalMap diseaseType="Heart" />
                    </div>
                  </motion.div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}