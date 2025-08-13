import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import Input from "./Input";
import LoadingSpinner from "./LoadingSpinner";

const RoleForm = ({
  onSubmit,
  onCancel,
  initialData = {},
  permissions,
  isEditing = false,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    permissionIds: initialData.permissions?.map((p) => p._id) || [],
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    }
    if (formData.name.length > 50) {
      newErrors.name = "Role name cannot exceed 50 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        permissionIds: checked
          ? [...prev.permissionIds, value]
          : prev.permissionIds.filter((id) => id !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isEditing ? "Edit Role" : "Create New Role"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Role Name
              </label>
              <Input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter role name"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.name ? "border-red-500" : ""
                }`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Permissions
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No permissions available
                  </p>
                ) : (
                  permissions.map((perm) => (
                    <label
                      key={perm._id}
                      className="flex items-center space-x-3 rounded-md p-2 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        value={perm._id}
                        checked={formData.permissionIds.includes(perm._id)}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {perm.name}
                        </span>
                        {perm.description && (
                          <p className="text-sm text-gray-500">
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span>{isEditing ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : isEditing ? (
                  "Update Role"
                ) : (
                  "Create Role"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

RoleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    permissions: PropTypes.array,
  }),
  permissions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
};

RoleForm.defaultProps = {
  initialData: {},
  permissions: [],
  isEditing: false,
  isLoading: false,
  onCancel: () => {},
};

export default RoleForm;
