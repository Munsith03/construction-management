import { useState, useEffect } from 'react';
import axios from 'axios';
import MaterialForm from '../components/MaterialForm.jsx';
import MaterialDetailsModal from '../components/MaterialDetails.jsx';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Explicitly import autoTable

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MaterialDashboard = () => {
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]); // New state for all materials for reports/graphs
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false); // New state to toggle graphs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch materials (paginated)
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/materials`, {
        params: { search, category, stockStatus, page },
      });
      setMaterials(response.data.materials);
      setTotalPages(response.data.pages);
    } catch (error) {
      setError('Failed to load materials. Please try again.');
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all materials for reports and graphs (assuming API supports limit=0 or no page for all)
  // Note: In a real scenario, update the backend to support fetching all or aggregates.
  // For demo, we'll fetch page by page and concatenate.
  const fetchAllMaterials = async () => {
    setLoading(true);
    let allData = [];
    let currentPage = 1;
    let total = 1;
    try {
      while (currentPage <= total) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/materials`, {
          params: { search, category, stockStatus, page: currentPage },
        });
        allData = [...allData, ...response.data.materials];
        total = response.data.pages;
        currentPage++;
      }
      setAllMaterials(allData);
    } catch (error) {
      setError('Failed to load all materials for reports.');
      console.error('Error fetching all materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [search, category, stockStatus, page]);

  useEffect(() => {
    fetchAllMaterials();
  }, [search, category, stockStatus]); // Refetch all when filters change

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setLoading(true);
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/materials/${id}`);
        fetchMaterials();
        fetchAllMaterials();
        if (selectedMaterial?._id === id) setSelectedMaterial(null);
      } catch (error) {
        setError('Failed to delete material. Please try again.');
        console.error('Error deleting material:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit
  const handleEdit = (material) => {
    setSelectedMaterial(material);
    setIsEditing(true);
    setShowForm(true);
  };

  // Handle view details
  const handleView = (material) => {
    setSelectedMaterial(material);
    setIsEditing(false);
    setShowForm(false);
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    fetchMaterials();
    fetchAllMaterials();
    setShowForm(false);
    setSelectedMaterial(null);
    setIsEditing(false);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedMaterial(null);
    setIsEditing(false);
  };

  // Handle add material button click
  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setIsEditing(false);
    setShowForm(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Unit', 'Stock Status'],
      ...allMaterials.map((m) => [
        m.name,
        m.category,
        m.quantity,
        m.unitOfMeasurement,
        m.stockStatus.replace('_', ' '),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'materials_report.csv';
    link.click();
  };

  const generatePDF = (allMaterials, setError) => {
  if (!Array.isArray(allMaterials) || allMaterials.length === 0) {
    setError("No materials available to generate PDF.");
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Cover Page
  doc.setFillColor(13, 59, 102); // Navy blue
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(100, 149, 237); // Light blue for gradient effect
  doc.triangle(0, 0, 210, 0, 210, 297, "F"); // Gradient triangle
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text("Materials Inventory Report", 105, 90, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 110, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text("Prepared by: [ContsrucEASE]", 105, 125, { align: "center" });
  doc.text("[SLIIT] | [ConstrucEASE@gmail.com]", 105, 135, { align: "center" });

  // Add new page for content
  doc.addPage();

  // Header
  doc.setFillColor(13, 59, 102); // Navy blue
  doc.rect(0, 0, 210, 20, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("[ConstrucEASE]", 10, 12);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("Materials Inventory Report", 10, 18);
  doc.setTextColor(180, 180, 180);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 12, { align: "right" });
  doc.text("[Logo Placeholder]", 190, 18, { align: "right" });
  doc.setDrawColor(100, 149, 237); // Light blue accent line
  doc.setLineWidth(0.3);
  doc.line(10, 22, 200, 22); // Header divider

  // Table of Contents
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  doc.text("Table of Contents", 10, 35);
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.text("1. Materials List....................2", 10, 42);

  // Materials Table
  autoTable(doc, {
    startY: 50,
    head: [
      [
        "Name",
        "Description",
        "Category",
        "Quantity",
        "Unit",
        "Unit Price",
        "Supplier Name",
        "Supplier Contact",
        "Supplier Email",
        "Min Stock",
        "Location",
        "Purchase Date",
        "Stock Status",
      ],
    ],
    body: allMaterials.map((m) => [
      m.name || "N/A",
      m.description || "N/A",
      m.category ? (m.category.charAt(0).toUpperCase() + m.category.slice(1)) : "N/A",
      m.quantity != null ? m.quantity : "N/A",
      m.unitOfMeasurement || "N/A",
      m.unitPrice ? `$${m.unitPrice.toFixed(2)}` : "N/A",
      m.supplier?.name || "N/A",
      m.supplier?.contact || "N/A",
      m.supplier?.email || "N/A",
      m.minimumStockThreshold != null ? m.minimumStockThreshold : "N/A",
      m.location || "N/A",
      m.purchaseDate ? new Date(m.purchaseDate).toLocaleDateString() : "N/A",
      m.stockStatus ? m.stockStatus.replace('_', ' ') : "N/A",
    ]),
    margin: { left: 10, right: 10 },
    styles: {
      font: "times",
      fontSize: 8,
      cellPadding: 2,
      textColor: [33, 33, 33],
      lineColor: [180, 180, 180],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [13, 59, 102], // Navy blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248], // Very light gray
    },
    columnStyles: {
      0: { cellWidth: 25, halign: "left" }, // Name
      1: { cellWidth: 30, halign: "left" }, // Description: wider for text
      2: { cellWidth: 20, halign: "left" }, // Category
      3: { cellWidth: 15, halign: "right" }, // Quantity
      4: { cellWidth: 15, halign: "left" }, // Unit
      5: { cellWidth: 15, halign: "right" }, // Unit Price
      6: { cellWidth: 20, halign: "left" }, // Supplier Name
      7: { cellWidth: 20, halign: "left" }, // Supplier Contact
      8: { cellWidth: 25, halign: "left" }, // Supplier Email
      9: { cellWidth: 15, halign: "right" }, // Min Stock
      10: { cellWidth: 20, halign: "left" }, // Location
      11: { cellWidth: 15, halign: "center" }, // Purchase Date
      12: { cellWidth: 20, halign: "left" }, // Stock Status
    },
    didDrawPage: (data) => {
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.line(10, pageHeight - 15, 200, pageHeight - 15); // Divider line
      doc.setFont("times", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("[Your Company Name] - Building the Future", 10, pageHeight - 8);
      doc.setFont("times", "normal");
      doc.text("[Your Company Email] | [Your Company Phone]", 105, pageHeight - 8, { align: "center" });
      doc.text(`Page ${data.pageNumber - 1}`, 200, pageHeight - 8, { align: "right" });
    },
  });

  doc.save("materials-report.pdf");
};

  // Prepare data for charts
  const getChartData = () => {
    // Quantity by Category (Bar Chart)
    const categories = [...new Set(allMaterials.map((m) => m.category))];
    const quantitiesByCategory = categories.map(
      (cat) => allMaterials.filter((m) => m.category === cat).reduce((sum, m) => sum + m.quantity, 0)
    );

    const barData = {
      labels: categories,
      datasets: [
        {
          label: 'Total Quantity',
          data: quantitiesByCategory,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    // Stock Status Distribution (Pie Chart)
    const stockCounts = {
      in_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
    };
    allMaterials.forEach((m) => {
      stockCounts[m.stockStatus]++;
    });

    const pieData = {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [
        {
          data: [stockCounts.in_stock, stockCounts.low_stock, stockCounts.out_of_stock],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        },
      ],
    };

    return { barData, pieData };
  };

  const { barData, pieData } = getChartData();

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="bg-black text-white py-6 px-12 top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Material Management Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={handleAddMaterial}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 hover:shadow-md"
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
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add Material
            </button>
            <button
              onClick={exportToCSV}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 hover:shadow-md"
            >
              Export CSV
            </button>
           <button
  onClick={() => generatePDF(allMaterials, setError)}
  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
>
  Generate Report
</button>
            <button
              onClick={() => setShowGraphs(!showGraphs)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 hover:shadow-md"
            >
              {showGraphs ? 'Hide Graphs' : 'Show Graphs'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm animate-slide-in">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-4 flex items-center gap-2 hover:bg-gray-300 transition-all duration-300"
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
              <path d="M3 6h18"></path>
              <path d="M7 12h10"></path>
              <path d="M10 18h4"></path>
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block bg-white p-6 rounded-lg shadow-md transition-all duration-300`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-200 p-3 pl-10 w-full rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-200 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50"
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
                className="border border-gray-200 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50"
              >
                <option value="">All Stock Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Graphs Section */}
        {showGraphs && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Visualizations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Quantity by Category</h3>
                <Bar data={barData} options={{ responsive: true }} />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Stock Status Distribution</h3>
                <Pie data={pieData} options={{ responsive: true }} />
              </div>
            </div>
          </div>
        )}

        {/* Material List (Table) */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
              <svg
                className="w-6 h-6 animate-spin"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              Loading...
            </div>
          ) : materials.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No materials found.</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-50 text-gray-700">
                  <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold">Name</th>
                  <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold">Category</th>
                  <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold">Quantity</th>
                  <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold">Status</th>
                  <th className="border-b border-gray-200 p-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <tr
                    key={material._id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-all duration-200`}
                  >
                    <td className="border-b border-gray-200 p-4 text-gray-700">{material.name}</td>
                    <td className="border-b border-gray-200 p-4 text-gray-700">{material.category}</td>
                    <td className="border-b border-gray-200 p-4 text-gray-700">
                      {material.quantity} {material.unitOfMeasurement}
                    </td>
                    <td
                      className={`border-b border-gray-200 p-4 ${
                        material.stockStatus === 'in_stock'
                          ? 'text-green-600'
                          : material.stockStatus === 'low_stock'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      } font-medium`}
                    >
                      {material.stockStatus.replace('_', ' ')}
                    </td>
                    <td className="border-b border-gray-200 p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleView(material)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                          title="View Details"
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
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-teal-600 hover:text-teal-800 transition-colors duration-200"
                          title="Edit"
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
                        </button>
                        <button
                          onClick={() => handleDelete(material._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title="Delete"
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
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 hover:shadow-md"
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
                <path d="m15 18-6-6 6-6"></path>
              </svg>
              Previous
            </button>
            <span className="text-gray-600 font-medium">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages || loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 hover:shadow-md"
            >
              Next
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
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Material Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl transform transition-all duration-300 scale-100 shadow-xl">
              <MaterialForm
                material={selectedMaterial}
                isEditing={isEditing}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}

        {/* Material Details Modal */}
        {selectedMaterial && !showForm && (
          <MaterialDetailsModal
            material={selectedMaterial}
            onEdit={() => handleEdit(selectedMaterial)}
            onClose={() => setSelectedMaterial(null)}
          />
        )}
      </div>

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MaterialDashboard;