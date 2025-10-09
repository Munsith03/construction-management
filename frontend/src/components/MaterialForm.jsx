import { useState, useEffect } from 'react';
import axios from 'axios';

const MaterialForm = ({ material, isEditing, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unitOfMeasurement: '',
    unitPrice: '',
    supplier: { name: '', contact: '', email: '' },
    minimumStockThreshold: 10,
    location: '',
    purchaseDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && material) {
      setFormData({
        name: material.name,
        description: material.description || '',
        category: material.category,
        quantity: material.quantity,
        unitOfMeasurement: material.unitOfMeasurement,
        unitPrice: material.unitPrice,
        supplier: {
          name: material.supplier.name,
          contact: material.supplier.contact || '',
          email: material.supplier.email || '',
        },
        minimumStockThreshold: material.minimumStockThreshold,
        location: material.location,
        purchaseDate: material.purchaseDate ? material.purchaseDate.split('T')[0] : '',
      });
    }
  }, [material, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Material name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.unitOfMeasurement) newErrors.unitOfMeasurement = 'Unit of measurement is required';
    if (!formData.unitPrice || formData.unitPrice < 0) newErrors.unitPrice = 'Valid unit price is required';
    if (!formData.supplier.name) newErrors.supplierName = 'Supplier name is required';
    if (!formData.supplier.contact) {
      newErrors.supplierContact = 'Supplier contact number is required';
    } else if (!/^[0-9]{10}$/.test(formData.supplier.contact)) {
      newErrors.supplierContact = 'Please enter a valid 10-digit contact number (e.g., 1234567890)';
    }
    if (formData.supplier.email && !/^\S+@\S+\.\S+$/.test(formData.supplier.email)) {
      newErrors.supplierEmail = 'Valid email address is required';
    }
    if (!formData.location) newErrors.location = 'Location is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('supplier.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        supplier: { ...prev.supplier, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      if (isEditing && material) {
        await axios.put(`${import.meta.env.VITE_API_URL}/materials/${material._id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/materials`, formData);
      }
      onSuccess();
    } catch (error) {
      setErrors({ form: error.response?.data?.message || 'Failed to save material. Please try again.' });
      console.error('Error saving material:', error);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans animate-fadeIn">
      <div className="overflow-y-auto max-h-[65vh] px-6 py-8 space-y-10 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        <header>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isEditing ? 'Edit Material' : 'Add New Material'}
          </h2>
          <p className="mt-2 text-md text-gray-600 dark:text-gray-400 max-w-xl">
            {isEditing
              ? 'Update the material details in your inventory.'
              : 'Fill in the details below to add a new material to the inventory.'}
          </p>
        </header>

        {errors.form && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded  animate-slideIn">
            <span className="material-symbols-outlined text-xl">error</span>
            <span id="form-error" className="font-medium">
              {errors.form}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 -md transition- duration-300 hover:-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="material-name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="material-name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  placeholder="e.g., Concrete Blocks"
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  } -sm hover:-md`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="name-error">
                    <span className="material-symbols-outlined">error</span> {errors.name}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g., Standard 8x8x16 inch concrete masonry units."
                  rows={4}
                  className="mt-2 block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition -sm hover:-md px-5 py-3 resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition -sm hover:-md ${
                    errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="cement">Cement</option>
                  <option value="steel">Steel</option>
                  <option value="wood">Wood</option>
                  <option value="bricks">Bricks</option>
                  <option value="sand">Sand</option>
                  <option value="gravel">Gravel</option>
                  <option value="paint">Paint</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="category-error">
                    <span className="material-symbols-outlined">error</span> {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  placeholder="e.g., 500"
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition -sm hover:-md ${
                    errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="quantity-error">
                    <span className="material-symbols-outlined">error</span> {errors.quantity}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="unit-measurement"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unitOfMeasurement"
                  id="unit-measurement"
                  value={formData.unitOfMeasurement}
                  onChange={handleChange}
                  aria-describedby={errors.unitOfMeasurement ? 'unit-error' : undefined}
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition -sm hover:-md ${
                    errors.unitOfMeasurement ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="pieces">Pieces</option>
                  <option value="pallets">Pallets</option>
                  <option value="linear_ft">Linear Ft</option>
                  <option value="sq_ft">Sq. Ft</option>
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                  <option value="cubic_meter">cubic meter</option>
                  <option value="liter">liter</option>
                  <option value="unit">unit</option>
                  <option value="square_meter">square meter</option>
                </select>
                {errors.unitOfMeasurement && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="unit-error">
                    <span className="material-symbols-outlined">error</span> {errors.unitOfMeasurement}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="unit-price"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="unitPrice"
                    id="unit-price"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    aria-describedby={errors.unitPrice ? 'unit-price-error' : undefined}
                    placeholder="e.g., 2.50"
                    className={`block w-full rounded-lg border pl-10 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition ${
                      errors.unitPrice ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.unitPrice && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="unit-price-error">
                    <span className="material-symbols-outlined">error</span> {errors.unitPrice}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="min-stock"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minimumStockThreshold"
                  id="min-stock"
                  min="0"
                  value={formData.minimumStockThreshold}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition px-5 py-3"
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 -md transition- duration-300 hover:-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight mb-6">
              Supplier Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="supplier-name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="supplier.name"
                  id="supplier-name"
                  value={formData.supplier.name}
                  onChange={handleChange}
                  aria-describedby={errors.supplierName ? 'supplier-name-error' : undefined}
                  placeholder="e.g., Quality Construction Supplies"
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition ${
                    errors.supplierName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.supplierName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="supplier-name-error">
                    <span className="material-symbols-outlined">error</span> {errors.supplierName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="supplier-contact"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="supplier.contact"
                  id="supplier-contact"
                  value={formData.supplier.contact}
                  onChange={handleChange}
                  placeholder="e.g., 1234567890"
                  pattern="[0-9]{10}"
                  required
                  aria-describedby={errors.supplierContact ? 'supplier-contact-error' : undefined}
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition ${
                    errors.supplierContact ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.supplierContact && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="supplier-contact-error">
                    <span className="material-symbols-outlined">error</span> {errors.supplierContact}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="supplier-email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="supplier.email"
                  id="supplier-email"
                  value={formData.supplier.email}
                  onChange={handleChange}
                  aria-describedby={errors.supplierEmail ? 'supplier-email-error' : undefined}
                  placeholder="e.g., sales@qualitysupplies.com"
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition ${
                    errors.supplierEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.supplierEmail && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="supplier-email-error">
                    <span className="material-symbols-outlined">error</span> {errors.supplierEmail}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="purchase-date"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  id="purchase-date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -sm hover:-md transition px-5 py-3"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Location in Warehouse <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                  className={`mt-2 block w-full rounded-lg border px-5 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition -sm hover:-md ${
                    errors.location ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Location</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="site_a">Site A</option>
                  <option value="site_b">Site B</option>
                  <option value="site_c">Site C</option>
                  <option value="other">Other</option>
                </select>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1" id="location-error">
                    <span className="material-symbols-outlined">error</span> {errors.location}
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>

      <footer className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 px-6 flex justify-end gap-4 ">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 font-semibold  hover:bg-gray-200 dark:hover:bg-gray-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold  hover:bg-indigo-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isEditing ? 'Update Material' : 'Add Material'}
        </button>
      </footer>
    </div>
  );
};

export default MaterialForm;