import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLungs, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaChartBar, FaRedo } from "react-icons/fa";
import VoiceAssistant from "../components/VoiceAssistant";
import DoctorSuggestion from "../components/DoctorSuggestion";
import HospitalMap from "../components/HospitalMap";
import AdvancedReport from "../components/AdvancedReport";
import AppointmentBooking from "../components/AppointmentBooking";

export default function Pneumonia() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // ✅ Real Backend API Call
  const analyzeImage = async () => {
    if (!selectedImage) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("http://localhost:5001/api/pneumonia", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setResult({
          prediction: "Invalid File Upload",
          confidence: "0.00",
          status: "positive", // Use 'positive' so it renders the red alert box
          details: data.error,
          gradcam: null
        });
        setLoading(false);
        return;
      }

      const resultData = {
        prediction: data.prediction,
        confidence: ((data.confidence || 0) * 100).toFixed(2),
        status: data.prediction === "PNEUMONIA" ? "positive" : "negative",
        details: "Prediction generated using trained CNN model.",
        gradcam: data.gradcam,
        advanced_report: data.advanced_report
      };

      setResult(resultData);

      // Sync with Chatbot
      localStorage.setItem('latest_diagnosis', JSON.stringify({
        disease: "Pneumonia",
        result: data.prediction,
        confidence: resultData.confidence
      }));

      if (patientName) {
        saveToRecords(data);
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Check backend connection.");
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
          diseaseType: "Pneumonia",
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
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-6">
      <div className="w-full max-w-[1900px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4 shadow-sm">
            <FaLungs className="text-3xl" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Pneumonia <span className="text-blue-600 font-extrabold italic">Analyzer</span>
          </h1>

          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Upload a chest X-ray image (PA View) and our trained CNN model will analyze the lung patterns.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100"
          >
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Step 1: Upload X-Ray</h3>
                <p className="text-sm text-slate-400">Supported formats: JPG, PNG, JPEG</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Patient Name" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-32 font-bold"
                />
                <input 
                  type="number" 
                  placeholder="Age" 
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-16 font-bold"
                />
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {!preview ? (
              <label className="cursor-pointer block">
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center hover:border-blue-400 hover:bg-slate-50 transition-all duration-300 group">
                  <FaCloudUploadAlt className="text-6xl text-slate-300 group-hover:text-blue-500 transition-colors mb-4" />
                  <p className="text-slate-600 font-semibold">Drop image here or click to browse</p>
                </div>
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-4 border-white shadow-xl group">
                <img
                  src={preview}
                  alt="X-ray Preview"
                  className="max-h-[400px] w-full object-contain opacity-90"
                />
                
                {/* High-Speed Scanning Beam */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-4 bg-blue-400 shadow-[0_0_50px_rgba(59,130,246,1)] z-10 blur-[2px]"
                    />
                  )}
                </AnimatePresence>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                <button 
                  onClick={() => { setPreview(null); setSelectedImage(null); setResult(null); }}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  Change Image
                </button>
              </div>
            )}

            {preview && !loading && !result && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={analyzeImage}
                className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform active:scale-95 flex items-center justify-center gap-3"
              >
                Start AI Analysis <FaChartBar />
              </motion.button>
            )}

            {loading && (
              <div className="mt-8 text-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-blue-600 font-black text-sm uppercase tracking-tighter flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Neural Lobe Segmentation in Progress...
                </p>
              </div>
            )}
          </motion.div>

          {/* Result Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-8 rounded-[2.5rem] shadow-2xl ${
                    result.status === "positive"
                      ? "bg-red-50 border border-red-100"
                      : "bg-green-50 border border-green-100"
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className={`text-2xl font-black ${
                        result.status === "positive"
                          ? "text-red-700"
                          : "text-green-700"
                      }`}>
                        {result.prediction}
                      </h3>
                      <p className="text-slate-500 font-medium mb-4">
                        Confidence: {result.confidence}%
                      </p>
                      {/* Voice Assistant Module */}
                      <VoiceAssistant 
                        message={result.status === "positive" ? "Analysis detects potential pneumonia. Please consult a pulmonologist immediately." : "No signs of pneumonia detected. Your lungs appear clear."} 
                        startSpeaking={true} 
                      />
                    </div>

                    {result.status === "positive" ? (
                      <FaExclamationTriangle className="text-4xl text-red-500" />
                    ) : (
                      <FaCheckCircle className="text-4xl text-green-500" />
                    )}
                  </div>

                  <div className="bg-white/60 p-5 rounded-2xl mb-8">
                    <p className="text-slate-700 text-sm">
                      <span className="font-bold">AI Insight: </span>
                      {result.details}
                    </p>
                  </div>

                  {result.gradcam && (
                    <div className="bg-white/60 p-5 rounded-2xl mb-8 border border-blue-100">
                      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <FaChartBar className="text-blue-500" />
                        Grad-CAM Output Focus
                      </p>
                      <img 
                        src={`http://127.0.0.1:8000${result.gradcam}?t=${new Date().getTime()}`} 
                        alt="Grad-CAM Focus" 
                        className="w-full rounded-xl shadow-[0_10px_20px_-10px_rgba(0,0,0,0.15)] border border-slate-200" 
                      />
                    </div>
                  )}

                  {/* Doctor & Hospital Suggestions for Positive Cases */}
                  {result && result.advanced_report && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 space-y-12 border-t border-slate-100 pt-12"
                    >
                      {/* 1st Row: Full Width Clinical Report */}
                      <div className="w-full">
                        <AdvancedReport 
                          data={result.advanced_report} 
                          diseaseType="Pneumonia" 
                          confidence={result.confidence}
                          gradcam={result.gradcam}
                          patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
                        />
                      </div>

                      {/* 2nd Row: Full Width Doctor Suggestion */}
                      <div className="w-full">
                        <DoctorSuggestion 
                           diseaseType="Pneumonia" 
                           hospital={selectedHospital}
                           onBook={() => setIsBookingOpen(true)}
                        />
                      </div>

                      {/* 3rd Row: MASSIVE Full Width Horizontal Map */}
                      <div id="hospital-map" className="w-full rounded-[3rem] overflow-hidden shadow-3xl border border-slate-100 h-[600px]">
                        <HospitalMap 
                           diseaseType="Pneumonia" 
                           onHospitalSelect={setSelectedHospital}
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => {
                      setPreview(null);
                      setResult(null);
                      setSelectedImage(null);
                    }}
                    className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
                  >
                    <FaRedo /> Scan Another Image
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-100/50 border border-slate-200 border-dashed rounded-[2.5rem] p-12 text-center"
                >
                  <div className="text-slate-300 text-6xl mb-4 flex justify-center">
                    📊
                  </div>
                  <h3 className="text-slate-400 font-bold text-xl uppercase tracking-widest">
                    Awaiting Analysis
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Upload an image to see detailed AI results here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AppointmentBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        hospital={selectedHospital}
        specialistType="Pulmonologist"
        patientInfo={{ name: patientName, age: patientAge, gender: patientGender }}
      />
    </div>
  );
}