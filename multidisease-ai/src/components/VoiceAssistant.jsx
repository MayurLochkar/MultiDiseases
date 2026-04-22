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
        
        // ✨ High-Quality English Voice Selection
        // Prioritize premium natural sounding voices if available
        const premiumEnglish = voices.find(v => 
          v.name.includes('Google US English') || 
          v.name.includes('Samantha') || 
          v.name.includes('Microsoft Zira') ||
          v.name.includes('English (United States)')
        );
        
        const generalEnglish = voices.find(v => v.lang.startsWith('en'));
        
        if (premiumEnglish) {
          utterance.voice = premiumEnglish;
          utterance.lang = 'en-US';
        } else if (generalEnglish) {
          utterance.voice = generalEnglish;
          utterance.lang = generalEnglish.lang;
        }

        // 👄 Tone Optimization for a Professional Medical Feel
        utterance.rate = 0.9;  // Slightly slower for better clarity
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0;
        
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
