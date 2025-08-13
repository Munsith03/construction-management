import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import RoleTable from "./RoleTable";
import RoleForm from "./RoleForm";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

const RolesTab = () => {
  const { token } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No authentication token provided");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Fetch roles
        const rolesRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/roles`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRoles(rolesRes.data);

        // Fetch permissions
        const permissionsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/permissions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPermissions(permissionsRes.data);

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

  const handleCreateRole = async (formData) => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating role with data:", formData); // Debug log
      console.log("Token for create:", token); // Debug log
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/roles`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoles = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/roles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(updatedRoles.data);
      setShowRoleForm(false);
      setEditingRole(null);
      setError("");
    } catch (err) {
      console.error("Create error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to create role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleUpdateRole = async (formData) => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Updating role with ID:", editingRole._id, "Data:", formData); // Debug log
      console.log("Token for update:", token); // Debug log
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/roles/${editingRole._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoles = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/roles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(updatedRoles.data);
      setShowRoleForm(false);
      setEditingRole(null);
      setError("");
    } catch (err) {
      console.error("Update error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!token) {
      setError("No authentication token provided");
      return;
    }

    console.log("Deleting role with ID:", roleId); // Debug log
    console.log("Token for delete:", token); // Debug log

    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/roles/${roleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(roles.filter((role) => role._id !== roleId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response); // Debug log
      setError(err.response?.data?.error || "Failed to delete role");
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
        <h3 className="text-xl font-semibold text-gray-900">Roles</h3>
        <Button
          onClick={() => {
            setShowRoleForm(!showRoleForm);
            setEditingRole(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {showRoleForm && !editingRole ? "Cancel" : "Create Role"}
        </Button>
      </div>
      {showRoleForm && (
        <RoleForm
          onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
          onCancel={() => {
            setShowRoleForm(false);
            setEditingRole(null);
          }}
          initialData={editingRole || {}}
          permissions={permissions}
          isEditing={!!editingRole}
          isLoading={isLoading}
        />
      )}
      <RoleTable
        roles={roles}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RolesTab;
