import PropTypes from "prop-types";
import { useState } from "react";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

const RoleTable = ({ roles, onEdit, onDelete, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState(""); // State for search

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter roles based on search query
  const filteredRoles = (roles || []).filter((role) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.permissions?.some((perm) => perm.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort filtered roles
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

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

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
            aria-label="Search roles"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg overflow-hidden">
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
                  Role  {getSortIcon("name")}
                </th>
                <th
                  scope="col"
                  className="px-8 py-4 text-left text-sm font-semibold text-gray-700"
                >
                  Permissions
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
                      <span className="text-base text-gray-600 animate-pulse">Loading roles...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-6 text-center text-gray-500 text-base"
                  >
                    <div>
                      <p>No roles found.</p>
                      <button
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                        onClick={() => onEdit({})} // Assuming onEdit with empty object triggers "Add Role"
                      >
                        Create a new role
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedRoles.map((role) => (
                  <tr
                    key={role._id}
                    className="hover:bg-indigo-50 transition-colors duration-200"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">
                        {role.name}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-base text-gray-600">
                        {role.permissions?.length > 0 ? (
                          <span className="flex flex-wrap gap-2">
                            {role.permissions.map((perm) => (
                              <span
                                key={perm.name}
                                className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                              >
                                {perm.name}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="text-gray-400">No permissions assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium space-x-3">
                      <Button
                        onClick={() => onEdit(role)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        aria-label={`Edit role ${role.name}`}
                      >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete the role "${role.name}"?`
                            )
                          ) {
                            onDelete(role._id);
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        aria-label={`Delete role ${role.name}`}
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
              <span className="text-base text-gray-600 animate-pulse">Loading roles...</span>
            </div>
          </div>
        ) : sortedRoles.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-base">
            <p>No roles found.</p>
            <button
              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => onEdit({})}
            >
              Create a new role
            </button>
          </div>
        ) : (
          sortedRoles.map((role) => (
            <div
              key={role._id}
              className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                <div className="mt-2 text-base text-gray-600">
                  {role.permissions?.length > 0 ? (
                    <span className="flex flex-wrap gap-2">
                      {role.permissions.map((perm) => (
                        <span
                          key={perm.name}
                          className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                        >
                          {perm.name}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="text-gray-400">No permissions assigned</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => onEdit(role)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={`Edit role ${role.name}`}
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete the role "${role.name}"?`
                      )
                    ) {
                      onDelete(role._id);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={`Delete role ${role.name}`}
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

RoleTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      permissions: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
        })
      ),
    })
  ),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

RoleTable.defaultProps = {
  roles: [],
  isLoading: false,
};

export default RoleTable;