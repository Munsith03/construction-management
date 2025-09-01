import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUserProfile,
  updateUserDetails,
  deleteUser,
  getOrders,
} from "../../services/userServices.js";
import { getMenuItemsByRestaurant } from "../../services/restaurentServices.js";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [menuItemsByRestaurant, setMenuItemsByRestaurant] = useState({});

  // Fetch user profile and orders on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response);
        setUpdateForm({
          name: response.name || "",
          email: response.email || "",
          phone: response.phone || "",
          address: response.address || "",
        });
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
        setIsLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response);
        setIsOrdersLoading(false);
      } catch (err) {
        setOrdersError(err.message || "Failed to fetch orders");
        setIsOrdersLoading(false);
      }
    };

    fetchUserProfile();
    fetchOrders();
  }, []);

  // Fetch menu items for each order's restaurant
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (orders.length === 0) return;

      const restaurantIds = [
        ...new Set(orders.map((order) => order.restaurant)),
      ];
      const menuItemsPromises = restaurantIds.map(async (restaurantId) => {
        try {
          const menuData = await getMenuItemsByRestaurant(restaurantId);
          return { restaurantId, menuData };
        } catch (err) {
          console.error(
            `Failed to fetch menu items for restaurant ${restaurantId}:`,
            err.message
          );
          return { restaurantId, menuData: null };
        }
      });

      const menuItemsResults = await Promise.all(menuItemsPromises);
      const newMenuItemsByRestaurant = menuItemsResults.reduce(
        (acc, { restaurantId, menuData }) => {
          if (menuData?.data) {
            acc[restaurantId] = menuData.data;
          }
          return acc;
        },
        {}
      );

      setMenuItemsByRestaurant(newMenuItemsByRestaurant);
    };

    if (!isOrdersLoading && orders.length > 0) {
      fetchMenuItems();
    }
  }, [orders, isOrdersLoading]);

  // Handle update form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserDetails(updateForm);
      setUser(response.data);
      setShowUpdateForm(false);
      setError(null);
      alert("Profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await deleteUser();
      localStorage.removeItem("authToken");
      alert("Account deleted successfully");
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setUpdateForm({
      ...updateForm,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* User Profile Display */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-200">
          User Profile
        </h2>
        <div className="space-y-5">
          <div className="flex items-center">
            <span className="w-32 font-medium text-gray-600">Name:</span>
            <span className="text-gray-800 font-semibold">
              {user?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-32 font-medium text-gray-600">Email:</span>
            <span className="text-gray-800 font-semibold">
              {user?.email || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-32 font-medium text-gray-600">Role:</span>
            <span className="text-gray-800 font-semibold">
              {user?.role || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Past Orders */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Past Orders
        </h3>
        {isOrdersLoading ? (
          <div className="text-center text-gray-600">Loading orders...</div>
        ) : ordersError ? (
          <div className="text-center text-red-500">{ordersError}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-600">No past orders found.</div>
        ) : (
          <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-4 text-left font-semibold">Order ID</th>
                  <th className="p-4 text-left font-semibold">Items</th>
                  <th className="p-4 text-left font-semibold">Total</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const menuItemMap = Array.isArray(
                    menuItemsByRestaurant[order.restaurant]
                  )
                    ? menuItemsByRestaurant[order.restaurant].reduce(
                        (acc, item) => {
                          acc[item._id] = item;
                          return acc;
                        },
                        {}
                      )
                    : {};

                  return (
                    <tr
                      key={order._id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <Link
                          to={`/track-order/${order._id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {order._id}
                        </Link>
                      </td>
                      <td className="p-4">
                        {order.items?.map((item, index) => (
                          <div key={index} className="text-gray-800">
                            {menuItemMap[item.menuItem?._id || item.menuItem]
                              ?.name ||
                              item.menuItem?.name ||
                              item.name ||
                              "Unknown Item"}{" "}
                            (x{item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        ${order.total?.toFixed(2) || "N/A"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status
                            ? order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex space-x-4 border-t pt-6 border-gray-200">
        <button
          onClick={() => setShowUpdateForm(true)}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Update Profile
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-300 shadow-sm hover:shadow-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Delete Account
        </button>
      </div>

      {/* Update Form Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Update Profile
              </h3>
              <button
                onClick={() => setShowUpdateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={updateForm.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={updateForm.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="flex-1 bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="mb-8 text-gray-600">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium border border-gray-300 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
