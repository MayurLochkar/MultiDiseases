import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pneumonia from "./pages/Pneumonia";
import BrainTumor from "./pages/BrainTumor";
import SkinCancer from "./pages/SkinCancer";
import Heart from "./pages/Heart";
import Diabetes from "./pages/Diabetes";
import Records from "./pages/Records";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingChatbot from "./components/FloatingChatbot";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pneumonia" element={<ProtectedRoute><Pneumonia /></ProtectedRoute>} />
          <Route path="/braintumor" element={<ProtectedRoute><BrainTumor /></ProtectedRoute>} />
          <Route path="/skincancer" element={<ProtectedRoute><SkinCancer /></ProtectedRoute>} />
          <Route path="/heart" element={<ProtectedRoute><Heart /></ProtectedRoute>} />
          <Route path="/diabetes" element={<ProtectedRoute><Diabetes /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
        </Routes>
        <Footer />
        {/* 🤖 Floating AI Assistant — visible on every page */}
        <FloatingChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

function Footer() {
  const footerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the aurora blob
  const blobX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const blobY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - 200);
    mouseY.set(e.clientY - rect.top - 200);
  };

  return (
    <footer 
      ref={footerRef}
      onMouseMove={handleMouseMove}
      className="w-full py-10 mt-20 footer-glass relative z-10 overflow-hidden"
    >
      {/* 3D Aurora Blob */}
      <motion.div 
        className="aurora-blob" 
        style={{ x: blobX, y: blobY }}
      />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="text-slate-500 text-sm font-medium">
          © 2026 AI Healthcare Platform. All rights reserved.
        </div>
        
        <DeveloperBadge />
      </div>
    </footer>
  );
}

function DeveloperBadge() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="developer-badge group cursor-default"
    >
      <span 
        style={{ transform: "translateZ(20px)" }}
        className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors"
      >
        Designed & Developed by
      </span>
      <div 
        style={{ transform: "translateZ(30px)" }}
        className="w-px h-5 bg-slate-200 group-hover:bg-blue-400 group-hover:h-6 transition-all"
      />
      <span 
        style={{ transform: "translateZ(50px)" }}
        className="text-2xl holographic-chrome tracking-tight select-none relative"
      >
        Mayur Lochkar
        
        {/* ✨ Glitter Particles */}
        <div className="absolute -inset-4 pointer-events-none overflow-visible">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="glitter-sparkle absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                y: [Math.random() * 40 - 20, Math.random() * 40 - 20]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: i * 0.4 
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${40 + (i % 2) * 20}%`
              }}
            />
          ))}
        </div>
      </span>
      
      {/* Interactive Glare */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
        style={{ transform: "translateZ(10px)" }}
      />
    </motion.div>
  );
}

export default App;
