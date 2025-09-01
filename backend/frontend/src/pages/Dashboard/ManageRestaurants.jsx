import { useState, useEffect } from "react";
import { ChevronDown, Trash2, Eye } from "lucide-react";
import {
  getAllRestaurants,
  getUnavailableRestaurants,
  updateRestaurantAvailability,
  deleteRestaurant,
  getRestaurantById,
} from "../../services/restaurentServices";

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" or "unavailable"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch restaurants based on filter
  const fetchRestaurants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (filter === "unavailable") {
        data = await getUnavailableRestaurants();
      } else {
        data = await getAllRestaurants();
      }
      setRestaurants(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch restaurants");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch restaurant details for modal
  const fetchRestaurantDetails = async (id) => {
    try {
      const data = await getRestaurantById(id);
      setSelectedRestaurant(data.data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message || "Failed to fetch restaurant details");
    }
  };

  // Toggle restaurant availability
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await updateRestaurantAvailability(id, { isAvailable: !currentStatus });
      fetchRestaurants(); // Refresh list
    } catch (err) {
      setError(err.message || "Failed to update availability");
    }
  };

  // Delete restaurant
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await deleteRestaurant(id);
        fetchRestaurants(); // Refresh list
      } catch (err) {
        setError(err.message || "Failed to delete restaurant");
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRestaurants();
  }, [filter]);

  const inputClasses =
    "peer h-12 w-full rounded-lg text-gray-900 ring-2 ring-gray-300 px-4 focus:ring-gray-600 focus:outline-none transition-all";
  const labelClasses = "block text-gray-900 font-medium mb-2 text-base";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Manage Restaurants
      </h1>

      {error && (
        <div className="w-full mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* Filter Dropdown */}
      <div className="mb-6">
        <label className={labelClasses}>Filter Restaurants</label>
        <div className="relative w-64">
          <select
            className={`${inputClasses} appearance-none`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Restaurants</option>
            <option value="unavailable">Unavailable Restaurants</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-3 text-gray-500 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      {/* Restaurant List */}
      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center text-gray-600">No restaurants found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-gray-900 font-medium">Store Name</th>
                <th className="p-3 text-gray-900 font-medium">Brand</th>
                <th className="p-3 text-gray-900 font-medium">City</th>
                <th className="p-3 text-gray-900 font-medium">Availability</th>
                <th className="p-3 text-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{restaurant.storeName}</td>
                  <td className="p-3">{restaurant.brandName}</td>
                  <td className="p-3">{restaurant.city}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        handleToggleAvailability(
                          restaurant._id,
                          restaurant.isAvailable
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        restaurant.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {restaurant.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => fetchRestaurantDetails(restaurant._id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(restaurant._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Restaurant Details */}
      {isModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedRestaurant.storeName} Details
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Brand:</strong> {selectedRestaurant.brandName}
              </p>
              <p>
                <strong>Business Type:</strong>{" "}
                {selectedRestaurant.businessType}
              </p>
              <p>
                <strong>Address:</strong> {selectedRestaurant.streetAddress},{" "}
                {selectedRestaurant.city}, {selectedRestaurant.state}{" "}
                {selectedRestaurant.zipcode}
              </p>
              {selectedRestaurant.floorSuite && (
                <p>
                  <strong>Floor/Suite:</strong> {selectedRestaurant.floorSuite}
                </p>
              )}
              <p>
                <strong>Phone:</strong> {selectedRestaurant.phoneNumber}
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                {selectedRestaurant.isAvailable ? "Available" : "Unavailable"}
              </p>
              {selectedRestaurant.image && (
                <div>
                  <strong>Image:</strong>
                  <img
                    src={selectedRestaurant.image}
                    alt={selectedRestaurant.storeName}
                    className="mt-2 w-full h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
