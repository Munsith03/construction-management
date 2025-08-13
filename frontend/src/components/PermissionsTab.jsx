import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Button from "./Button";
import Input from "./Input";
import LoadingSpinner from "./LoadingSpinner";

const PermissionsTab = () => {
  const { token } = useContext(AuthContext);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [permissionFormData, setPermissionFormData] = useState({
    name: "",
    description: "",
  });
  const [permissionErrors, setPermissionErrors] = useState({});

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token) {
        setError("No authentication token provided");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/permissions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPermissions(res.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response); // Debug log
        setError(err.response?.data?.error || "Failed to fetch permissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, [token]);

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!permissionFormData.name.trim()) {
      newErrors.name = "Permission name is required";
    }
    if (permissionFormData.name.length > 50) {
      newErrors.name = "Permission name cannot exceed 50 characters";
    }
    setPermissionErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!token) {
      setError("No authentication token provided");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating permission with data:", permissionFormData); // Debug log
      console.log("Token for create:", token); // Debug log
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/permissions`,
        permissionFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPermissions([...permissions, res.data]);
      setPermissionFormData({ name: "", description: "" });
      setShowPermissionForm(false);
      setError("");
    } catch (err) {
      console.error("Create error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to create permission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    console.log("Deleting permission with ID:", permissionId); // Debug log
    console.log("Token for delete:", token); // Debug log

    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/permissions/${permissionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPermissions(permissions.filter((perm) => perm._id !== permissionId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response); // Debug log
      if (err.response?.status === 404) {
        setError("Permission not found");
      } else {
        setError(
          err.response?.data?.error ||
            `Failed to delete permission: ${err.message}`
        );
      }
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

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Permissions</h3>
        <Button
          onClick={() => setShowPermissionForm(!showPermissionForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {showPermissionForm ? "Cancel" : "Create Permission"}
        </Button>
      </div>

      {showPermissionForm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create New Permission
            </h3>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <label
                  htmlFor="permissionName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Permission Name
                </label>
                <Input
                  type="text"
                  id="permissionName"
                  name="name"
                  value={permissionFormData.name}
                  onChange={(e) =>
                    setPermissionFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter permission name"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    permissionErrors.name ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                {permissionErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {permissionErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="permissionDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <Input
                  type="text"
                  id="permissionDescription"
                  name="description"
                  value={permissionFormData.description}
                  onChange={(e) =>
                    setPermissionFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter permission description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPermissionForm(false);
                    setPermissionFormData({ name: "", description: "" });
                    setPermissionErrors({});
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" color="Black" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    "Create Permission"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" color="Black" />
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No permissions found
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => (
                  <tr
                    key={perm._id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {perm.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {perm.description || (
                          <span className="text-gray-400">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete the permission "${perm.name}"?`
                            )
                          ) {
                            handleDeletePermission(perm._id);
                          }
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsTab;
