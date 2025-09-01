import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getDeliveryById,
  getOrderDetails,
  updateDeliveryStatus,
} from "../../services/deliveryServices.js";
import {
  getRestaurantById,
  getMenuItemsByRestaurant,
} from "../../services/restaurentServices.js";
import { getUserById } from "../../services/userServices.js";
// import { getMenuItemsByRestaurant } from "../../../services/menuService.js";

function DeliveryDetails() {
  const { deliveryId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [isPicked, setIsPicked] = useState(false);

  useEffect(() => {
    const fetchDeliveryAndOrder = async () => {
      try {
        // Fetch delivery
        const deliveryData = await getDeliveryById(deliveryId);
        setDelivery(deliveryData);

        // Fetch order details
        const orderData = await getOrderDetails(deliveryData.order);
        console.log("Order Data:", orderData);
        setOrder(orderData);
        setIsPicked(orderData.status === "picked");

        // Fetch customer details
        const customerData = await getUserById(orderData.customer);
        setCustomer(customerData);

        // Fetch restaurant details (assume orderData includes restaurant ID)
        const restaurantData = await getRestaurantById(orderData.restaurant);
        console.log("Restaurant Data:", restaurantData);
        setRestaurant(restaurantData);

        // Fetch menu items for the restaurant
        const menuData = await getMenuItemsByRestaurant(orderData.restaurant);
        console.log("Menu Data:", menuData);
        setMenuItems(Array.isArray(menuData?.data) ? menuData.data : []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDeliveryAndOrder();
    const interval = setInterval(fetchDeliveryAndOrder, 10000);
    return () => clearInterval(interval);
  }, [deliveryId]);

  const handleStatusUpdate = async () => {
    try {
      const nextStatus =
        delivery.status === "assigned" ? "in_transit" : "delivered";
      const updatedDelivery = await updateDeliveryStatus(
        deliveryId,
        nextStatus
      );
      setDelivery(updatedDelivery);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );

  if (!delivery || !order || !customer || !restaurant || !menuItems)
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading delivery details...</p>
        </div>
      </div>
    );

  // Create menu item lookup map
  const menuItemMap = menuItems.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Delivery Details
          </h1>
          <p className="text-gray-500 mt-1">
            Track and manage delivery information
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            delivery.status === "assigned"
              ? "bg-blue-100 text-blue-800"
              : delivery.status === "in_transit"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {delivery.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Delivery Information
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">
                      Delivery ID:
                    </span>
                    <span className="ml-2 font-mono text-indigo-600">
                      {delivery._id}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">
                      {order.address?.street},{order.address.city},
                      {order.address.state}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-600">
                      {customer.name || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">
                      Customer ID:
                    </span>
                    <span className="ml-2 font-mono text-indigo-600">
                      {order.customer}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order Summary
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Order ID:</span>
                    <span className="ml-2 font-mono text-indigo-600">
                      {delivery.order}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">
                      Order Status:
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "preparing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "ready"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">
                      Total Amount:
                    </span>
                    <span className="ml-2 font-bold text-green-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Restaurant
                </h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-600">
                      {restaurant.data.brandName || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="ml-2 text-gray-600">
                      {restaurant.data.streetAddress || "Unknown"},{" "}
                      {restaurant.city || ""} {restaurant.zipcode || ""}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-600">
                      {restaurant.data.phoneNumber || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order Items
            </h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {menuItemMap[item.menuItem?._id || item.menuItem]
                          ?.name || "Unknown Item"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isPicked && delivery.status !== "delivered" && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleStatusUpdate}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                {delivery.status === "assigned" ? (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                    </svg>
                    Mark as In Transit
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Mark as Delivered
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeliveryDetails;
