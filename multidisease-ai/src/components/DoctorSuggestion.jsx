import React from 'react';
import { FaUserMd, FaHospital, FaCalendarPlus } from 'react-icons/fa';

export default function DoctorSuggestion({ diseaseType, hospital, onBook }) {
  const doctorMap = {
    Pneumonia: "Pulmonologist",
    BrainTumor: "Neurologist",
    SkinCancer: "Dermatology Specialist",
    Heart: "Cardiologist",
    Diabetes: "Endocrinologist"
  };

  const doctor = doctorMap[diseaseType];
  
  if (!doctor) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-8 mt-6">
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 Rotate-6">
          <FaUserMd className="text-3xl" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider">Top Specialist</span>
            {hospital?.name && (
               <span className="flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase tracking-wider">
                 <FaHospital /> {hospital.name}
               </span>
            )}
          </div>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.1em]">Recommended {doctor}</p>
          <p className="text-xl font-black text-slate-800 tracking-tight">Available for Consultation</p>
        </div>
      </div>

      <button 
        onClick={onBook}
        className="w-full md:w-auto px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
      >
        Schedule Appointment <FaCalendarPlus className="text-base" />
      </button>
    </div>
  );
}
