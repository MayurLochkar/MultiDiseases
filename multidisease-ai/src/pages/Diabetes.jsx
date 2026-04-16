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

export default function Diabetes() {
  const [form, setForm] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ TUMHARI ORIGINAL LOGIC (No changes)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/diabetes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
    setLoading(false);
  };

  // Graph ke liye data prepare kar rahe hain
  const graphData = [
    { name: "Glucose", value: form.Glucose || 0, normal: 99 },
    { name: "BP", value: form.BloodPressure || 0, normal: 80 },
    { name: "BMI", value: form.BMI || 0, normal: 24.9 },
  ];

  // Dummy risk score logic visual meter ke liye (API ke response ke hisaab se)
  // Check if prediction string contains words like "diabetes", "positive", "high"
  const isHighRisk = result?.prediction?.toLowerCase().includes("diabetes") || result?.issues_found?.length > 0;
  const riskScore = isHighRisk ? 80 : result ? 15 : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
            Medipredict AI
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Advanced Diabetes Prediction Model</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Patient Metrics</h2>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Pregnancies</label>
                <input name="Pregnancies" type="number" placeholder="Count" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                <input name="Age" type="number" placeholder="Years" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Glucose Level</label>
                <input name="Glucose" type="number" placeholder="mg/dL" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Blood Pressure</label>
                <input name="BloodPressure" type="number" placeholder="mm Hg" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">BMI</label>
                <input name="BMI" type="number" placeholder="Weight/Height²" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Skin Thickness</label>
                <input name="SkinThickness" type="number" placeholder="mm" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Insulin</label>
                <input name="Insulin" type="number" placeholder="mu U/ml" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1">Diabetes Pedigree Function (DPF)</label>
                <input name="DiabetesPedigreeFunction" type="number" step="0.001" placeholder="Genetic risk score" onChange={handleChange} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-cyan-500/30 transform transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? "Analyzing SVM Data..." : "Run Prediction"}
            </button>
          </div>

          {/* RIGHT COLUMN - RESULTS & VISUALS */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Initial Empty State / Graph Area */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Metabolic Analysis</h3>

              <div className="w-full" style={{ minHeight: "250px", height: "250px" }}>
                {form.Glucose || form.BloodPressure || form.BMI ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} borderRadius={8} />
                      <Bar key="patient-value" dataKey="value" name="Patient Value" fill="#0284C7" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar key="healthy-baseline" dataKey="normal" name="Healthy Baseline" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400" style={{ minHeight: "250px" }}>
                    Enter patient metrics to visualize data
                  </div>
                )}
              </div>
            </div>

            {/* AI Result Card */}
            {result && (
              <div className={`rounded-3xl shadow-xl p-8 border animate-fade-in-up ${isHighRisk ? 'bg-orange-50 border-orange-200 shadow-orange-100/50' : 'bg-blue-50 border-blue-200 shadow-blue-100/50'}`}>

                {/* Risk Meter */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xl font-bold text-slate-800">Prediction Result</h3>
                    <span className={`text-lg font-bold ${isHighRisk ? 'text-orange-600' : 'text-blue-600'}`}>
                      {result.prediction}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${isHighRisk ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                      style={{ width: `${riskScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* Issues Found */}
                  {result.issues_found && result.issues_found.length > 0 && (
                    <div className="bg-white/70 p-5 rounded-2xl border border-white">
                      <h4 className="font-bold text-orange-700 flex items-center mb-3">
                        <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg mr-2">⚠️</span>
                        Flagged Metrics
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {result.issues_found.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Precautions */}
                  {result.precautions && result.precautions.length > 0 && (
                    <div className="bg-white/70 p-5 rounded-2xl border border-white">
                      <h4 className="font-bold text-cyan-700 flex items-center mb-3">
                        <span className="bg-cyan-100 text-cyan-600 p-1.5 rounded-lg mr-2">🍏</span>
                        Health Recommendations
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700">
                        {result.precautions.map((item, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-cyan-500 mr-2">✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}