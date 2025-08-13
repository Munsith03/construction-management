import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthContext from "./context/AuthContext.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import OTPVerification from "./pages/OTPVerification.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import Tasks from "./pages/Tasks.jsx";
// import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel.jsx";
// import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/signin" />;
  if (
    requiredRole &&
    !user?.roles?.some((role) => role.name === requiredRole)
  ) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
          </Route>

          {/* Protected app routes with outlet pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            <Route path="projects" element={<Projects />} />
            {/* <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Settings />} /> */}

              <Route path="tasks" element={<Tasks />} />
              
          </Route>

          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Super Admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/signin" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
