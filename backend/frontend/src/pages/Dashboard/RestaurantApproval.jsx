import { useState, useEffect } from "react";
import {
  getUnavailableRestaurants,
  updateRestaurantAvailability,
} from "../../services/restaurentServices";
import { updateUserRole } from "../../services/userServices";
import { AlertCircle, RefreshCw } from "lucide-react";

const RestaurantApproval = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // Fetch unavailable restaurants
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await getUnavailableRestaurants();
      setRestaurants(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  // Update restaurant availability and user role
  const updateAvailability = async (restaurantId) => {
    setApprovingId(restaurantId);
    try {
      // Find restaurant to get owner ID
      const restaurant = restaurants.find((r) => r._id === restaurantId);
      if (!restaurant) {
        throw new Error("Restaurant not found");
      }

      // Update restaurant availability
      await updateRestaurantAvailability(restaurantId);

      // Update owner role to restaurant_admin
      if (restaurant.owner) {
        try {
          await updateUserRole(restaurant.owner, "restaurant_admin");
        } catch (err) {
          console.error(
            `[ROLE_UPDATE_ERROR] Failed to update user role: ${err.message}`
          );
          // Log error but don't fail approval
        }
      }

      // Remove restaurant from list
      setRestaurants(restaurants.filter((r) => r._id !== restaurantId));
      setShowConfirmModal(false);
      setSelectedRestaurantId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve restaurant");
    } finally {
      setApprovingId(null);
    }
  };

  // Open confirmation modal
  const openConfirmModal = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setShowConfirmModal(true);
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedRestaurantId(null);
  };

  // Dismiss error with animation
  const dismissError = () => {
    document.getElementById("error-toast")?.classList.add("animate-toast-out");
    setTimeout(() => setError(null), 300);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Restaurant Approval
          </h1>
          <button
            onClick={fetchRestaurants}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Refresh restaurant list"
          >
            {loading ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Toast */}
        {error && (
          <div
            id="error-toast"
            className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-600 p-4 rounded-lg shadow-md flex items-center gap-3 max-w-sm z-50 animate-toast-in"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={dismissError}
              className="ml-2 text-red-600 hover:text-red-800 font-semibold focus:outline-none"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !restaurants.length ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw size={32} className="animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.length === 0 ? (
              <div className="bg-white p-4 rounded-lg shadow-sm text-center col-span-full">
                <p className="text-gray-600 text-sm">
                  No restaurants pending approval.
                </p>
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all duration-200"
                  role="article"
                  aria-labelledby={`restaurant-${restaurant._id}`}
                >
                  <div className="bg-blue-50 rounded-t-lg p-2">
                    <h2
                      id={`restaurant-${restaurant._id}`}
                      className="text-lg font-semibold text-gray-900"
                    >
                      {restaurant.storeName || "N/A"}
                    </h2>
                  </div>
                  <div className="p-4 space-y-1 text-gray-600 text-sm leading-6">
                    <p>
                      <span className="font-medium">Brand:</span>{" "}
                      {restaurant.brandName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Business Type:</span>{" "}
                      {restaurant.businessType || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {restaurant.streetAddress || "N/A"}
                      {restaurant.floorSuite &&
                        `, ${restaurant.floorSuite}`},{" "}
                      {restaurant.city || "N/A"}, {restaurant.state || "N/A"}{" "}
                      {restaurant.zipcode || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {restaurant.countryCode && restaurant.phoneNumber
                        ? `${restaurant.countryCode} ${restaurant.phoneNumber}`
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Owner ID:</span>{" "}
                      {restaurant.owner ? restaurant.owner.toString() : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Created At:</span>{" "}
                      {restaurant.createdAt
                        ? new Date(restaurant.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={
                          restaurant.isAvailable
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {restaurant.isAvailable
                          ? "Approved"
                          : "Pending Approval"}
                      </span>
                    </p>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => openConfirmModal(restaurant._id)}
                      disabled={approvingId === restaurant._id}
                      className={`w-full flex justify-center items-center py-2 px-4 rounded-full text-white text-sm font-medium transition-all duration-200 ${
                        approvingId === restaurant._id
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                      aria-label={`Approve ${
                        restaurant.storeName || "restaurant"
                      }`}
                    >
                      {approvingId === restaurant._id ? (
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-modal-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-white rounded-lg shadow-lg p-5 max-w-md w-full mx-4">
            <h3
              id="confirm-modal-title"
              className="text-xl font-semibold text-gray-900 tracking-tight mb-2"
            >
              Confirm Approval
            </h3>
            <p className="text-gray-600 text-sm leading-6 mb-4">
              Are you sure you want to approve this restaurant? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                aria-label="Cancel approval"
              >
                Cancel
              </button>
              <button
                onClick={() => updateAvailability(selectedRestaurantId)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                aria-label="Confirm approval"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes toast-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes toast-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
        .animate-toast-out {
          animation: toast-out 0.3s ease-in;
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
        /* Modern font stack */
        .font-sans {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default RestaurantApproval;
