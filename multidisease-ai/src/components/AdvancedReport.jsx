import React, { useRef, useState } from 'react';
import { 
  FaHospitalSymbol, FaFileMedical, FaMicroscope, FaExclamationTriangle, 
  FaCheckCircle, FaChartLine, FaLungs, FaBrain, FaHeartbeat, FaSyringe, FaStethoscope,
  FaDownload, FaFilePdf
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BiScan, BiLoaderAlt } from 'react-icons/bi';

export default function AdvancedReport({ data, diseaseType, confidence, gradcam, patientInfo }) {
  const reportRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use relative path for proxy
  const imageUrl = gradcam ? (gradcam.startsWith('/') ? gradcam : `/${gradcam}`) : null;

  if (!data) return null;

  const getIcon = () => {
    switch (diseaseType) {
      case 'Pneumonia': return <FaLungs className="text-blue-500" />;
      case 'BrainTumor': return <FaBrain className="text-indigo-500" />;
      case 'Heart': return <FaHeartbeat className="text-rose-500" />;
      case 'Diabetes': return <FaSyringe className="text-cyan-500" />;
      case 'SkinCancer': return <FaStethoscope className="text-pink-500" />;
      default: return <FaFileMedical className="text-slate-500" />;
    }
  };

  const getSeverityColor = (sev) => {
    if (!sev) return 'bg-slate-100 text-slate-600';
    const s = sev.toLowerCase();
    if (s.includes('critical') || s.includes('severe') || s.includes('high') || s.includes('chronic')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (s.includes('moderate') || s.includes('mid') || s.includes('intermediate')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    // Ensure all images are loaded
    const images = reportRef.current.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    
    await Promise.all(imagePromises);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Extra buffer for rendering
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5, // Conservative scale for stability
        useCORS: true,
        allowTaint: false,
        logging: true, // Enable logging for diagnostics
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 1.5, canvas.height / 1.5]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
      pdf.save(`AI_Clinical_Report_${diseaseType}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert("Error generating PDF. Please check the console for details.");
    }
    setIsDownloading(false);
  };

  return (
    <div className="space-y-6">
      <div ref={reportRef} className="bg-white rounded-[2.5rem] shadow-3xl border border-slate-200 overflow-hidden animate-fade-in printable-report w-full hover:shadow-indigo-500/10 transition-shadow duration-500">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-white font-black text-xl tracking-tight">AI Clinical Diagnostic Report</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Medical Analysis Module v4.5 • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
             <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter border ${getSeverityColor(data.severity)} mb-1`}>
              Status: {data.severity || 'Normal'}
            </div>
            {confidence && (
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Confidence: {confidence}%</p>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Patient Info Section (Improved for narrow columns) */}
          {patientInfo && (
            <div className="flex flex-wrap gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="min-w-[120px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                <p className="text-sm font-bold text-slate-800 break-words">{patientInfo.name || 'N/A'}</p>
              </div>
              <div className="min-w-[100px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age / Gender</p>
                <p className="text-sm font-bold text-slate-800">{patientInfo.age || '--'} / {patientInfo.gender || '--'}</p>
              </div>
              <div className="min-w-[100px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report ID</p>
                <p className="text-sm font-bold text-slate-800">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* Top Grid: Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {data.type && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                <p className="text-lg font-black text-slate-800">{data.type}</p>
              </div>
            )}
            {data.localization && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affected Region</p>
                <p className="text-lg font-black text-slate-800">{data.localization}</p>
              </div>
            )}
            {data.cause && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Probable Cause</p>
                <p className="text-lg font-black text-slate-800">{data.cause}</p>
              </div>
            )}
            {data.infected_area && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Extent of Spread</p>
                <p className="text-lg font-black text-slate-800">{data.infected_area}</p>
              </div>
            )}
            {data.ischemia_risk && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ischemia Risk</p>
                <p className="text-lg font-black text-slate-800">{data.ischemia_risk}</p>
              </div>
            )}
            {data.insulin_resistance && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Insulin Resistance</p>
                <p className="text-lg font-black text-slate-800">{data.insulin_resistance}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-10 mb-8 lg:px-4">
            {/* Findings List */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-base font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <FaMicroscope className="text-blue-500" />
                </div>
                Key Clinical Findings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.findings?.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                    <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                    <span className="text-sm text-slate-700 font-bold leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complications & Risk - Now Full Width inside the stack */}
            <div className="bg-rose-50/20 p-8 rounded-[3rem] border border-rose-100 border-dashed">
              <h4 className="text-base font-black text-rose-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                  <FaExclamationTriangle className="text-rose-500" />
                </div>
                Potential Risks & Clinical Complications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.complications?.map((c, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100/50 flex items-center gap-4 group transition-all hover:border-rose-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0"></div>
                    <span className="text-sm text-rose-900 font-extrabold">{c}</span>
                  </div>
                ))}
                {!data.complications?.length && (
                  <p className="text-xs text-slate-400 italic">No significant immediate complications detected by AI model.</p>
                )}
              </div>
            </div>
          </div>

          {/* GradCAM Visualization Section */}
          {imageUrl && (
            <div className="mb-8 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
              <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <BiScan className="text-indigo-500" /> AI Spatial Focus (Grad-CAM Analysis)
              </h4>
              <div className="relative group overflow-hidden rounded-2xl border-4 border-white shadow-lg">
                <img 
                  src={imageUrl} 
                  alt="Grad-CAM Visualization" 
                  className="w-full max-h-[500px] object-contain"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <p className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md bg-black/20 px-3 py-1 rounded-full">
                  Neural Attention Map
                </p>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-slate-400">
            <FaHospitalSymbol className="text-lg" />
            <p className="text-[10px] leading-relaxed italic">
              This advanced diagnostic report was generated using deep spatial feature analysis. 
              Automated findings should be cross-referenced with clinical examinations and laboratory tests.
            </p>
          </div>
        </div>
      </div>

      {/* Download Button Component */}
      <button
        onClick={downloadPDF}
        disabled={isDownloading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70"
      >
        {isDownloading ? (
          <><BiLoaderAlt className="animate-spin text-xl" /> Compiling Clinical Data...</>
        ) : (
          <><FaFilePdf className="text-xl" /> Download Clinical Report (PDF)</>
        )}
      </button>
    </div>
  );
}
