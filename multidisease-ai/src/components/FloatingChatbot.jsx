import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaSync } from "react-icons/fa";
import { useLocation } from "react-router-dom";

// ═══════════════════════════════════════════════════════════
// 🔒 API KEY is on the BACKEND (server/.env) — NOT here
//    Frontend calls: http://localhost:5001/api/chat
// ═══════════════════════════════════════════════════════════
const CHAT_API_URL = "http://localhost:5001/api/chat";

// ═══════════════════════════════════════════════════════════
// Disease page config — route → info
// ═══════════════════════════════════════════════════════════
const DISEASE_CONFIG = {
  "/pneumonia": {
    name: "Pneumonia",
    emoji: "🫁",
    color: "#3b82f6",
    desc: "chest X-ray based lung infection detection",
    quickQs: [
      "What is Pneumonia?",
      "What are Pneumonia symptoms?",
      "How is Pneumonia treated?",
      "How to prevent Pneumonia?",
    ],
  },
  "/braintumor": {
    name: "Brain Tumor",
    emoji: "🧠",
    color: "#8b5cf6",
    desc: "MRI-based brain tumor classification",
    quickQs: [
      "What is a Brain Tumor?",
      "What are types of Brain Tumors?",
      "What do MRI results mean?",
      "What treatments exist for Brain Tumors?",
    ],
  },
  "/skincancer": {
    name: "Skin Cancer",
    emoji: "🔬",
    color: "#f59e0b",
    desc: "dermoscopy image-based skin lesion detection",
    quickQs: [
      "What is Skin Cancer?",
      "What does melanoma look like?",
      "How is Skin Cancer diagnosed?",
      "How to prevent Skin Cancer?",
    ],
  },
  "/heart": {
    name: "Heart Disease",
    emoji: "❤️",
    color: "#ef4444",
    desc: "clinical parameters based heart risk assessment",
    quickQs: [
      "What is Heart Disease?",
      "What causes Heart Disease?",
      "What do the clinical values mean?",
      "How to reduce heart risk?",
    ],
  },
  "/diabetes": {
    name: "Diabetes",
    emoji: "🩸",
    color: "#10b981",
    desc: "blood glucose and insulin-based diabetes prediction",
    quickQs: [
      "What is Diabetes?",
      "What is HbA1c and glucose level?",
      "Type 1 vs Type 2 Diabetes?",
      "How to manage Diabetes?",
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// System prompt — STRICT: sirf current disease ke baare mein
// ═══════════════════════════════════════════════════════════
const buildSystemPrompt = (disease, diagContext) => {
  if (!disease) {
    return `You are MediBot, an AI assistant for a Multi-Disease Diagnostic Platform.
You ONLY answer questions about these 5 diseases: Pneumonia, Brain Tumor, Skin Cancer, Heart Disease, Diabetes.
If someone asks about anything unrelated to these diseases or medical diagnostics, politely say:
"I can only help with information about Pneumonia, Brain Tumor, Skin Cancer, Heart Disease, or Diabetes. Please navigate to a disease page to get started!"
Keep answers short, clear, and friendly. Always recommend consulting a real doctor.`;
  }

  let prompt = `You are MediBot, an AI assistant specialized ONLY in ${disease.name} (${disease.desc}).

STRICT RULES:
1. You ONLY answer questions about ${disease.name}. 
2. If asked about ANY other topic, politely refuse.
3. PROVIDE SOLUTIONS: Base your advice on the latest diagnosis findings if provided.
4. Always say "consult a doctor" for final medical decisions.

You can explain: symptoms, causes, risk factors, treatment options, prevention, and what AI diagnostic results mean.`;

  if (diagContext) {
    prompt += `\n\n[REAL PATIENT FINDINGS]:
    Diagnosis: ${diagContext.result}
    Confidence/Severity: ${diagContext.confidence}
    Please provide specific medical solutions and advice based ON THESE FINDINGS.`;
  }

  return prompt;
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
export default function FloatingChatbot() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [pulse,     setPulse]     = useState(true);
  const [prevPath,  setPrevPath]  = useState("");

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const location       = useLocation();

  const disease = DISEASE_CONFIG[location.pathname] || null;
  const accentColor = disease?.color || "#6366f1";

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Stop pulse after 6s ──
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // ── Sync with latest diagnosis ──
  const [diagContext, setDiagContext] = useState(null);

  useEffect(() => {
    const syncDiag = () => {
      const stored = localStorage.getItem('latest_diagnosis');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only show context if it matches current disease
          if (disease && parsed.disease.toLowerCase().includes(disease.name.toLowerCase())) {
            setDiagContext(parsed);
          } else {
            setDiagContext(null);
          }
        } catch {
          setDiagContext(null);
        }
      }
    };
    syncDiag();
    window.addEventListener('storage', syncDiag);
    const interval = setInterval(syncDiag, 2000); // Polling as backup
    return () => {
      window.removeEventListener('storage', syncDiag);
      clearInterval(interval);
    };
  }, [disease]);

  // ── Reset chat when disease page changes ──
  useEffect(() => {
    if (location.pathname === prevPath) return;
    setPrevPath(location.pathname);

    // Clear local diagnosis when switching pages to keep context clean
    // (Optional: depending on if you want the bot to remember past scans)
    // localStorage.removeItem('latest_diagnosis'); 

    // Only auto-reset if chat is already open
    if (isOpen) {
      setMessages(buildGreeting(DISEASE_CONFIG[location.pathname] || null));
    } else {
      // Clear messages so fresh greeting shows on next open
      setMessages([]);
    }
  }, [location.pathname]);

  // ── Build greeting message ──
  const buildGreeting = (d) => {
    if (!d) {
      return [{
        role: "assistant",
        content: `👋 Hi! I'm **MediBot**.\n\nI can answer questions about **Pneumonia**, **Brain Tumor**, **Skin Cancer**, **Heart Disease**, and **Diabetes**.\n\nPlease navigate to a disease page to get started!`
      }];
    }
    return [{
      role: "assistant",
      content: `${d.emoji} Hi! I'm **MediBot**, your **${d.name}** specialist.\n\nI can help you understand ${d.name} — symptoms, causes, treatments, and what your AI results mean.\n\n⚠️ I only answer questions about **${d.name}** on this page. Ask me anything!`
    }];
  };

  // ── Open chatbot ──
  const handleOpen = () => {
    setIsOpen(true);
    setPulse(false);
    if (messages.length === 0) {
      setMessages(buildGreeting(disease));
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Send message to Backend Proxy ──
  const sendMessage = useCallback(async (overrideText = null) => {
    const userText = (overrideText || input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(disease, diagContext),
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection lost. Please ensure the backend server is running and try again." },
      ]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, messages, loading, disease]);

  // ── Quick prompt send ──
  const sendQuickPrompt = async (q) => {
    if (loading) return;

    const newMsgs = [...messages, { role: "user", content: q }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(disease, diagContext),
        }),
      });
      const data = await res.json();
      const reply = data.error ? `❌ ${data.error}` : data.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Server error. Please check your connection." }]);
    }

    setLoading(false);
  };

  // ── Reset chat (manual) ──
  const resetChat = () => {
    setMessages(buildGreeting(disease));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render markdown-lite: **bold** and \n ──
  const renderText = (text) => {
    return text.split(/(\\n|\n|\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part === "\n" || part === "\\n") return <br key={i} />;
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  const quickQs = disease?.quickQs || [];
  const showQuickPrompts = messages.length <= 1 && quickQs.length > 0;

  return (
    <>
      {/* ═══ Floating Button ═══ */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">

        {/* Tooltip bubble */}
        <AnimatePresence>
          {!isOpen && pulse && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0,  scale: 1   }}
              exit={{   opacity: 0, x: 20, scale: 0.8  }}
              className="bg-white text-slate-700 text-sm font-semibold px-4 py-2 rounded-full shadow-xl border border-slate-100 whitespace-nowrap"
            >
              {disease ? `${disease.emoji} Ask about ${disease.name}` : "💬 Ask MediBot!"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          id="medibot-float-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl focus:outline-none"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
            boxShadow: `0 8px 32px ${accentColor}66`,
            transition: "background 0.4s ease, box-shadow 0.4s ease",
          }}
          aria-label="Open MediBot AI Assistant"
        >
          {pulse && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: `${accentColor}44` }}
            />
          )}
          <AnimatePresence mode="wait">
            {isOpen
              ? <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate:  90, opacity: 0 }}
                  transition={{ duration: 0.18 }}>
                  <FaTimes className="text-white text-xl" />
                </motion.span>
              : <motion.span key="bot"
                  initial={{ rotate: 90,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}>
                  <FaRobot className="text-white text-xl" />
                </motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ═══ Chat Window ═══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="medibot-chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 40, scale: 0.88  }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div
              className="rounded-[1.75rem] overflow-hidden shadow-2xl border border-slate-200/60"
              style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)" }}
            >

              {/* ── Header ── */}
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }}
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xl">
                  {disease ? disease.emoji : <FaRobot className="text-white text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">
                    MediBot {disease ? `— ${disease.name}` : "AI"}
                  </p>
                  <p className="text-white/70 text-[11px] mt-0.5 truncate">
                    {disease
                      ? `Specialist for ${disease.name} only`
                      : "Navigate to a disease page to begin"}
                  </p>
                </div>
                {/* Reset button */}
                <button
                  onClick={resetChat}
                  title="New chat"
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors mr-1"
                >
                  <FaSync className="text-white text-xs" />
                </button>
                {/* Online indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/70 text-[11px]">Live</span>
                </div>
              </div>

              {/* ── Disease badge (when on a disease page) ── */}
              {disease && (
                <div
                  className="px-4 py-2 text-[11px] font-semibold flex items-center gap-1.5 border-b border-slate-100"
                  style={{ background: `${accentColor}12`, color: accentColor }}
                >
                  <span>📌 This chatbot only answers about <strong>{disease.name}</strong></span>
                </div>
              )}

              {/* ── Messages ── */}
              <div
                className="h-64 overflow-y-auto px-4 py-3 space-y-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 text-sm"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }}
                      >
                        {disease ? disease.emoji : <FaRobot className="text-white text-[10px]" />}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-br-md"
                          : "text-slate-700 rounded-bl-md border border-slate-100"
                      }`}
                      style={msg.role === "user"
                        ? { background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }
                        : { background: "#f8faff" }
                      }
                    >
                      {renderText(msg.content)}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-end gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }}
                    >
                      {disease?.emoji || "🤖"}
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md flex flex-col gap-2 shadow-sm border border-slate-200/50">
                      <div className="flex gap-1 items-center">
                        {[0, 0.18, 0.36].map((delay, i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-blue-500"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.55, repeat: Infinity, delay }}
                          />
                        ))}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Calibrating Diagnostic Nodes...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Prompts (disease-specific, only on first open) ── */}
              {showQuickPrompts && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5 border-t border-slate-50 pt-2">
                  {quickQs.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendQuickPrompt(q)}
                      disabled={loading}
                      className="text-[11px] px-3 py-1.5 rounded-full border font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      style={{
                        borderColor: `${accentColor}44`,
                        color: accentColor,
                        background: `${accentColor}10`,
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Input Bar ── */}
              <div className="px-4 pb-4 pt-2">
                <div
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 transition-all"
                  style={{ outline: "none" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = accentColor}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <input
                    ref={inputRef}
                    id="medibot-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disease ? `Ask about ${disease.name}...` : "Navigate to a disease page..."}
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <button
                    id="medibot-send-btn"
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                    style={{
                      background: input.trim() && !loading
                        ? `linear-gradient(135deg, ${accentColor}, #8b5cf6)`
                        : "#e2e8f0",
                    }}
                    aria-label="Send message"
                  >
                    {loading
                      ? <FaSpinner className="text-slate-400 text-xs animate-spin" />
                      : <FaPaperPlane className={`text-xs ${input.trim() ? "text-white" : "text-slate-400"}`} />
                    }
                  </button>
                </div>

                {/* --- SUGGESTED FOLLOW-UPS --- */}
                {!loading && messages.length > 1 && messages[messages.length - 1].role === "assistant" && (
                    <div className="mt-3 flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {[
                            "Give me short points",
                            "What are the next steps?",
                            "How serious is this?",
                            "Explain clinical risks"
                        ].map((suggest, idx) => (
                            <button
                                key={idx}
                                onClick={() => sendMessage(suggest)}
                                className="whitespace-nowrap text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
                            >
                                {suggest}
                            </button>
                        ))}
                    </div>
                )}

                <p className="text-center text-[10px] text-slate-400 mt-3">
                  Powered by <span style={{ color: accentColor }} className="font-semibold">Google Gemini</span> · Not a substitute for medical advice
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
