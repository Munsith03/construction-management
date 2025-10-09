import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/menuService";

/* ----------------------------- Menu Item Card ----------------------------- */
const MenuItemCard = ({ item, onEdit, onDelete }) => (
  <div className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    {item.image ? (
      <img
        src={`${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${item.image}`}
        alt={item.name}
        className="mb-4 h-48 w-full rounded-xl object-cover transition group-hover:scale-[1.01]"
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/640x360?text=No+Image";
        }}
      />
    ) : (
      <div className="mb-4 flex h-48 w-full items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
        No Image
      </div>
    )}

    <h3 className="text-base font-semibold text-neutral-900">{item.name}</h3>
    <p className="text-sm font-semibold text-neutral-900">
      ${item.price.toFixed(2)}
    </p>
    <p className="capitalize text-sm text-neutral-600">{item.category}</p>
    <p className="line-clamp-2 text-sm text-neutral-600">{item.description}</p>

    <p className="mb-4 mt-1 text-xs font-medium text-neutral-500">
      Status:{" "}
      <span
        className={
          item.isAvailable
            ? "rounded-full bg-green-50 px-2 py-0.5 text-green-700 ring-1 ring-green-200"
            : "rounded-full bg-red-50 px-2 py-0.5 text-red-700 ring-1 ring-red-200"
        }
      >
        {item.isAvailable ? "Available" : "Unavailable"}
      </span>
    </p>

    <div className="mt-4 flex justify-end gap-2">
      <button
        onClick={() => onEdit(item)}
        className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        aria-label={`Edit ${item.name}`}
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(item._id)}
        className="inline-flex items-center justify-center rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40"
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

/* ---------------------------------- Form --------------------------------- */
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
    <div className="mx-auto mb-10 max-w-full">
      <h2 className="mb-2 text-lg font-semibold text-neutral-900">
        {editingId ? "Edit Menu Item" : "Add New Menu Item"}
      </h2>
      <p className="mb-4 text-sm text-neutral-600">
        Upload an image, set pricing and availability.
      </p>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Name and Price Section */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition focus:ring-2 focus:ring-neutral-900/20 ${
                  errors.name
                    ? "border-red-400 focus:border-red-500"
                    : "border-neutral-300 focus:border-neutral-900"
                }`}
                placeholder="Enter item name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition focus:ring-2 focus:ring-neutral-900/20 ${
                  errors.price
                    ? "border-red-400 focus:border-red-500"
                    : "border-neutral-300 focus:border-neutral-900"
                }`}
                placeholder="Enter price"
                required
                min="0"
                step="0.01"
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "price-error" : undefined}
              />
              {errors.price && (
                <p id="price-error" className="mt-1 text-xs text-red-600">
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Category and Image Section */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
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
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Image
              </label>
              <input
                id="image"
                type="file"
                onChange={onImageChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="block w-full cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                ref={fileInputRef}
                aria-describedby={errors.image ? "image-error" : undefined}
              />
              {errors.image && (
                <p id="image-error" className="mt-1 text-xs text-red-600">
                  {errors.image}
                </p>
              )}
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-40 rounded-xl border border-neutral-200 object-cover shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-xs font-semibold text-neutral-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-[15px] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
              placeholder="Enter item description"
              rows="5"
            />
          </div>

          {/* Availability Section */}
          <div className="lg:col-span-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={onInputChange}
                className="h-4 w-4 accent-neutral-900"
              />
              <span className="text-sm font-medium text-neutral-800">
                Available
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
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

/* -------------------------- Delete Confirmation -------------------------- */
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-neutral-900">
          Confirm Deletion
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Are you sure you want to delete "
          <span className="font-medium">{itemName}</span>"? This action cannot
          be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/30"
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

/* ------------------------------- Main Page -------------------------------- */
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900">
        Menu Management
      </h1>

      {errors.fetch || errors.submit || errors.delete ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.fetch || errors.submit || errors.delete}
        </div>
      ) : null}

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/50 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
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
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Menu Items
        </h2>

        <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20 sm:max-w-xs"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <p className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-neutral-600 shadow-sm">
            No menu items found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
