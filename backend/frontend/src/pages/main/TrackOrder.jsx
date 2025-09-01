import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { trackOrder, getUserById } from "../../services/userServices.js";
import {
  getMenuItemsByRestaurant,
  getRestaurantById,
} from "../../services/restaurentServices.js";
import { getDeliveryByOrderId } from "../../services/deliveryServices.js";

const TrackOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [driver, setDriver] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [restaurant, setRestaurant] = useState("N/A");

  console.log("Order ID:", orderId);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await trackOrder(orderId);
        setOrder(response);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch order details");
        setIsLoading(false);
      }
    };

    const fetchDelivery = async () => {
      try {
        const response = await getDeliveryByOrderId(orderId);
        setDelivery(response);
      } catch (err) {
        console.error("Failed to fetch delivery details:", err.message);
      }
    };

    const fetchDriver = async () => {
      if (delivery?.driver) {
        try {
          const driverData = await getUserById(delivery.driver);
          setDriver(driverData);
        } catch (err) {
          console.error("Failed to fetch driver details:", err.message);
        }
      }
    };

    const fetchRestaurant = async () => {
      if (order?.restaurant) {
        try {
          const restaurantData = await getRestaurantById(order.restaurant);
          setRestaurant(restaurantData);
        } catch (err) {
          console.error("Failed to fetch restaurant details:", err.message);
        }
      }
    };

    const fetchMenuItems = async () => {
      if (order?.restaurant) {
        try {
          const menuData = await getMenuItemsByRestaurant(order.restaurant);
          setMenuItems(menuData);
        } catch (err) {
          console.error("Failed to fetch menu items:", err.message);
        }
      }
    };

    fetchOrder().then(() => {
      fetchDelivery().then(() => fetchDriver());
      fetchMenuItems();
      fetchRestaurant();
    });
  }, [orderId, order?.restaurant, delivery?.driver]);

  console.log("Order:", order);
  console.log("Delivery:", delivery);
  console.log("Driver:", driver);
  console.log("Menu Items:", menuItems);
  console.log("Restaurant:", restaurant);

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  // Create a map of menu items for quick lookup by _id
  const menuItemMap = Array.isArray(menuItems?.data)
    ? menuItems.data.reduce((acc, item) => {
        acc[item._id] = item;
        return acc;
      }, {})
    : {};

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Order Header with Prominent Status */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Order #{order._id}
            </h2>
            <span className="text-gray-500 mt-1 block">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg font-bold text-gray-800">
              ${order.total?.toFixed(2) || "N/A"}
            </p>
          </div>
        </div>

        {/* Prominent Order Status Banner */}
        <div
          className={`mt-6 p-4 rounded-lg ${
            order.status === "completed"
              ? "bg-green-50 border border-green-200"
              : order.status === "cancelled"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 h-5 w-5 rounded-full ${
                order.status === "completed"
                  ? "bg-green-500"
                  : order.status === "cancelled"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            ></div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-gray-800">Order Status</h3>
              <p
                className={`text-sm font-semibold ${
                  order.status === "completed"
                    ? "text-green-700"
                    : order.status === "cancelled"
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                {order.status ? order.status.toUpperCase() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Information */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-700"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z"
              clipRule="evenodd"
            />
            <path d="M5 9a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V9z" />
          </svg>
          Restaurant Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-700">Name</p>
            <p className="text-gray-800">
              {restaurant?.data?.brandName || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Phone</p>
            <p className="text-gray-800">
              {restaurant?.data?.phoneNumber || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-gray-700">Address</p>
            <p className="text-gray-800">
              {restaurant?.data?.streetAddress || "N/A"},{" "}
              {restaurant?.data?.city || "N/A"},{" "}
              {restaurant?.data?.state || "N/A"}{" "}
              {restaurant?.data?.zipcode || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
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
          Order Items
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {order.items?.map((item) => (
            <div
              key={item._id}
              className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {menuItemMap[item.menuItem?._id || item.menuItem]?.name ||
                      item.menuItem?.name ||
                      "Unknown Item"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <span className="font-semibold text-gray-800">
                  ${item.price?.toFixed(2) || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Details with Prominent Status */}
      {delivery ? (
        <div className="mb-8">
          {/* Prominent Delivery Status Banner */}
          <div
            className={`p-4 rounded-lg mb-4 ${
              delivery.status === "delivered"
                ? "bg-green-50 border border-green-200"
                : delivery.status === "cancelled"
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 h-5 w-5 rounded-full ${
                  delivery.status === "delivered"
                    ? "bg-green-500"
                    : delivery.status === "cancelled"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              ></div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-800">
                  Delivery Status
                </h3>
                <p
                  className={`text-sm font-semibold ${
                    delivery.status === "delivered"
                      ? "text-green-700"
                      : delivery.status === "cancelled"
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}
                >
                  {delivery.status ? delivery.status.toUpperCase() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3zM3 5h2v4H3V5zm4 0h2v4H7V5zm4 0h2v4h-2V5zm4 0h2v4h-2V5z" />
              </svg>
              Delivery Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-gray-700">Delivery ID</p>
                <p className="text-gray-800">{delivery._id || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Delivery Address</p>
                <p className="text-gray-800">
                  {order?.address?.street || "N/A"},{" "}
                  {order?.address?.city || "N/A"},{" "}
                  {order?.address?.state || "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Driver ID</p>
                <p className="text-gray-800">{delivery.driver || "N/A"}</p>
              </div>
            </div>

            {driver ? (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-gray-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Driver Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-700">Name</p>
                    <p className="text-gray-800">{driver.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Email</p>
                    <p className="text-gray-800">{driver.email || "N/A"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No driver details available</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">No delivery details available</p>
        </div>
      )}

      {/* Back Button */}
      <Link
        to="/profile"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Profile
      </Link>
    </div>
  );
};

export default TrackOrder;
