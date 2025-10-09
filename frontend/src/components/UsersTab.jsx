import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import UserTable from "./UserTable";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/outline";


const UsersTab = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roleError, setRoleError] = useState("");
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response);
        setError(err.response?.data?.error || "Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Real-time validation for role selection
  useEffect(() => {
    if (selectedRoleId) {
      setRoleError("");
    }
  }, [selectedRoleId]);

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response);
      setError(err.response?.data?.error || "Failed to delete user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle assign role
  const handleAssignRole = async () => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    if (!selectedRoleId) {
      setRoleError("Please select a role to assign");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/users/${selectedUserId}/roles`,
        { userId: selectedUserId, roleId: selectedRoleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUsers = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(updatedUsers.data);
      setShowAssignRoleModal(false);
      setSelectedRoleId("");
      setSelectedUserId(null);
      setRoleError("");
      setError("");
    } catch (err) {
      console.error("Assign role error:", err.response);
      setError(err.response?.data?.error || "Failed to assign role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Focus trap for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showAssignRoleModal) {
        if (selectedRoleId || window.confirm("Discard unsaved changes?")) {
          setShowAssignRoleModal(false);
          setSelectedRoleId("");
          setSelectedUserId(null);
          setRoleError("");
        }
      }
      if (e.key === "Tab" && showAssignRoleModal) {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (showAssignRoleModal && modalRef.current) {
      firstFocusableRef.current?.focus();
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAssignRoleModal, selectedRoleId]);

  return (
    <section className="w-full max-w-7xl mx-auto">
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
      <div className="flex justify-between items-center mb-8  top-0 bg-white z-10 px-6 py-4">
        <h3 className="text-2xl font-bold text-gray-900">Manage Users</h3>
        <Button
          onClick={() => {
            setSelectedUserId(null);
            setShowAssignRoleModal(true);
          }}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          disabled={isLoading}
          aria-label="Add a new user"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        onDelete={handleDeleteUser}
        onAssignRole={(userId) => {
          setSelectedUserId(userId);
          setShowAssignRoleModal(true);
        }}
        isLoading={isLoading}
      />

      {/* Assign Role Modal */}
      {showAssignRoleModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center transition-opacity duration-300 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (selectedRoleId || window.confirm("Discard unsaved changes?")) {
                setShowAssignRoleModal(false);
                setSelectedRoleId("");
                setSelectedUserId(null);
                setRoleError("");
              }
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-role-title"
          ref={modalRef}
        >
          <div className="w-full max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 relative">
              <button
                onClick={() => {
                  if (selectedRoleId || window.confirm("Discard unsaved changes?")) {
                    setShowAssignRoleModal(false);
                    setSelectedRoleId("");
                    setSelectedUserId(null);
                    setRoleError("");
                  }
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
                aria-label="Close form"
                ref={firstFocusableRef}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3
                id="assign-role-title"
                className="text-2xl font-bold text-gray-900 mb-6"
              >
                {selectedUserId ? "Assign Role to User" : "Add New User"}
              </h3>
              <div className="space-y-6">
                {!selectedUserId && (
                  <div>
                    <label
                      htmlFor="userEmail"
                      className="block text-base font-semibold text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="userEmail"
                      name="email"
                      placeholder="Enter user email"
                      className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="roleSelect"
                    className="block text-base font-semibold text-gray-700"
                  >
                    Select Role
                  </label>
                  <select
                    id="roleSelect"
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className={`mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base ${
                      roleError ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={roleError ? "role-error" : undefined}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {roleError && (
                    <p id="role-error" className="mt-2 text-sm text-red-800 bg-red-50 p-2 rounded">
                      {roleError}
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedRoleId || window.confirm("Discard unsaved changes?")) {
                        setShowAssignRoleModal(false);
                        setSelectedRoleId("");
                        setSelectedUserId(null);
                        setRoleError("");
                      }
                    }}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    disabled={isLoading}
                    aria-label="Cancel form"
                  >
                    <XMarkIcon className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRole}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    disabled={isLoading}
                    aria-label={selectedUserId ? "Assign role" : "Add user"}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="md" color="white" />
                        <span>{selectedUserId ? "Assigning..." : "Adding..."}</span>
                      </div>
                    ) : (
                      <>
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        {selectedUserId ? "Assign Role" : "Add User"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsersTab;