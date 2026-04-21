import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        {/* 🤖 Floating AI Assistant — visible on every page */}
        <FloatingChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
