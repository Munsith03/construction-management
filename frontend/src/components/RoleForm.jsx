import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import Input from "./Input";
import LoadingSpinner from "./LoadingSpinner";
import { XMarkIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/outline";

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
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Role name cannot exceed 50 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Handle backdrop click to cancel (with confirmation if form is dirty)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (
        formData.name ||
        formData.permissionIds.length > 0 ||
        isEditing
      ) {
        if (window.confirm("Discard unsaved changes?")) {
          onCancel();
        }
      } else {
        onCancel();
      }
    }
  };

  // Focus trap for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleBackdropClick({ target: modalRef.current });
      }
      if (e.key === "Tab") {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
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

    if (modalRef.current) {
      firstFocusableRef.current?.focus();
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center transition-opacity duration-300 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-form-title"
      ref={modalRef}
    >
      <div className="w-full max-w-md sm:max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200 relative">
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
            aria-label="Close form"
            ref={firstFocusableRef}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Form Header */}
          <h2
            id="role-form-title"
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            {isEditing ? "Edit Role" : "Create New Role"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-gray-700"
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
                className={`mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base ${
                  errors.name ? "border-red-500" : ""
                }`}
                disabled={isLoading}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-800 bg-red-50 p-2 rounded">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                {formData.permissionIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, permissionIds: [] }))}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                    aria-label="Clear all permissions"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                {permissions.length === 0 ? (
                  <p className="text-base text-gray-500 text-center">
                    No permissions available
                  </p>
                ) : (
                  permissions.map((perm) => (
                    <label
                      key={perm._id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        value={perm._id}
                        checked={formData.permissionIds.includes(perm._id)}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                        disabled={isLoading}
                        aria-label={`Select permission ${perm.name}`}
                      />
                      <div className="flex-1">
                        <span className="text-base font-medium text-gray-900">
                          {perm.name}
                        </span>
                        {perm.description && (
                          <p className="text-sm text-gray-600">
                            {perm.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
<Button
  type="button"
  onClick={onCancel}
  className="inline-flex items-center px-6 py-3 border border-gray-300 text-black font-medium rounded-lg bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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
                aria-label={isEditing ? "Update role" : "Create role"}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="md" color="white" />
                    <span>{isEditing ? "Updating..." : "Creating..."}</span>
                  </div>
                ) : isEditing ? (
                  <>
                    <PencilIcon className="w-5 h-5 mr-2" />
                    Update Role
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Role
                  </>
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