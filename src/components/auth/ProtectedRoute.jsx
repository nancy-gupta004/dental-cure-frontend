import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

// Redirects to /login when there is no valid token
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;