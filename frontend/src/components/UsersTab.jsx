import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import UserTable from "./UserTable";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

const UsersTab = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token provided");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch users
        const usersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(usersRes.data);

        // Fetch roles
        const rolesRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/roles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRoles(rolesRes.data);

        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response); // Debug log
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDeleteUser = async (userId) => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    console.log("Deleting user with ID:", userId); // Debug log
    console.log("Token for delete:", token); // Debug log

    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.filter((user) => user._id !== userId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    if (!selectedRoleId) {
      setError("Please select a role to assign");
      return;
    }

    console.log(
      "Assigning role ID:",
      selectedRoleId,
      "to user ID:",
      selectedUserId
    ); // Debug log
    console.log("Token for assign:", token); // Debug log

    setIsLoading(true);
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/admin/users/${selectedUserId}/roles`,
        { userId: selectedUserId, roleId: selectedRoleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUsers = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(updatedUsers.data);
      setShowAssignRoleModal(false);
      setSelectedRoleId("");
      setSelectedUserId(null);
      setError("");
    } catch (err) {
      console.error("Assign role error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to assign role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-12">
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900 focus:outline-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Users</h3>
      <UserTable
        users={users}
        onDelete={handleDeleteUser}
        onAssignRole={(userId) => {
          setSelectedUserId(userId);
          setShowAssignRoleModal(true);
        }}
        isLoading={isLoading}
      />
      {showAssignRoleModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Role to User
            </h3>
            <div className="mb-4">
              <label
                htmlFor="roleSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Select Role
              </label>
              <select
                id="roleSelect"
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                disabled={isLoading}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowAssignRoleModal(false);
                  setSelectedRoleId("");
                  setSelectedUserId(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignRole}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" color="Black" />

                    <span>Assigning...</span>
                  </div>
                ) : (
                  "Assign Role"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
