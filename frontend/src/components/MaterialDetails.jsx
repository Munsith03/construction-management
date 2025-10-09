const MaterialDetailsModal = ({ material, onEdit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Material Details</h2>
        <div className="space-y-4 text-gray-700">
          <p><strong className="font-semibold">Name:</strong> {material.name}</p>
          <p><strong className="font-semibold">Description:</strong> {material.description || 'N/A'}</p>
          <p><strong className="font-semibold">Category:</strong> {material.category}</p>
          <p><strong className="font-semibold">Quantity:</strong> {material.quantity} {material.unitOfMeasurement}</p>
          <p><strong className="font-semibold">Unit Price:</strong> ${material.unitPrice}</p>
          <p><strong className="font-semibold">Total Cost:</strong> ${material.totalCost}</p>
          <p><strong className="font-semibold">Supplier Name:</strong> {material.supplier.name}</p>
          <p><strong className="font-semibold">Supplier Contact:</strong> {material.supplier.contact || 'N/A'}</p>
          <p><strong className="font-semibold">Supplier Email:</strong> {material.supplier.email || 'N/A'}</p>
          <p><strong className="font-semibold">Stock Status:</strong> {material.stockStatus.replace('_', ' ')}</p>
          <p><strong className="font-semibold">Minimum Stock Threshold:</strong> {material.minimumStockThreshold}</p>
          <p><strong className="font-semibold">Location:</strong> {material.location}</p>
          <p><strong className="font-semibold">Purchase Date:</strong> {new Date(material.purchaseDate).toLocaleDateString()}</p>
          <p><strong className="font-semibold">Last Updated:</strong> {new Date(material.lastUpdated).toLocaleDateString()}</p>
        </div>
        <div className="mt-6 flex gap-4">
          <button
            onClick={onEdit}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-md"
          >
            <svg
              className="w-5 h-5"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            </svg>
            Edit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md"
          >
            <svg
              className="w-5 h-5"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default MaterialDetailsModal;