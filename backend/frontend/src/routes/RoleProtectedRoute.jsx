import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import PropTypes from "prop-types";

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />; // Renders nested routes
};

RoleProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RoleProtectedRoute;
