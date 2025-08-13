import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const isSuperAdmin = user?.roles?.some((role) => role.name === "Super Admin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Dashboard</h2>
        <p className="mb-4">Welcome, {user?.email || "User"}!</p>
        <p className="mb-4">
          Roles: {user?.roles?.map((r) => r.name).join(", ") || "None"}
        </p>
        {isSuperAdmin && (
          <Link
            to="/admin"
            className="block mb-4 text-blue-600 hover:underline"
          >
            Go to Admin Panel
          </Link>
        )}
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
