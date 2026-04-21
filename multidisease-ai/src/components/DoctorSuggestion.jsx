import React from 'react';
import { FaUserMd } from 'react-icons/fa';

const doctorMap = {
  Pneumonia: "Pulmonologist",
  BrainTumor: "Neurologist",
  SkinCancer: "Dermatologist",
  Heart: "Cardiologist",
  Diabetes: "Endocrinologist"
};

export default function DoctorSuggestion({ diseaseType }) {
  const doctor = doctorMap[diseaseType];
  
  if (!doctor) return null;

  return (
    <div className="flex items-center gap-4 bg-green-50 border border-green-200 p-4 rounded-2xl shadow-sm mb-6 mt-4">
      <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md">
        <FaUserMd className="text-2xl" />
      </div>
      <div>
        <p className="text-sm text-green-700 font-semibold uppercase tracking-wider">Recommended Doctor</p>
        <p className="text-lg font-bold text-slate-800">{doctor}</p>
      </div>
    </div>
  );
}
