import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthContext from "./context/AuthContext.jsx";

import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import OTPVerification from "./pages/OTPVerification.jsx";

import Dashboard from "./pages/Auth/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import Tasks from "./pages/Tasks.jsx";
import AdminPanel from "./pages/Auth/AdminPanel.jsx";

// ✅ Materials pages
import MaterialsPage from "./pages/Materials/MaterialsPage.jsx";
import MaterialForm from "./pages/Materials/MaterialForm.jsx";
import MaterialDetail from "./pages/Materials/MaterialDetail.jsx";

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
          {/* Auth layout */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
          </Route>

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
            <Route path="Projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />

            {/* ✅ Materials routes */}
            <Route path="materials" element={<MaterialsPage />} />
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
