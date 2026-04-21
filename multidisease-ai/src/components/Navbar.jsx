import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHeartbeat, FaSignOutAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  console.log("Navbar Loaded! loginWithGoogle available:", !!loginWithGoogle);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Pneumonia", path: "/pneumonia" },
    { name: "Brain Tumor", path: "/braintumor" },
    { name: "Skin Cancer", path: "/skincancer" },
    { name: "Heart", path: "/heart" },
    { name: "Diabetes", path: "/diabetes" },
    { name: "Records", path: "/records" },
  ];

  return (
    // Floating Container: Yeh screen ke top se thoda niche rahega agar scroll nahi hai
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-0 sm:px-6 ${scrolled ? "pt-0" : "pt-4"}`}>
      
      <nav
        className={`mx-auto max-w-7xl transition-all duration-500 ease-in-out
          bg-white/90 backdrop-blur-xl
          /* Niche se dono side curve */
          rounded-b-[30px] sm:rounded-b-[40px] 
          /* Stylish Border & Shadow */
          border-x border-b border-blue-50
          ${scrolled 
            ? "shadow-[0_20px_50px_rgba(59,130,246,0.15)] py-3" 
            : "shadow-[0_10px_30px_rgba(0,0,0,0.04)] py-5"
          }
        `}
      >
        <div className="flex items-center justify-between px-8">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <FaHeartbeat className="text-white text-xl" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-gray-800">
              MultiDisease <span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Nav Links - Glass Pill Effect */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
            {navItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === item.path
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50/50 py-1.5 px-2.5 rounded-full border border-blue-100">
                <img 
                  src={user.photoURL || "https://ui-avatars.com/api/?name=User"} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-semibold text-gray-700 pr-1 truncate max-w-[120px]">
                  {user.displayName?.split(" ")[0] || "User"}
                </span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-colors text-sm"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 text-sm"
            >
              <FcGoogle className="bg-white rounded-full p-0.5 text-lg" />
              <span>Login</span>
            </button>
          )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <HiX className="text-2xl" /> : <HiMenuAlt3 className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Animated) */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 space-y-3 border-t border-gray-50 mt-4">
            {navItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-2xl font-medium transition-all ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Button */}
            <div className="pt-4 mt-2 border-t border-gray-100">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-2">
                    <img src={user.photoURL || "https://ui-avatars.com/api/?name=User"} alt="Avatar" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-800">{user.displayName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => { loginWithGoogle(); setIsOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium">
                  <FcGoogle className="bg-white rounded-full p-0.5 text-lg" /> Login with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}