import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getDeliveries,
  getOrderDetails,
} from "../../services/deliveryServices.js";
import {
  getRestaurantById,
  getMenuItemsByRestaurant,
} from "../../services/restaurentServices.js";
import { getUserById } from "../../services/userServices.js";

function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState({});
  const [restaurants, setRestaurants] = useState({});
  const [customers, setCustomers] = useState({});
  const [menuItems, setMenuItems] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await getDeliveries();
        setDeliveries(data);

        // Extract unique order IDs
        const orderIds = [
          ...new Set(data.map((delivery) => delivery.order).filter((id) => id)),
        ];
        console.log("Order IDs:", orderIds);

        // Fetch order details
        const orderPromises = orderIds.map((id) =>
          getOrderDetails(id).catch((err) => {
            console.error(`Error fetching order ${id}:`, err);
            return null;
          })
        );
        const orderData = await Promise.all(orderPromises);
        const orderMap = orderIds.reduce((acc, id, index) => {
          if (orderData[index]) {
            acc[id] = orderData[index];
          }
          return acc;
        }, {});
        setOrders(orderMap);
        console.log("Order Map:", orderMap);

        // Extract restaurant and customer IDs from orders
        const restaurantIds = [
          ...new Set(
            Object.values(orderMap)
              .map((order) => order.restaurant)
              .filter((id) => id)
          ),
        ];
        const customerIds = [
          ...new Set(
            Object.values(orderMap)
              .map((order) =>
                typeof order.customer === "object" && order.customer?._id
                  ? order.customer._id
                  : typeof order.customer === "string"
                  ? order.customer
                  : null
              )
              .filter((id) => id)
          ),
        ];
        console.log("Restaurant IDs:", restaurantIds);
        console.log("Customer IDs:", customerIds);

        // Fetch restaurant data
        const restaurantPromises = restaurantIds.map((id) =>
          getRestaurantById(id).catch((err) => {
            console.error(`Error fetching restaurant ${id}:`, err);
            return null;
          })
        );
        const restaurantData = await Promise.all(restaurantPromises);
        const restaurantMap = restaurantIds.reduce((acc, id, index) => {
          if (restaurantData[index]) {
            acc[id] = restaurantData[index];
          }
          return acc;
        }, {});
        setRestaurants(restaurantMap);

        // Fetch customer data
        const customerPromises = customerIds.map((id) =>
          getUserById(id).catch((err) => {
            console.error(`Error fetching customer ${id}:`, err);
            return null;
          })
        );
        const customerData = await Promise.all(customerPromises);
        console.log("Raw Customer Data:", customerData);
        const customerMap = customerIds.reduce((acc, id, index) => {
          const customer = customerData[index];
          if (customer) {
            // Handle nested data structure if present
            acc[id] = customer.data ? customer.data : customer;
          }
          return acc;
        }, {});
        setCustomers(customerMap);
        console.log("Customer Map:", customerMap);

        // Fetch menu items for each restaurant
        const menuPromises = restaurantIds.map((id) =>
          getMenuItemsByRestaurant(id).catch((err) => {
            console.error(`Error fetching menu for restaurant ${id}:`, err);
            return { data: [] };
          })
        );
        const menuData = await Promise.all(menuPromises);
        const menuItemMap = restaurantIds.reduce((acc, id, index) => {
          acc[id] = Array.isArray(menuData[index]?.data)
            ? menuData[index].data
            : [];
          return acc;
        }, {});
        setMenuItems(menuItemMap);

        console.log("Deliveries:", data);
        console.log("Restaurants:", restaurantMap);
        console.log("Menu Items:", menuItemMap);
        console.log("Customers:", customerMap);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
        <p className="mt-2 text-gray-600">
          Manage your current and past delivery assignments
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
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
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {deliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No deliveries assigned
          </h3>
          <p className="mt-1 text-gray-500">
            You currently don't have any delivery assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map((delivery) => {
            const order = orders[delivery.order];
            const restaurant = order ? restaurants[order.restaurant] : null;
            const customer = order
              ? customers[
                  typeof order.customer === "object" && order.customer?._id
                    ? order.customer._id
                    : order.customer
                ]
              : null;
            const menuItemMap = order
              ? (menuItems[order.restaurant] || []).reduce((acc, item) => {
                  acc[item._id] = item;
                  return acc;
                }, {})
              : {};

            console.log("Order for delivery", delivery._id, order); // Debug order data
            console.log("Customer for delivery", delivery._id, customer); // Debug customer data

            return (
              <div
                key={delivery._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : delivery.status === "in_transit"
                            ? "bg-blue-100 text-blue-800"
                            : delivery.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {delivery.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #{delivery._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <svg
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="text-xs">
                        Order: {delivery.order.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {customer && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-xs">
                          Customer: {customer.name || "Unknown"}
                        </span>
                      </div>
                    )}

                    {restaurant && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-2m-2 0h-2m-2 0h-2m-2 0h-2M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h-4"
                          />
                        </svg>
                        <span className="text-xs">
                          Restaurant: {restaurant.data.brandName || "Unknown"}
                        </span>
                      </div>
                    )}

                    {restaurant && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs truncate">
                          Pickup: {restaurant.data.streetAddress || "Unknown"},{" "}
                          {restaurant.data.city || ""}{" "}
                          {restaurant.data.zipcode || ""}
                        </span>
                      </div>
                    )}

                    {order && (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg
                          className="h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-xs truncate">
                          Delivery: {order.address?.street},
                          {order.address?.city}
                        </span>
                      </div>
                    )}

                    {order && order.items && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 font-medium">
                          Order Items:
                        </p>
                        <ul className="mt-1 space-y-1">
                          {order.items.map((item) => (
                            <li
                              key={item._id}
                              className="text-xs text-gray-600"
                            >
                              {menuItemMap[item.menuItem?._id || item.menuItem]
                                ?.name || "Unknown Item"}{" "}
                              x {item.quantity} - ${item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/${delivery._id}`}
                    className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    View Details
                    <svg
                      className="ml-2 -mr-1 w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyDeliveries;
