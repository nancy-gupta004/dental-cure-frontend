import { Navigate } from "react-router-dom";
import { getStoredUser } from "../../utils/auth";

// Redirects non-admin users away from admin-only pages
function AdminOnly({ children }) {
  const user = getStoredUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminOnly;