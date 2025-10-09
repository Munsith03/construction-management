import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthContext from "./context/AuthContext.jsx";

import Home from "./pages/Home.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import OTPVerification from "./pages/OTPVerification.jsx";

import Dashboard from "./pages/Auth/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import Tasks from "./pages/Tasks.jsx";
import UseManagment from "./pages/Auth/AdminPanel.jsx";
import AdminPanel from "./pages/Auth/AdminPanel.jsx";

// ✅ Materials pages
import MaterialsPage from "./pages/Materials/MaterialsPage.jsx";
import MaterialForm from "./pages/Materials/MaterialForm.jsx";
import MaterialDetail from "./pages/Materials/MaterialDetail.jsx";
import MaterialDashboard from "./pages/MaterialDashboard.jsx";

import BudgetManagement from "./pages/BudgetManagement.jsx";

import AuthCallback from "./pages/AuthCallback.jsx";

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
          <Route path="/home" element={<Home />} />
          {/* Auth layout */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
          </Route>

          {/* Social login callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected app routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UseManagment />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />

            <Route path="budget" element={<BudgetManagement />} />

            {/* ✅ Materials routes */}
            <Route path="materials" element={<MaterialDashboard />} />
            <Route path="materials/new" element={<MaterialForm />} />
            <Route path="materials/:id" element={<MaterialDetail />} />
          </Route>

          {/* Admin Panel */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Super Admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/signin" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
