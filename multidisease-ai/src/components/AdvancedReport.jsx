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
    
    try {
      // 1. Ensure all images are loaded
      const images = reportRef.current.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imagePromises);
      await new Promise(resolve => setTimeout(resolve, 800));

      const element = reportRef.current;
      
      // 2. High-Stability Capture (Dropped scale to 1.2 for better memory handling)
      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: true,
        imageTimeout: 20000,
        // Crucial: ensure capture is relative to the element, not the viewport
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 0.8);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 1.2, canvas.height / 1.2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 1.2, canvas.height / 1.2);
      pdf.save(`AI_Clinical_Report_${diseaseType}.pdf`);

    } catch (error) {
      console.error('PDF Engine Failure:', error);
      alert("Direct Download hit a browser limit. Please use the 'FAST PRINT' button below to save as PDF.");
    }
    
    setIsDownloading(false);
  };

  const handlePrint = () => {
     window.print();
  };

  return (
    <div className="space-y-6">
      <div 
        ref={reportRef} 
        style={{ backgroundColor: '#ffffff' }}
        className="bg-white rounded-[2.5rem] shadow-3xl border border-slate-200 overflow-hidden animate-fade-in printable-report w-full"
      >
        {/* Header */}
        <div style={{ backgroundColor: '#0f172a' }} className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
              {getIcon()}
            </div>
            <div>
              <h3 style={{ color: '#ffffff' }} className="font-black text-xl tracking-tight">AI Clinical Diagnostic Report</h3>
              <p style={{ color: '#94a3b8' }} className="text-[10px] font-bold uppercase tracking-widest">Medical Analysis Module • v5.0 • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
             <div 
               style={{ 
                 backgroundColor: data.severity?.toLowerCase().includes('high') || data.severity?.toLowerCase().includes('crit') ? '#fff1f2' : '#f0fdf4',
                 color: data.severity?.toLowerCase().includes('high') || data.severity?.toLowerCase().includes('crit') ? '#be123c' : '#166534',
                 borderColor: data.severity?.toLowerCase().includes('high') || data.severity?.toLowerCase().includes('crit') ? '#fecdd3' : '#bbf7d0'
               }}
               className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter border mb-1`}
             >
                {data.severity || 'Normal'}
            </div>
            {confidence && (
              <p style={{ color: '#60a5fa' }} className="text-[10px] font-black uppercase tracking-widest">Confidence: {confidence}%</p>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Patient Info Section */}
          {patientInfo && (
            <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="flex flex-wrap gap-6 mb-8 p-6 rounded-2xl border">
              <div className="min-w-[120px]">
                <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-widest">Patient Name</p>
                <p style={{ color: '#1e293b' }} className="text-sm font-bold break-words">{patientInfo.name || 'N/A'}</p>
              </div>
              <div className="min-w-[100px]">
                <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-widest">Age / Gender</p>
                <p style={{ color: '#1e293b' }} className="text-sm font-bold">{patientInfo.age || '--'} / {patientInfo.gender || '--'}</p>
              </div>
              <div className="min-w-[100px]">
                <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-widest">Report ID</p>
                <p style={{ color: '#1e293b' }} className="text-sm font-bold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          )}

          {/* Top Grid: Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {data.type && (
              <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-4 rounded-2xl border">
                <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-widest mb-1">Classification</p>
                <p style={{ color: '#1e293b' }} className="text-lg font-black">{data.type}</p>
              </div>
            )}
            {Object.entries(data).map(([key, value]) => {
              if (['findings', 'complications', 'severity', 'type'].includes(key)) return null;
              if (typeof value !== 'string') return null;
              return (
                <div key={key} style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="p-4 rounded-2xl border">
                  <p style={{ color: '#94a3b8' }} className="text-[10px] font-black uppercase tracking-widest mb-1">{key.replace('_', ' ')}</p>
                  <p style={{ color: '#1e293b' }} className="text-lg font-black">{value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-10 mb-8 lg:px-4 text-left">
            {/* Findings List */}
            <div style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }} className="p-6 rounded-[2.5rem] border shadow-sm">
              <h4 style={{ color: '#0f172a' }} className="text-base font-black mb-6 flex items-center gap-3">
                <div style={{ backgroundColor: '#eff6ff' }} className="w-8 h-8 rounded-xl flex items-center justify-center">
                  <FaMicroscope style={{ color: '#3b82f6' }} />
                </div>
                Key Clinical Findings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {data.findings?.map((f, i) => (
                  <div key={i} style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }} className="flex items-start gap-3 p-4 rounded-2xl border text-left">
                    <FaCheckCircle style={{ color: '#10b981' }} className="mt-1 shrink-0" />
                    <span style={{ color: '#334155' }} className="text-sm font-bold leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complications & Risk */}
            <div style={{ backgroundColor: '#fff1f2', borderColor: '#ffe4e6' }} className="p-8 rounded-[3rem] border border-dashed text-left">
              <h4 style={{ color: '#9f1239' }} className="text-base font-black mb-6 flex items-center gap-3">
                <div style={{ backgroundColor: '#ffe4e6' }} className="w-8 h-8 rounded-xl flex items-center justify-center">
                  <FaExclamationTriangle style={{ color: '#f43f5e' }} />
                </div>
                Potential Risks & Clinical Complications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {data.complications?.map((c, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', borderColor: '#ffe4e6' }} className="p-4 rounded-2xl shadow-sm border flex items-center gap-4 text-left">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
                    <span style={{ color: '#881337' }} className="text-sm font-extrabold">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GradCAM Visualization */}
          {imageUrl && (
            <div style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }} className="mb-8 p-6 rounded-[2.5rem] border text-left">
              <h4 style={{ color: '#0f172a' }} className="text-sm font-black mb-4 flex items-center gap-2">
                <BiScan style={{ color: '#6366f1' }} /> AI Spatial Focus (Grad-CAM Analysis)
              </h4>
              <div style={{ borderColor: '#ffffff' }} className="relative group overflow-hidden rounded-2xl border-4 shadow-lg bg-white">
                <img 
                  src={imageUrl} 
                  alt="Grad-CAM Visualization" 
                  className="w-full max-h-[500px] object-contain"
                  crossOrigin="anonymous"
                />
                <p style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff' }} className="absolute bottom-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Neural Attention Map
                </p>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div style={{ borderColor: '#f1f5f9' }} className="mt-8 pt-6 border-t flex items-center gap-3 text-left">
            <FaHospitalSymbol style={{ color: '#94a3b8' }} className="text-lg" />
            <p style={{ color: '#94a3b8' }} className="text-[10px] leading-relaxed italic">
              This clinical diagnostic report is AI-generated across multiple modalities. 
              Findings should be correlated with standard medical practice.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <button
          onClick={handlePrint}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all"
        >
          <FaDownload className="text-lg" /> FAST PRINT (SAVE AS PDF)
        </button>

        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all disabled:opacity-70"
        >
          {isDownloading ? (
            <><BiLoaderAlt className="animate-spin text-xl" /> Compiling...</>
          ) : (
            <><FaFilePdf className="text-xl" /> AUTO DOWNLOAD PDF</>
          )}
        </button>
      </div>
    </div>
  );
}
