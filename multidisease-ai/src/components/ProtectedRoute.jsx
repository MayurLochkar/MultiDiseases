import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If there is no user logged in, immediately redirect them to the home page (where they can log in via Navbar)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
