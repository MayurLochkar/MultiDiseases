import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pneumonia from "./pages/Pneumonia";
import BrainTumor from "./pages/BrainTumor";
import SkinCancer from "./pages/SkinCancer";
import Heart from "./pages/Heart";
import Diabetes from "./pages/Diabetes";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
