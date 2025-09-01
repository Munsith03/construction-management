import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const RedirectByRole = () => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Define role-to-route mappings
  const roleRedirects = {
    system_admin: "/system-admin", // Example route for system_admin
    restaurant_admin: "/restaurant-admin", // Replace :id with a valid restaurant ID or use a default
    delivery_personnel: "/ready-deliveries", // Redirect to customers for delivery personnel
  };

  // Redirect based on userRole, or to /unauthorized if role is unknown
  const redirectTo = roleRedirects[userRole] || "/unauthorized";
  return <Navigate to={redirectTo} />;
};

RedirectByRole.propTypes = {
  // No props required for this component
};

export default RedirectByRole;
