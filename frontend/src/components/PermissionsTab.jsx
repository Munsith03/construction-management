import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Button from "./Button";
import Input from "./Input";
import LoadingSpinner from "./LoadingSpinner";
import { PlusIcon, XMarkIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token) {
        setError("Authentication required. Please log in again.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/permissions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPermissions(res.data);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err.response);
        setError(err.response?.data?.error || "Failed to load permissions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPermissions();
  }, [token]);

  // Real-time validation for permission name
  useEffect(() => {
    const validateName = () => {
      const newErrors = {};
      if (permissionFormData.name && !permissionFormData.name.trim()) {
        newErrors.name = "Permission name is required";
      } else if (permissionFormData.name.length > 50) {
        newErrors.name = "Permission name cannot exceed 50 characters";
      }
      setPermissionErrors(newErrors);
    };
    validateName();
  }, [permissionFormData.name]);

  // Handle form submission
  const handleCreatePermission = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!permissionFormData.name.trim()) {
      newErrors.name = "Permission name is required";
    } else if (permissionFormData.name.length > 50) {
      newErrors.name = "Permission name cannot exceed 50 characters";
    }
    setPermissionErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/permissions`,
        permissionFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPermissions([...permissions, res.data]);
      setPermissionFormData({ name: "", description: "" });
      setPermissionErrors({});
      setShowPermissionForm(false);
      setError("");
    } catch (err) {
      console.error("Create error:", err.response);
      setError(err.response?.data?.error || "Failed to create permission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDeletePermission = async (permissionId) => {
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/permissions/${permissionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPermissions(permissions.filter((perm) => perm._id !== permissionId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response);
      setError(
        err.response?.status === 404
          ? "Permission not found"
          : err.response?.data?.error || "Failed to delete permission. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Filter and sort permissions
  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedPermissions = [...filteredPermissions].sort((a, b) => {
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortConfig.key === "description") {
      return sortConfig.direction === "asc"
        ? (a.description || "").localeCompare(b.description || "")
        : (b.description || "").localeCompare(a.description || "");
    }
    return 0;
  });

  // Focus trap for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showPermissionForm) {
        if (
          permissionFormData.name ||
          permissionFormData.description ||
          window.confirm("Discard unsaved changes?")
        ) {
          setShowPermissionForm(false);
          setPermissionFormData({ name: "", description: "" });
          setPermissionErrors({});
        }
      }
      if (e.key === "Tab" && showPermissionForm) {
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

    if (showPermissionForm && modalRef.current) {
      firstFocusableRef.current?.focus();
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPermissionForm]); // Removed permissionFormData from dependencies

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
        <h3 className="text-2xl font-bold text-gray-900">Manage Permissions</h3>
        <Button
          onClick={() => setShowPermissionForm(!showPermissionForm)}
          className="inline-flex items-center px-6 py-3 border border-transparent  font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          disabled={isLoading}
          aria-label={showPermissionForm ? "Cancel permission creation" : "Create a new permission"}
        >
          {showPermissionForm ? (
            <>
              <XMarkIcon className="w-5 h-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Permission
            </>
          )}
        </Button>
      </div>

      {/* Permission Form */}
      {showPermissionForm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center transition-opacity duration-300 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (
                permissionFormData.name ||
                permissionFormData.description ||
                window.confirm("Discard unsaved changes?")
              ) {
                setShowPermissionForm(false);
                setPermissionFormData({ name: "", description: "" });
                setPermissionErrors({});
              }
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="permission-form-title"
          ref={modalRef}
        >
          <div className="w-full max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 relative">
              <button
                onClick={() => {
                  if (
                    permissionFormData.name ||
                    permissionFormData.description ||
                    window.confirm("Discard unsaved changes?")
                  ) {
                    setShowPermissionForm(false);
                    setPermissionFormData({ name: "", description: "" });
                    setPermissionErrors({});
                  }
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
                aria-label="Close form"
                ref={firstFocusableRef}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h3
                id="permission-form-title"
                className="text-2xl font-bold text-gray-900 mb-6"
              >
                Create New Permission
              </h3>
              <form onSubmit={handleCreatePermission} className="space-y-6">
                <div>
                  <label
                    htmlFor="permissionName"
                    className="block text-base font-semibold text-gray-700"
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
                    className={`mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base ${
                      permissionErrors.name ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                    aria-describedby={permissionErrors.name ? "name-error" : undefined}
                  />
                  {permissionErrors.name && (
                    <p id="name-error" className="mt-2 text-sm text-red-800 bg-red-50 p-2 rounded">
                      {permissionErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="permissionDescription"
                    className="block text-base font-semibold text-gray-700"
                  >
                    Description (Optional)
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
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => {
                      if (
                        permissionFormData.name ||
                        permissionFormData.description ||
                        window.confirm("Discard unsaved changes?")
                      ) {
                        setShowPermissionForm(false);
                        setPermissionFormData({ name: "", description: "" });
                        setPermissionErrors({});
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
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    disabled={isLoading}
                    aria-label="Create permission"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="md" color="white" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create Permission
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
            aria-label="Search permissions"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("name")}
                  aria-sort={sortConfig.key === "name" ? sortConfig.direction : "none"}
                >
                  Permission Name {getSortIcon("name")}
                </th>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort("description")}
                  aria-sort={sortConfig.key === "description" ? sortConfig.direction : "none"}
                >
                  Description {getSortIcon("description")}
                </th>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-semibold text-gray-700"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <LoadingSpinner size="md" color="indigo" />
                      <span className="text-base text-gray-600 animate-pulse">Loading permissions...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedPermissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-6 text-center text-gray-500 text-base"
                  >
                    <div>
                      <p>No permissions found.</p>
                      <button
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                        onClick={() => setShowPermissionForm(true)}
                      >
                        Create a new permission
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedPermissions.map((perm) => (
                  <tr
                    key={perm._id}
                    className="hover:bg-indigo-50 transition-colors duration-200"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">
                        {perm.name}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-base text-gray-600">
                        {perm.description || (
                          <span className="text-gray-400">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
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
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        aria-label={`Delete permission ${perm.name}`}
                      >
                        <TrashIcon className="w-5 h-5 mr-2" />
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

      {/* Responsive Card Layout for Mobile */}
      <div className="md:hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <LoadingSpinner size="md" color="indigo" />
              <span className="text-base text-gray-600 animate-pulse">Loading permissions...</span>
            </div>
          </div>
        ) : sortedPermissions.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-base">
            <p>No permissions found.</p>
            <button
              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => setShowPermissionForm(true)}
            >
              Create a new permission
            </button>
          </div>
        ) : (
          sortedPermissions.map((perm) => (
            <div
              key={perm._id}
              className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-200"
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{perm.name}</h4>
                <p className="mt-2 text-base text-gray-600">
                  {perm.description || (
                    <span className="text-gray-400">No description</span>
                  )}
                </p>
              </div>
              <div className="flex justify-end">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={`Delete permission ${perm.name}`}
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default PermissionsTab;