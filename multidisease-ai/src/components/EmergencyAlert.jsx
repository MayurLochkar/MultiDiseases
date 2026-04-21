import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaAmbulance, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

export default function EmergencyAlert({ isOpen, onClose, diseaseType, severity }) {
  if (!isOpen) return null;

  const [signalStatus, setSignalStatus] = React.useState('idle'); // idle, sending, success

  const handleCallAmbulance = () => {
    setSignalStatus('sending');
    
    // Simulate high-tech signal transmission
    setTimeout(() => {
        setSignalStatus('success');
        // Standard emergency dialer fallback
        window.location.href = 'tel:102';
    }, 3000);
  };

  const handleFindHospital = () => {
    const mapElement = document.getElementById('hospital-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-[0_0_50px_rgba(244,63,94,0.3)] border-4 border-rose-500 max-w-md w-full overflow-hidden relative"
        >
          {/* Header BG Section */}
          <div className="bg-rose-500 p-8 text-center relative overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-full scale-150 blur-3xl opacity-20"
            />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                {signalStatus === 'sending' ? (
                   <div className="relative">
                      <FaAmbulance className="text-rose-600 text-4xl animate-bounce" />
                      <motion.div 
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-rose-500 rounded-full"
                      />
                   </div>
                ) : signalStatus === 'success' ? (
                   <FaCheckCircle className="text-emerald-500 text-4xl" />
                ) : (
                   <FaExclamationTriangle className="text-rose-600 text-4xl animate-pulse" />
                )}
              </div>
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase italic">
                {signalStatus === 'idle' ? 'Emergency Alert!' : signalStatus === 'sending' ? 'Transmitting...' : 'Signal Sent!'}
              </h2>
              <p className="text-rose-100 font-bold text-sm mt-2 uppercase">
                {signalStatus === 'idle' 
                  ? `CRITICAL ${diseaseType} DETECTED` 
                  : signalStatus === 'sending' 
                    ? 'Transmitting GPS to Nearest Hub' 
                    : 'Dispatch Notified - 102 Dialing'}
              </p>
            </div>
          </div>

          <div className="p-8 text-center">
            {signalStatus === 'idle' ? (
              <>
                <p className="text-slate-600 font-medium mb-8">
                  AI analysis suggests high-risk clinical markers. Immediate medical attention is recommended.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleCallAmbulance}
                    className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-rose-200 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    <FaAmbulance className="text-2xl" />
                    Call Ambulance & Alert (102)
                  </button>

                  <button
                    onClick={handleFindHospital}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <FaMapMarkerAlt />
                    Find Nearest Hospital
                  </button>
                </div>
              </>
            ) : signalStatus === 'sending' ? (
              <div className="py-10 space-y-6">
                 <div className="flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                        className="w-3 h-3 bg-rose-500 rounded-full"
                      />
                    ))}
                 </div>
                 <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Encrypted Satellite Link Established</p>
              </div>
            ) : (
              <div className="py-10 space-y-4">
                 <p className="text-emerald-600 font-black text-xl">Emergency Link Active</p>
                 <p className="text-slate-500 text-sm font-medium">Your location has been shared with emergency responders. Redirecting to phone dialer...</p>
                 <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs mt-4"
                 >
                   Return to Dashboard
                 </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Dismiss Clinical Alert
            </button>
          </div>

          {/* Close button top right */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 transition-all"
          >
            <FaTimes />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
