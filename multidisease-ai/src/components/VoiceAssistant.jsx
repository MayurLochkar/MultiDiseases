import React, { useState, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function VoiceAssistant({ message, startSpeaking }) {
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    // Some browsers need this event to load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (startSpeaking && isVoiceOn && message && voices.length > 0) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop playing anything current
        
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Find a good Indian voice (Prefer Google Hindi, then any hi-IN, then en-IN)
        const googleHindi = voices.find(v => v.name.includes('Google हिन्दी') || v.name.includes('hi-IN'));
        const indianEng = voices.find(v => v.lang === 'en-IN');
        
        if (googleHindi) {
          utterance.voice = googleHindi;
          utterance.lang = 'hi-IN';
        } else if (indianEng) {
          utterance.voice = indianEng;
          utterance.lang = 'en-IN';
        }

        // Tweak properties for a better and softer voice
        utterance.rate = 0.95; 
        utterance.pitch = 1.05; 
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [startSpeaking, isVoiceOn, message, voices]);

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 w-fit">
      <span className="text-sm font-medium text-slate-600">Voice Assistant:</span>
      <button 
        onClick={() => {
          setIsVoiceOn(!isVoiceOn);
          if (isVoiceOn) window.speechSynthesis.cancel(); // Stop if toggled off while speaking
        }}
        className={`p-2 rounded-full transition-colors flex items-center justify-center ${isVoiceOn ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
        title={isVoiceOn ? "Voice On" : "Voice Off"}
      >
        {isVoiceOn ? <FaVolumeUp size={16} /> : <FaVolumeMute size={16} />}
      </button>
    </div>
  );
}
