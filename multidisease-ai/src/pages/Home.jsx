import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionTemplate } from "framer-motion";
import { 
  FaHeartbeat, FaBrain, FaLungs, FaUserMd, FaShieldAlt, 
  FaChartLine, FaArrowRight, FaCheckCircle, FaFingerprint 
} from "react-icons/fa";
import { GiCancer } from "react-icons/gi";
import { FcGoogle } from "react-icons/fc";

// --- 1. SCROLL REVEAL COMPONENT ---
const RevealOnScroll = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// --- 2. MOUSE SPOTLIGHT BACKGROUND ---
const SpotlightBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(600px at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.15), transparent 80%)`;

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#FDFEFF]">
      {/* Static Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L30 60 M0 30 L60 30' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/svg%3E")` }}>
      </div>
      
      {/* Interactive Mouse Glow */}
      <motion.div 
        className="absolute inset-0 opacity-100"
        style={{ background }}
      />

      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );
};

export default function Home() {
  const { user, loginWithGoogle, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Smooth scroll progress bar
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Parallax effects
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const rotateImage = useTransform(scrollYProgress, [0, 1], [0, -5]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const diseases = [
    { icon: <FaLungs />, name: "Pneumonia", link: "/pneumonia", desc: "X-ray analysis for bacterial or viral lung infections.", color: "from-blue-500 to-cyan-400" },
    { icon: <FaBrain />, name: "Brain Tumor", link: "/braintumor", desc: "MRI scan processing to detect abnormal growth patterns.", color: "from-purple-500 to-indigo-400" },
    { icon: <GiCancer />, name: "Skin Cancer", link: "/skincancer", desc: "Dermoscopy image analysis for melanoma detection.", color: "from-rose-500 to-pink-400" },
    { icon: <FaHeartbeat />, name: "Heart Disease", link: "/heart", desc: "Analyzing cardiovascular metrics for risk patterns.", color: "from-red-500 to-orange-400" },
    { icon: <FaUserMd />, name: "Diabetes", link: "/diabetes", desc: "Predictive modeling based on glucose & vital records.", color: "from-emerald-500 to-teal-400" },
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-blue-600/10 selection:text-blue-700 overflow-x-hidden">
      
      <SpotlightBackground />
      
      {/* --- SCROLL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[120]" style={{ scaleX }} />

      {/* --- ISLAND NAVBAR (Requested Style) --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 px-4 ${isScrolled ? "pt-4" : "pt-8"}`}>
        <div className={`max-w-7xl mx-auto rounded-full transition-all duration-700 flex items-center justify-between px-8 py-4 
          ${isScrolled ? "bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50" : "bg-white shadow-sm border-transparent"}`}>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:rotate-[15deg] transition-transform duration-300">
              <FaHeartbeat className="text-white text-xl animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic text-slate-800">
              MultiDisease <span className="text-blue-600">AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {["Home", "Pneumonia", "Brain Tumor", "Skin Cancer", "Heart"].map((item) => (
              <Link 
                key={item} 
                to={`/${item.toLowerCase().replace(" ", "")}`} 
                className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 relative group"
              >
                {item}
              </Link>
            ))}
          </div>

          {user ? (
            <button 
              onClick={logout}
              className="bg-red-50 text-red-600 px-8 py-3 rounded-full font-bold text-sm hover:bg-red-100 hover:shadow-xl hover:shadow-red-200 transition-all active:scale-95 flex items-center gap-2"
            >
              Sign Out
            </button>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="bg-slate-950 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <FcGoogle className="bg-white rounded-full p-0.5 text-lg" /> Please Login
            </button>
          )}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-32 flex items-center min-h-screen">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-blue-100 mb-10 shadow-sm">
              <FaFingerprint className="text-blue-600 text-sm" />
              <span className="text-xs font-black text-blue-700 tracking-[0.3em] uppercase">Trusted Medical Intelligence</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-950">
              AI Multi-Disease <br />
              <span className="shiny-text py-3 inline-block">Risk Prediction</span>
            </h1>

            <p className="mt-10 text-2xl text-slate-600 leading-relaxed max-w-xl font-medium">
              Transforming patient outcomes through advanced <strong>Deep Learning CNNs</strong>. Clinical accuracy in milliseconds.
            </p>

            <div className="mt-12 flex flex-wrap gap-6">
              <Link to="/pneumonia">
                <button className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-blue-600 hover:-translate-y-2 transition-all duration-500 flex items-center gap-4">
                  Start Analysis <FaArrowRight />
                </button>
              </Link>
              <button className="px-12 py-6 bg-white text-slate-800 border-2 border-slate-100 rounded-[2rem] font-black text-lg hover:border-blue-200 hover:bg-slate-50 transition-all duration-300">
                Methodology
              </button>
            </div>
          </motion.div>

          {/* Hero Image - Floating Parallax */}
          <motion.div 
            style={{ y: yImage, rotate: rotateImage }}
            className="relative hidden lg:block"
          >
            <div className="relative group">
              {/* Blur Effect Behind Image */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-[4rem] blur-3xl -z-10 transition-all duration-700 group-hover:from-blue-500/20 group-hover:to-teal-500/20"></div>
              
              {/* Main Image */}
              <img 
                src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000&auto=format&fit=crop" 
                alt="Medical AI Dashboard"
                className="relative rounded-[4rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] border-[14px] border-white object-cover aspect-[4/5] w-full max-w-[550px] mx-auto transition-transform duration-700 group-hover:scale-[1.02]"
              />
              
              {/* Floating UI Card 1 (Top Right) */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 hidden md:block"
              >
                 <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 font-bold text-xl">99%</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Accuracy</p>
                      <p className="text-sm font-black text-slate-900">Verified</p>
                    </div>
                 </div>
              </motion.div>

              {/* Floating UI Card 2 (Bottom Left) */}
              <motion.div 
                animate={{ y: [0, -25, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"><FaCheckCircle className="text-3xl" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-black text-slate-900">100% Secure</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- DISEASE GRID --- */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 mb-8 tracking-tighter">Diagnostic Capabilities</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">Our specialized AI models are trained on millions of clinical data points to provide precise predictions.</p>
            </div>
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {diseases.map((item, index) => (
              <RevealOnScroll key={index}>
                <motion.div
                  whileHover={{ y: -20, scale: 1.02 }}
                  className="group relative bg-slate-50/50 p-10 rounded-[3.5rem] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden h-full flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}></div>
                  
                  <div className={`w-16 h-16 rounded-[1.8rem] bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-3xl shadow-xl mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {item.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">{item.name}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-grow">{item.desc}</p>
                  
                  <Link to={item.link} className="inline-flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest group/btn">
                    Analyze Scan 
                    <FaArrowRight className="text-[10px] group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </Link>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-32 bg-[#0F172A] text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/10 rounded-full blur-[160px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <RevealOnScroll>
            <h2 className="text-5xl md:text-6xl font-black text-center mb-28 tracking-tighter">Diagnostic <span className="text-blue-400">Pipeline</span></h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-20 relative">
            <div className="hidden md:block absolute top-1/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent"></div>

            {[
              { icon: <FaShieldAlt />, title: "Select Module", desc: "Choose the specific disease category for evaluation." },
              { icon: <FaChartLine />, title: "Data Ingest", desc: "Securely upload X-rays, MRI scans, or vital metrics." },
              { icon: <FaHeartbeat />, title: "Neural Output", desc: "Receive clinical-grade risk reports in seconds." }
            ].map((step, i) => (
              <RevealOnScroll key={i}>
                <div className="text-center relative group">
                  <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-4xl text-blue-400 mx-auto mb-10 border border-slate-700 shadow-2xl group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-500">
                    {step.icon}
                  </div>
                  <h3 className="text-3xl font-black mb-6 tracking-tight">{step.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed font-medium px-4">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
          <RevealOnScroll>
            <div className="relative">
             <img 
  src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop" 
  alt="Lab Analysis"
  // 👇 Maine "aspect-video" hata diya aur "h-[400px] w-full" laga diya
  className="rounded-[4rem] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.2)] border-[12px] border-white h-[400px] w-full object-cover"
/>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-12 -right-12 bg-blue-600 text-white p-12 rounded-[3.5rem] hidden md:block shadow-2xl"
              >
                <p className="text-6xl font-black tracking-tighter leading-none">99.9%</p>
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mt-2">Uptime AI</p>
              </motion.div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <h2 className="text-5xl md:text-6xl font-black text-slate-950 mb-12 leading-[1] tracking-tighter">Technology for <br /> Future Health</h2>
            <div className="grid sm:grid-cols-2 gap-12">
              {[
                { t: "Multi-Modal AI", d: "Processes scans and patient records together." },
                { t: "Pixel-Analysis", d: "Localized abnormality heatmap detection." },
                { t: "Data Vault", d: "End-to-end encrypted storage protocols." },
                { t: "Inference Engine", d: "Rapid sub-second prediction generation." }
              ].map((f, i) => (
                <div key={i} className="group">
                  <div className="h-2 w-16 bg-blue-600 mb-6 rounded-full group-hover:w-24 transition-all duration-500"></div>
                  <h4 className="text-2xl font-black text-slate-950 mb-4 tracking-tight leading-tight">{f.t}</h4>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium">{f.d}</p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 pt-28 pb-12 border-t border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-200 pb-16 mb-12 gap-12">
            <div className="flex items-center gap-4">
               <div className="bg-blue-600 p-3 rounded-2xl shadow-xl"><FaHeartbeat className="text-white text-3xl" /></div>
               <span className="text-4xl font-black tracking-tighter uppercase italic text-slate-900">MultiDisease <span className="text-blue-600">AI</span></span>
            </div>
            <div className="flex gap-12 text-sm font-black text-slate-400 uppercase tracking-[0.25em]">
              <a href="#" className="hover:text-blue-600 transition-colors">Neural</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm font-medium italic max-w-2xl mx-auto mb-10 leading-relaxed">
            Disclaimer: AI risk assessment is for educational assistance only. Always consult a certified medical professional for diagnosis.
          </p>
          <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.5em]">
            © 2026 MultiDisease AI. Engineered for Clinical Excellence.
          </p>
        </div>
      </footer>

      {/* --- REFINED STYLES & ANIMATIONS --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }

        .shiny-text {
          background: linear-gradient(120deg, #020617 30%, #3b82f6 50%, #020617 70%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shine 5s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
        
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #FDFEFF; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; border: 4px solid #FDFEFF; }
        ::-webkit-scrollbar-thumb:hover { background: #3B82F6; }
      `}} />
    </div>
  );
}