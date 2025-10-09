import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/materials`, {
        params: { search, category, stockStatus, page },
      });
      setMaterials(response.data.materials);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, category, stockStatus, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/materials/${id}`);
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Materials List</h2>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option value="cement">Cement</option>
          <option value="steel">Steel</option>
          <option value="wood">Wood</option>
          <option value="bricks">Bricks</option>
          <option value="sand">Sand</option>
          <option value="gravel">Gravel</option>
          <option value="paint">Paint</option>
          <option value="other">Other</option>
        </select>
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Stock Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material) => (
            <tr key={material._id} className="hover:bg-gray-100">
              <td className="border p-2">{material.name}</td>
              <td className="border p-2">{material.category}</td>
              <td className="border p-2">{material.quantity} {material.unitOfMeasurement}</td>
              <td className="border p-2">{material.stockStatus.replace('_', ' ')}</td>
              <td className="border p-2">
                <Link to={`/materials/${material._id}`} className="text-blue-500 mr-2">View</Link>
                <Link to={`/materials/edit/${material._id}`} className="text-green-500 mr-2">Edit</Link>
                <button onClick={() => handleDelete(material._id)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page === totalPages}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
      <Link to="/materials/new" className="mt-4 inline-block bg-green-500 text-white p-2 rounded">
        Add New Material
      </Link>
    </div>
  );
};

export default MaterialList;