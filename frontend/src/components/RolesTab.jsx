import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import RoleTable from "./RoleTable";
import RoleForm from "./RoleForm";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/permissions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response);
        setError(err.response?.data?.error || "Failed to load roles and permissions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleCreateRole = async (formData) => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/roles`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoles = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/roles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(updatedRoles.data);
      setShowRoleForm(false);
      setEditingRole(null);
      setError("");
    } catch (err) {
      console.error("Create error:", err.response);
      setError(err.response?.data?.error || "Failed to create role. Please try again.");
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
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/roles/${editingRole._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRoles = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/roles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(updatedRoles.data);
      setShowRoleForm(false);
      setEditingRole(null);
      setError("");
    } catch (err) {
      console.error("Update error:", err.response);
      setError(err.response?.data?.error || "Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/roles/${roleId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoles(roles.filter((role) => role._id !== roleId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response);
      setError(err.response?.data?.error || "Failed to delete role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto ">
      {/* Error Message */}
      {error && (
        <div
          className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg flex justify-between items-center animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-800 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
            aria-label="Dismiss error message"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-6 top-0 bg-white z-10 py-4">
        <h3 className="text-2xl font-bold text-gray-900">Manage Roles</h3>
        <Button
          onClick={() => {
            setShowRoleForm(!showRoleForm);
            setEditingRole(null);
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          disabled={isLoading}
          aria-label={showRoleForm && !editingRole ? "Cancel role creation" : "Create a new role"}
        >
          {showRoleForm && !editingRole ? (
            <>
              <XMarkIcon className="w-5 h-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Role
            </>
          )}
        </Button>
      </div>

      {/* Role Form */}
      {showRoleForm && (
        <div className="mb-10 bg-white shadow-md rounded-lg p-6 animate-fade-in border border-gray-200">
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
        </div>
      )}

      {/* Loading State */}
      {isLoading && !roles.length && !showRoleForm && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="lg" color="indigo" />
            <span className="text-base text-gray-600 animate-pulse">Loading roles...</span>
          </div>
        </div>
      )}

      {/* Role Table */}
      <RoleTable
        roles={roles}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        isLoading={isLoading}
      />
    </section>
  );
};

export default RolesTab;