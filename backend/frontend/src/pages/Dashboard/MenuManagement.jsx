import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/menuService";

// Sub-component for Menu Item Card
const MenuItemCard = ({ item, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-lg ">
    {item.image ? (
      <img
        src={`${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${item.image}`}
        alt={item.name}
        className="w-full h-48 object-cover rounded-md mb-4"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150?text=No+Image";
        }}
      />
    ) : (
      <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
        <span className="text-gray-500">No Image</span>
      </div>
    )}
    <h3 className="text-lg font-semibold">{item.name}</h3>
    <p className="text-gray-600">${item.price.toFixed(2)}</p>
    <p className="text-gray-500 capitalize">{item.category}</p>
    <p className="text-gray-500 truncate">{item.description}</p>
    <p className="text-sm font-medium text-gray-500 mb-4">
      Status:{" "}
      <span className={item.isAvailable ? "text-green-600" : "text-red-600"}>
        {item.isAvailable ? "Available" : "Unavailable"}
      </span>
    </p>
    <div className="mt-4 flex justify-end space-x-2">
      <button
        onClick={() => onEdit(item)}
        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        aria-label={`Edit ${item.name}`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(item._id)}
        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label={`Delete ${item.name}`}
      >
        Delete
      </button>
    </div>
  </div>
);

MenuItemCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    isAvailable: PropTypes.bool.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  baseUrl: PropTypes.string.isRequired,
};

// Sub-component for Menu Form
const MenuForm = ({
  formData,
  onInputChange,
  onImageChange,
  onSubmit,
  imageFile,
  editingId,
  onCancel,
  fileInputRef,
  errors,
}) => {
  const imagePreview = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : null;
  }, [imageFile]);

  return (
    <div className="mb-10 max-w-full mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        {editingId ? "Edit Menu Item" : "Add New Menu Item"}
      </h2>
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded  border border-gray-100"
        noValidate
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Name and Price Section */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter item name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.price ? "border-red-500" : "border-gray-300"
                } bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Enter price"
                required
                min="0"
                step="0.01"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
              {errors.price && (
                <p
                  id="price-error"
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Category and Image Section */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="appetizer">Appetizer</option>
                <option value="main">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="side">Side</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image
              </label>
              <input
                id="image"
                type="file"
                onChange={onImageChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
                ref={fileInputRef}
                aria-describedby={errors.image ? "image-error" : undefined}
              />
              {errors.image && (
                <p
                  id="image-error"
                  className="mt-1 text-sm text-red-500 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.image}
                </p>
              )}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter item description"
              rows="5"
            />
          </div>

          {/* Availability Section */}
          <div className="lg:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={onInputChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Available
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            {editingId ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

MenuForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    isAvailable: PropTypes.bool,
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onImageChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  imageFile: PropTypes.object,
  editingId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

// Sub-component for Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{itemName}"? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired,
};

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "appetizer",
    isAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const fileInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_RESTAURENT_BASE_URL;

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (imageFile && !/image\/(jpeg|jpg|png|gif)/.test(imageFile.type))
      newErrors.image = "Only JPEG, JPG, PNG, or GIF images are allowed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, imageFile]);

  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMenuItems();
      setMenuItems(response.data);
    } catch (err) {
      setErrors({ fetch: err.message || "Failed to fetch menu items" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && !/image\/(jpeg|jpg|png|gif)/.test(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPEG, JPG, PNG, or GIF images are allowed",
      }));
      setImageFile(null);
      e.target.value = null;
      return;
    }
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      setErrors({});
      setSuccess("");

      try {
        if (editingId) {
          const response = await updateMenuItem(editingId, formData, imageFile);
          setSuccess("Menu item updated successfully");
          setMenuItems((prev) =>
            prev.map((item) => (item._id === editingId ? response.data : item))
          );
        } else {
          const response = await createMenuItem(formData, imageFile);
          setSuccess("Menu item created successfully");
          setMenuItems((prev) => [...prev, response.data]);
        }
        resetForm();
      } catch (err) {
        setErrors({ submit: err.message || "Failed to save menu item" });
      } finally {
        setIsLoading(false);
      }
    },
    [editingId, formData, imageFile, validateForm]
  );

  const handleEdit = useCallback((item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setErrors({});
  }, []);

  const handleDelete = useCallback((id, name) => {
    setDeleteModal({ isOpen: true, itemId: id, itemName: name });
  }, []);

  const confirmDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      await deleteMenuItem(deleteModal.itemId);
      setSuccess("Menu item deleted successfully");
      setMenuItems((prev) =>
        prev.filter((item) => item._id !== deleteModal.itemId)
      );
      setDeleteModal({ isOpen: false, itemId: null, itemName: "" });
    } catch (err) {
      setErrors({ delete: err.message || "Failed to delete menu item" });
    } finally {
      setIsLoading(false);
    }
  }, [deleteModal.itemId]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "appetizer",
      isAvailable: true,
    });
    setImageFile(null);
    setEditingId(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let items = [...menuItems];
    if (searchQuery) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    items.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });
    return items;
  }, [menuItems, searchQuery, sortBy]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Menu Management</h1>

      {errors.fetch || errors.submit || errors.delete ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.fetch || errors.submit || errors.delete}
        </div>
      ) : null}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <MenuForm
        formData={formData}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        imageFile={imageFile}
        editingId={editingId}
        onCancel={resetForm}
        fileInputRef={fileInputRef}
        errors={errors}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Menu Items</h2>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
        {filteredAndSortedItems.length === 0 ? (
          <p className="text-gray-500">No menu items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onEdit={handleEdit}
                onDelete={() => handleDelete(item._id, item.name)}
                baseUrl={baseUrl}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, itemId: null, itemName: "" })
        }
        onConfirm={confirmDelete}
        itemName={deleteModal.itemName}
      />
    </div>
  );
};

export default MenuManagement;
