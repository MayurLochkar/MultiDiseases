import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBrain, FaCloudUploadAlt, FaMicroscope, FaCheckCircle, 
  FaExclamationTriangle, FaFileMedicalAlt, FaArrowRight, FaDna, FaUser
} from "react-icons/fa";
import { BiScan, BiPulse, BiLoaderAlt } from "react-icons/bi";
import VoiceAssistant from "../components/VoiceAssistant";
import DoctorSuggestion from "../components/DoctorSuggestion";
import HospitalMap from "../components/HospitalMap";
import AdvancedReport from "../components/AdvancedReport";
import EmergencyAlert from "../components/EmergencyAlert";

// --- ANIMATION VARIANTS ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVar = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
};

export default function BrainTumor() {
  const [image, setImage] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const logsEndRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [...prev, { msg, type, id: `${Date.now()}-${Math.random()}` }]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setLogs([]);
      addLog("Image loaded into local buffer.", "success");
    }
  };

  const runAnalysis = async () => {

  if (!image) return;

  setIsAnalyzing(true);
  setLogs([]);
  addLog("Uploading MRI image to AI server...", "info");

  const formData = new FormData();
  formData.append("file", image);

  try {

    const res = await fetch("http://localhost:5001/api/brain", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    addLog("Model inference complete.", "success");

    const diagResult = data.prediction === "TUMOR" ? "Brain Tumor Detected" : "No Tumor Detected";
    const confVal = (data.confidence * 100).toFixed(2);

    setResult({
      diagnosis: diagResult,
      confidence: confVal,
      severity: data.prediction === "TUMOR" ? "High Risk" : "Normal",
      desc: "Prediction generated using trained CNN model.",
      gradcam: data.gradcam,
      advanced_report: data.advanced_report
    });

    // Sync with Chatbot
    localStorage.setItem('latest_diagnosis', JSON.stringify({
      disease: "Brain Tumor",
      result: diagResult,
      confidence: confVal
    }));

    if (data.prediction === "TUMOR") {
      setShowEmergency(true);
    }

    if (patientName) {
      saveToRecords(data);
    }

  } catch (err) {
    console.log(err);
    addLog("Server connection failed.", "warning");
  }

  setIsAnalyzing(false);
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
        diseaseType: "BrainTumor",
        result: predictionData.prediction,
        confidence: (predictionData.confidence * 100).toFixed(2),
        gradcam: predictionData.gradcam,
        advancedReport: predictionData.advanced_report,
        date: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error("Error saving record:", error);
  }
};

  return (
    <div className="min-h-screen bg-[#FDFEFF] text-slate-800 font-sans pt-32 pb-10 px-6 overflow-hidden">
      <EmergencyAlert 
        isOpen={showEmergency} 
        onClose={() => setShowEmergency(false)} 
        diseaseType="BrainTumor"
        severity={result?.severity || "High Risk"}
      />
      
      {/* Background Animated Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-50/50 rounded-full blur-[100px]" 
        />
      </div>

      <div className="w-full max-w-[1900px] mx-auto px-6 lg:px-12">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Live Inference Mode
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Scan AI</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Advanced MRI Segmentation & Classification.</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-xl border border-blue-50 flex items-center gap-3">
             <input 
                type="text" 
                placeholder="Patient Name" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 font-bold"
              />
              <input 
                type="number" 
                placeholder="Age" 
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-20 font-bold"
              />
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: INTERACTIVE SCANNER (7 Cols) --- */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white relative overflow-hidden group"
            >
              
              {!preview ? (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-6 p-20 transition-all duration-300 hover:bg-blue-50/30">
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  
                  {/* Bouncing Icon on Hover */}
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-5xl shadow-lg shadow-blue-200"
                  >
                    <FaCloudUploadAlt />
                  </motion.div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Upload MRI Scan</h3>
                    <p className="text-slate-400 font-medium">Supports DICOM, PNG, JPG</p>
                  </div>
                </label>
              ) : (
                <div className="relative w-full bg-slate-900 flex items-center justify-center overflow-hidden min-h-[500px]">
                  <img src={preview} alt="MRI" className="max-h-[450px] w-auto object-contain opacity-90" />
                  
                  {/* High-Tech Scanning Beam */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-2 bg-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)] z-10 blur-[1px]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => {setPreview(null); setResult(null); setLogs([]);}}
                    className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-xs font-bold border border-white/10 transition-all"
                  >
                    Reset Image
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Run Button with Glow Effect */}
            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0px 20px 40px -10px rgba(37, 99, 235, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={runAnalysis}
              disabled={!image || isAnalyzing}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all border ${
                !image 
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" 
                  : isAnalyzing 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100 cursor-wait"
                    : "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-200"
              }`}
            >
              {isAnalyzing ? (
                <><BiLoaderAlt className="animate-spin text-xl" /> Processing Neural Layers...</>
              ) : (
                <><BiScan className="text-xl" /> Start AI Diagnosis</>
              )}
            </motion.button>
          </div>

          {/* --- RIGHT: LIVE DATA & REPORT (5 Cols) --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Logs Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-100 h-80 flex flex-col"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                <BiPulse className="text-blue-500 text-lg" /> System Activity Log
              </h3>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                <AnimatePresence>
                  {logs.length === 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-sm italic text-center mt-10">
                      System Ready. Awaiting Input...
                    </motion.p>
                  )}
                  {logs.map((log) => (
                    <motion.div 
                      key={log.id} 
                      variants={itemVar} initial="hidden" animate="show" exit={{ opacity: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      <div className="bg-slate-50 p-2.5 rounded-lg w-full">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed">{log.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={logsEndRef} />
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Result Report Card (Morphing) */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.9 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-white rounded-[2rem] border border-blue-100 shadow-2xl shadow-blue-100 overflow-hidden relative"
                >
                  {/* Decorative Header BG */}
                  <div className={`h-2 w-full absolute top-0 ${result.severity.includes("High") ? "bg-red-500" : "bg-green-500"}`}></div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Diagnosis</p>
                        <h2 className="text-3xl font-black text-slate-800 leading-tight">{result.diagnosis}</h2>
                      </div>
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                        className={`p-3 rounded-2xl ${result.severity.includes("High") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                      >
                        {result.severity.includes("High") ? <FaExclamationTriangle size={28} /> : <FaCheckCircle size={28} />}
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <p className="text-xs text-slate-500 mb-1 font-bold">Confidence</p>
                        <p className="text-2xl font-black text-blue-600">{result.confidence}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-red-200 transition-colors">
                        <p className="text-xs text-slate-500 mb-1 font-bold">Risk Level</p>
                        <p className={`text-xl font-black ${result.severity.includes("High") ? "text-red-600" : "text-green-600"}`}>{result.severity}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-50 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs uppercase tracking-wide">
                        <FaMicroscope /> Pathologist Note
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {result.desc}
                      </p>
                    </div>

                    {result.gradcam && (
                      <div className="bg-white p-5 rounded-2xl mb-6 shadow-sm border border-slate-100">
                        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <BiScan className="text-blue-500" />
                          AI Heatmap (Grad-CAM)
                        </p>
                        <img 
                          src={`http://127.0.0.1:8000${result.gradcam}?t=${new Date().getTime()}`} 
                          alt="Grad-CAM Focus" 
                          className="w-full rounded-xl object-cover border border-slate-200" 
                        />
                      </div>
                    )}

                    <button className="w-full py-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group">
                      Download Full Report 
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

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
                            diseaseType="BrainTumor" 
                            confidence={result.confidence}
                            gradcam={result.gradcam}
                            patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
                          />
                        </div>

                        {/* 2nd Row: Full Width Doctor Suggestion */}
                        <div className="w-full">
                          <DoctorSuggestion diseaseType="BrainTumor" />
                        </div>

                        {/* 3rd Row: MASSIVE Full Width Horizontal Map */}
                        <div id="hospital-map" className="w-full rounded-[3rem] overflow-hidden shadow-3xl border border-slate-100 h-[600px]">
                           <HospitalMap diseaseType="BrainTumor" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- SCROLLBAR STYLES --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}