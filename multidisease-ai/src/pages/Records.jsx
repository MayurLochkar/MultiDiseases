import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaCalendarAlt, FaFileMedical, FaTrashAlt, 
  FaSearch, FaClipboardList, FaArrowRight, FaFilter, FaTimes
} from 'react-icons/fa';
import AdvancedReport from '../components/AdvancedReport';

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/records');
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
    setLoading(false);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await fetch(`http://localhost:5001/api/records/${id}`, { method: 'DELETE' });
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const filteredRecords = records.filter(p => {
    const pName = p.patientName || '';
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.diseaseType === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', 'Heart', 'Diabetes', 'Pneumonia', 'BrainTumor', 'SkinCancer'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
              <FaClipboardList className="text-lg" />
              Patient Archive
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Diagnostic <span className="text-blue-600 italic">Records</span>
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">History of all AI assessments performed on this workstation.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search Patient Name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all w-64 outline-none"
                />
             </div>
             <div className="flex items-center gap-2 px-4 border-l border-slate-100">
               <FaFilter className="text-slate-400 text-xs" />
               <select 
                 value={filter} 
                 onChange={(e) => setFilter(e.target.value)}
                 className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
               >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold animate-pulse">Loading Archive...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-xl">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📁</div>
             <h3 className="text-2xl font-bold text-slate-800">No Records Found</h3>
             <p className="text-slate-400 mt-2">Could not find any diagnostic reports matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 relative"
                >
                  <div className={`h-2 w-full ${
                    record.diseaseType === 'Heart' ? 'bg-rose-500' :
                    record.diseaseType === 'Pneumonia' ? 'bg-blue-500' :
                    record.diseaseType === 'BrainTumor' ? 'bg-indigo-500' :
                    record.diseaseType === 'SkinCancer' ? 'bg-pink-500' :
                    'bg-cyan-500'
                  }`}></div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl text-slate-600">
                          <FaUser />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 tracking-tight">{record.patientName}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                              <FaCalendarAlt /> {new Date(record.date).toLocaleDateString()}
                            </p>
                            {record.patientAge && (
                              <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">
                                {record.patientAge} Yrs
                              </p>
                            )}
                            {record.patientGender && (
                              <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest bg-purple-50 px-1.5 py-0.5 rounded">
                                {record.patientGender}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteRecord(record.id)}
                        className="p-2 text-rose-200 hover:text-rose-600 transition-colors"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-bold">Assessment:</span>
                        <span className="bg-slate-50 px-3 py-1 rounded-lg font-black text-slate-700">{record.diseaseType}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-bold">Result:</span>
                        <span className={`font-black ${record.result?.toLowerCase().includes('pos') || record.result?.toLowerCase().includes('detect') || record.result?.toLowerCase().includes('risk') ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {record.result}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                       <button 
                        onClick={() => setSelectedRecord(record)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 group-hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200/20 active:scale-95"
                       >
                         <FaFileMedical /> View Full Report <FaArrowRight className="text-xs" />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Overlay for Full Report */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="bg-white w-full max-w-5xl max-h-full overflow-y-auto rounded-[3rem] shadow-2xl relative custom-scrollbar"
              >
                <div className="sticky top-0 right-0 p-6 flex justify-end z-10 pointer-events-none">
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="p-3 bg-white/20 hover:bg-rose-500 backdrop-blur-lg text-white rounded-full transition-all pointer-events-auto border border-white/20"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="p-4 md:p-12">
                   <AdvancedReport 
                      data={selectedRecord.advancedReport}
                      diseaseType={selectedRecord.diseaseType}
                      patientInfo={{
                        name: selectedRecord.patientName,
                        age: selectedRecord.patientAge,
                        gender: selectedRecord.patientGender
                      }}
                      // Fallback confidence/gradcam if they exist in record (we'll update diagnosis pages later)
                      confidence={selectedRecord.confidence}
                      gradcam={selectedRecord.gradcam}
                   />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}
