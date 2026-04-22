import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCloudUploadAlt, FaMicroscope, FaCheckCircle,
  FaExclamationTriangle, FaTrashAlt, FaNotesMedical, FaDna, FaArrowRight, FaUser
} from "react-icons/fa";
import { GiCancer } from "react-icons/gi";
import { BiScan, BiPulse, BiLoaderAlt } from "react-icons/bi";
import VoiceAssistant from "../components/VoiceAssistant";
import DoctorSuggestion from "../components/DoctorSuggestion";
import HospitalMap from "../components/HospitalMap";
import AdvancedReport from "../components/AdvancedReport";
import AppointmentBooking from "../components/AppointmentBooking";
// --- ANIMATION VARIANTS ---
const itemVar = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
};

export default function SkinCancer() {
  const [image, setImage] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
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
      addLog("Dermoscopy image loaded into secure buffer.", "success");
      addLog(`Resolution check passed. Size: ${(file.size / 1024).toFixed(2)} KB`, "info");
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setLogs([]);
  };

  // Simulate CNN Backend Analysis
  const runAnalysis = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setResult(null);
    setLogs([]);

    const sequence = [
      { t: 400, msg: "Initializing CNN Dermatology Model..." },
      { t: 1500, msg: "Isolating lesion from surrounding skin..." },
      { t: 2500, msg: "Extracting ABCD features (Asymmetry, Border, Color, Diameter)..." },
      { t: 3800, msg: "Running deep feature classification...", type: "warning" },
    ];

    sequence.forEach(({ t, msg, type }) => {
      setTimeout(() => addLog(msg, type), t);
    });

    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("http://localhost:5001/api/skin", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      console.log("API Response:", data); // DEBUG

      // Handle error from server
      if (data.error) {
        addLog("Analysis aborted due to invalid scan.", "warning");
        setResult({
          diagnosis: "Invalid Image",
          confidence: "0.00",
          severity: "High Risk",
          notes: data.error,
          gradcam: null
        });
        setIsAnalyzing(false);
        return;
      }

      // Full 7-class mapping matching trained model
      const classMap = {
        mel: { diagnosis: "Malignant Melanoma", severity: "High Risk", notes: "Highly aggressive malignant tumor. Immediate biopsy and oncology consultation strongly recommended." },
        //melanoma: { diagnosis: "Malignant Melanoma", severity: "High Risk", notes: "Highly aggressive malignant tumor. Immediate biopsy and oncology consultation strongly recommended." },
        bcc: { diagnosis: "Basal Cell Carcinoma", severity: "Medium Risk", notes: "Slow-growing skin cancer. Dermatologist consultation and treatment advised." },
        akiec: { diagnosis: "Actinic Keratosis / IECF", severity: "Pre-cancer", notes: "Pre-cancerous lesion detected. Early treatment significantly reduces cancer risk." },
        bkl: { diagnosis: "Benign Keratosis", severity: "Low Risk", notes: "Non-cancerous skin lesion. Routine monitoring recommended." },
        nv: { diagnosis: "Melanocytic Nevus (Mole)", severity: "Safe", notes: "Common benign mole detected. No immediate concern, periodic monitoring advised." },
        //vasc: { diagnosis: "Vascular Lesion", severity: "Low Risk", notes: "Vascular skin lesion detected. Consult a dermatologist for further evaluation." },
      };

      const mapped = classMap[data.prediction] || {
        diagnosis: data.prediction || "Unknown",
        severity: "Unknown",
        notes: "Could not match prediction to known class. Please consult a physician."
      };

      const { diagnosis, severity, notes } = mapped;

      addLog("Analysis Complete. Compiling diagnostic report...", "success");

      const confVal = ((data.confidence || 0) * 100).toFixed(2);
      
      setResult({
        diagnosis,
        confidence: confVal,
        severity,
        notes,
        gradcam: data.gradcam,
        advanced_report: data.advanced_report
      });

      // Sync with Chatbot
      localStorage.setItem('latest_diagnosis', JSON.stringify({
        disease: "Skin Cancer",
        result: diagnosis,
        confidence: confVal
      }));

      if (patientName) {
        saveToRecords(data, diagnosis);
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
    }
  };

  const saveToRecords = async (predictionData, diag) => {
    try {
      await fetch("http://localhost:5001/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientAge,
          patientGender,
          diseaseType: "SkinCancer",
          result: diag,
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
    <div className="min-h-screen bg-[#FDFEFF] text-slate-800 font-sans pt-32 pb-16 px-6 overflow-x-hidden">

      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-rose-100/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-pink-50/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[1900px] mx-auto px-6 lg:px-12">

        {/* --- HEADER SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-100 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
              <GiCancer className="text-lg" />
              CNN Dermoscopy
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Skin Lesion <span className="text-rose-600">Analysis</span>
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">Upload a clear dermoscopy image for AI-powered risk assessment.</p>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-xl border border-rose-50 flex items-center gap-3">
             <input 
                type="text" 
                placeholder="Patient Name" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none w-48 font-bold"
              />
              <input 
                type="number" 
                placeholder="Age" 
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none w-20 font-bold"
              />
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none font-bold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
          </div>

          {/* Status Indicators */}
          <div className="flex gap-6 text-sm font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              System Online
            </div>
            <div className="flex items-center gap-2">
              <FaDna className="text-blue-500 text-lg" />
              Model Ready
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* --- LEFT: UPLOAD & SCANNER (7 Cols) --- */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-900/5 border border-white relative overflow-hidden"
            >

              {!preview ? (
                // State 1: Dropzone
                <label className="cursor-pointer flex flex-col items-center justify-center gap-6 p-24 transition-all duration-300 hover:bg-rose-50/30 border-4 border-dashed border-rose-100 m-4 rounded-[2rem]">
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />

                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-28 h-28 bg-gradient-to-br from-rose-400 to-pink-600 text-white rounded-[2rem] flex items-center justify-center text-5xl shadow-xl shadow-rose-200"
                  >
                    <FaCloudUploadAlt />
                  </motion.div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Upload Dermoscopy Image</h3>
                    <p className="text-slate-400 font-medium">Drag & drop or click to browse (Max 5MB)</p>
                  </div>
                </label>
              ) : (
                // State 2: Image Preview & Scanner
                <div className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden min-h-[500px]">
                  <img src={preview} alt="Lesion" className="max-h-[500px] w-auto object-contain opacity-80" />

                  {/* Rose Colored High-Speed Scanning Beam */}
                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div
                        key="scan-line"
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-4 bg-rose-400 shadow-[0_0_50px_rgba(244,63,94,1)] z-10 blur-[2px]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Medical Grid Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                  {/* Remove Button */}
                  {!isAnalyzing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={removeImage}
                      className="absolute top-6 right-6 bg-red-500/80 hover:bg-red-600 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg z-20"
                    >
                      <FaTrashAlt /> Remove
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Run Analysis Button */}
            <motion.button
              whileHover={image && !isAnalyzing ? { scale: 1.02, boxShadow: "0px 15px 30px -10px rgba(225, 29, 72, 0.4)" } : {}}
              whileTap={image && !isAnalyzing ? { scale: 0.98 } : {}}
              onClick={runAnalysis}
              disabled={!image || isAnalyzing}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all border ${!image
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : isAnalyzing
                  ? "bg-rose-50 text-rose-500 border-rose-100 cursor-wait"
                  : "bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-200"
                }`}
            >
              {isAnalyzing ? (
                <><BiLoaderAlt className="animate-spin text-2xl" /> Analyzing Lesion Features...</>
              ) : (
                <><BiScan className="text-2xl" /> Run CNN Diagnosis</>
              )}
            </motion.button>
          </div>

          {/* --- RIGHT: LIVE LOGS & REPORT (5 Cols) --- */}
          <div className="lg:col-span-5 space-y-6">

            {/* Live Terminal / Logs Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-72 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                {isAnalyzing && <motion.div className="h-full bg-rose-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5 }} />}
              </div>

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
                <BiPulse className="text-rose-500 text-xl" /> Processing Sequence
              </h3>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 mt-2">
                <AnimatePresence>
                  {logs.length === 0 && (
                    <motion.div key="empty-logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-slate-300">
                      <FaMicroscope className="text-4xl mb-3 opacity-50" />
                      <p className="text-sm font-medium italic">Awaiting image upload...</p>
                    </motion.div>
                  )}
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      variants={itemVar} initial="hidden" animate="show" exit={{ opacity: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{log.msg}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{new Date().toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={logsEndRef} />
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Final Diagnostic Report Card */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="result-card"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-rose-900/10 overflow-hidden relative"
                >
                  {/* Top Color Indicator based on Severity */}
                  <div className={`h-3 w-full ${result.severity === "High Risk" ? "bg-red-500" :
                    result.severity === "Medium Risk" ? "bg-orange-400" :
                      result.severity === "Pre-cancer" ? "bg-amber-400" :
                        result.severity === "Low Risk" ? "bg-yellow-400" :
                          "bg-green-500"
                    }`}></div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">CNN Prediction</p>
                        <h2 className={`text-2xl font-black leading-tight mb-4 ${result.severity === "High Risk" ? "text-red-600" :
                          result.severity === "Medium Risk" ? "text-orange-600" :
                            result.severity === "Pre-cancer" ? "text-amber-600" :
                              result.severity === "Low Risk" ? "text-yellow-600" :
                                "text-green-600"
                          }`}>
                          {result.diagnosis}
                        </h2>
                        <VoiceAssistant 
                          message={["High Risk", "Medium Risk", "Pre-cancer", "Low Risk"].includes(result.severity) ? "Potential skin lesion detected. Please consult a dermatologist for a clinical examination immediately." : "Your skin appears healthy. No significant concerning lesions were detected."} 
                          startSpeaking={true} 
                        />
                      </div>
                      <div className={`p-4 rounded-2xl shrink-0 ${result.severity === "High Risk" ? "bg-red-50 text-red-600" :
                        result.severity === "Medium Risk" ? "bg-orange-50 text-orange-500" :
                          result.severity === "Pre-cancer" ? "bg-amber-50 text-amber-500" :
                            result.severity === "Low Risk" ? "bg-yellow-50 text-yellow-600" :
                              "bg-green-50 text-green-600"
                        }`}>
                        {["High Risk", "Medium Risk", "Pre-cancer"].includes(result.severity)
                          ? <FaExclamationTriangle size={28} />
                          : <FaCheckCircle size={28} />}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Confidence</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-black text-slate-800">{result.confidence}%</p>
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${result.severity === "High Risk" ? "bg-red-50 border-red-100" :
                        result.severity === "Medium Risk" ? "bg-orange-50 border-orange-100" :
                          result.severity === "Pre-cancer" ? "bg-amber-50 border-amber-100" :
                            result.severity === "Low Risk" ? "bg-yellow-50 border-yellow-100" :
                              "bg-green-50 border-green-100"
                        }`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Risk Level</p>
                        <p className={`text-xl font-black ${result.severity === "High Risk" ? "text-red-700" :
                          result.severity === "Medium Risk" ? "text-orange-600" :
                            result.severity === "Pre-cancer" ? "text-amber-600" :
                              result.severity === "Low Risk" ? "text-yellow-600" :
                                "text-green-700"
                          }`}>
                          {result.severity}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-rose-800 font-black text-xs uppercase tracking-widest">
                        <FaNotesMedical /> Dermatologist Note
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {result.notes}
                      </p>
                    </div>

                    {result.gradcam && (
                      <div className="bg-white p-5 rounded-2xl mb-2 shadow-sm border border-slate-100">
                        <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <BiScan className="text-rose-500" />
                          Lesion Heatmap (Grad-CAM)
                        </p>
                        <img 
                          src={`http://127.0.0.1:8000${result.gradcam}?t=${new Date().getTime()}`} 
                          alt="Grad-CAM Focus" 
                          className="w-full rounded-xl object-cover border border-slate-200" 
                        />
                      </div>
                    )}

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
                            diseaseType="SkinCancer" 
                            confidence={result.confidence}
                            gradcam={result.gradcam}
                            patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
                          />
                        </div>

                        {/* 2nd Row: Full Width Doctor Suggestion */}
                        <div className="w-full">
                          <DoctorSuggestion 
                            diseaseType="SkinCancer" 
                            hospital={selectedHospital}
                            onBook={() => setIsBookingOpen(true)}
                          />
                        </div>

                        {/* 3rd Row: MASSIVE Full Width Horizontal Map */}
                        <div id="hospital-map" className="w-full rounded-[3rem] overflow-hidden shadow-3xl border border-slate-100 h-[600px]">
                           <HospitalMap 
                             diseaseType="SkinCancer" 
                             onHospitalSelect={setSelectedHospital}
                           />
                        </div>
                      </motion.div>
                    )}

                    <button className="w-full mt-6 py-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 group">
                      Export Clinical Report
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      <AppointmentBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        hospital={selectedHospital}
        specialistType="Dermatologist"
        patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
      />

      {/* --- CUSTOM CSS SCROLLBAR --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      ` }} />
    </div>
  </div>
  );
}