import { Navigate } from "react-router-dom";

export const AdminProtectedRoute = ({ allowedRoles, children }) => {
  const role = localStorage.getItem("user_role");

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
