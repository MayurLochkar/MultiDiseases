import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLungs, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaChartBar, FaRedo } from "react-icons/fa";

export default function Pneumonia() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

      setResult({
        prediction: data.prediction,
        confidence: (data.confidence * 100).toFixed(2),
        status: data.prediction === "PNEUMONIA" ? "positive" : "negative",
        details: "Prediction generated using trained CNN model.",
        gradcam: data.gradcam
      });

    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Check backend connection.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

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
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800">Step 1: Upload X-Ray</h3>
              <p className="text-sm text-slate-400">Supported formats: JPG, PNG, JPEG</p>
            </div>

            <label className="relative group cursor-pointer block">
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />

              <div className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center transition-all duration-300 ${
                preview ? "border-blue-400 bg-blue-50/30" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
              }`}>
                {!preview ? (
                  <>
                    <FaCloudUploadAlt className="text-6xl text-slate-300 group-hover:text-blue-500 transition-colors mb-4" />
                    <p className="text-slate-600 font-semibold">Drop image here or click to browse</p>
                  </>
                ) : (
                  <img
                    src={preview}
                    alt="X-ray Preview"
                    className="rounded-2xl max-h-[300px] w-full object-cover shadow-lg border-4 border-white"
                  />
                )}
              </div>
            </label>

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
              <div className="mt-8 text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-600 font-bold animate-pulse">
                  Our AI is scanning the X-ray pixels...
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
                      <p className="text-slate-500 font-medium">
                        Confidence: {result.confidence}%
                      </p>
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
    </div>
  );
}