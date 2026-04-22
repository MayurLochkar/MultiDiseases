import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaHospital, FaUserMd, 
  FaCheckCircle, FaTimes, FaFileInvoice, FaShieldAlt 
} from 'react-icons/fa';

export default function AppointmentBooking({ 
  isOpen, 
  onClose, 
  hospital, 
  specialistType,
  patientInfo = { name: "Patient", age: "--", gender: "--" } 
}) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingId] = useState(`MD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

  const timeSlots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white text-center">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <FaTimes />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <FaCalendarAlt className="text-3xl" />
            </div>
            <h2 className="text-2xl font-black tracking-tight italic">
              {step === 1 ? "Schedule Consultation" : "Booking Confirmed"}
            </h2>
            <p className="text-emerald-50/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">
              {step === 1 ? "Digital Scheduling Assistant" : "Confirmed Referral ID: " + bookingId}
            </p>
          </div>

          <div className="p-8">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Details Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Specialist</p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FaUserMd className="text-emerald-500" /> {specialistType}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Facility Contact</p>
                    <div className="flex justify-between items-center">
                       <p className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate">
                           <FaHospital className="text-blue-500" /> {hospital?.name || "Nearby Center"}
                       </p>
                       <p className="text-sm font-black text-emerald-600">
                          {hospital?.phone && hospital.phone !== 'N/A' ? hospital.phone : "Contact Pending"}
                       </p>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Choose Visit Date</label>
                  <input 
                    type="date" 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700" 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Grid */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Available Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                          selectedTime === time 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleBook}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-22xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  Confirm Clinical Appointment <FaShieldAlt />
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6 py-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <FaCheckCircle className="text-5xl text-emerald-600" />
                </motion.div>
                
                <div>
                  <h3 className="text-xl font-black text-slate-800">Registration Successful!</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Your consultation has been priority-scheduled.</p>
                </div>

                <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-3xl text-left space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">ID #</span>
                    <span className="font-black text-slate-800">{bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Patient</span>
                    <span className="font-black text-slate-800">{patientInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Specialist</span>
                    <span className="font-black text-emerald-600">{specialistType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Facility</span>
                    <span className="font-black text-slate-800">{hospital?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">Clinical Contact</span>
                    <span className="font-black text-emerald-600">{hospital?.phone || "Visit Reception"}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button 
                      onClick={onClose}
                      className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg"
                    >
                      Close Window
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 py-4 border-2 border-emerald-600 text-emerald-600 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Print Receipt <FaFileInvoice />
                    </button>
                  </div>
                  
                  {hospital?.phone && hospital.phone !== 'N/A' ? (
                    <a 
                      href={`tel:${hospital.phone}`}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-200"
                    >
                      Call Facility Now <FaClock />
                    </a>
                  ) : (
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(hospital?.name || "Hospital")}+contact+number`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
                    >
                      Search Contact Info <FaHospital />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
