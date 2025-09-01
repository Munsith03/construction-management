import { useState, useEffect } from "react";
import {
  getPendingOrders,
  getDelivered,
  getPicked,
  getPickup,
  getPrepare,
  pickedOrder,
  prepareOrder,
  acceptOrder,
} from "../../services/api/orderLists.js";
import {
  getRestaurantById,
  getMenuItemsByRestaurant,
} from "../../services/restaurentServices.js";
import { getUserById } from "../../services/userServices.js";

const RestaurantAdminPage = ({ restaurantId }) => {
  console.log("Restaurant ID:", restaurantId);
  const [orderGroups, setOrderGroups] = useState({
    pending: [],
    preparing: [],
    ready: [],
    picked: [],
    delivered: [],
  });
  const [restaurant, setRestaurant] = useState(null);
  const [user, setUser] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      fetchAllOrders();
    }
  }, [restaurantId]);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const [
        pending,
        preparing,
        ready,
        picked,
        delivered,
        restaurantData,
        menuData,
      ] = await Promise.all([
        getPendingOrders(restaurantId),
        getPrepare(restaurantId),
        getPickup(restaurantId),
        getPicked(restaurantId),
        getDelivered(restaurantId),
        getRestaurantById(restaurantId),
        getMenuItemsByRestaurant(restaurantId),
      ]);

      const allOrders = [
        ...pending,
        ...preparing,
        ...ready,
        ...picked,
        ...delivered,
      ];
      const uniqueCustomerIds = [
        ...new Set(allOrders.map((order) => order.customer).filter((id) => id)),
      ];

      // Fetch user data for all unique customer IDs
      const userPromises = uniqueCustomerIds.map((customerId) =>
        getUserById(customerId).catch((err) => {
          console.error(`Error fetching user ${customerId}:`, err);
          return null;
        })
      );
      const userData = await Promise.all(userPromises);
      const userMap = uniqueCustomerIds.reduce((acc, id, index) => {
        if (userData[index]) {
          acc[id] = userData[index];
        }
        return acc;
      }, {});

      console.log("Restaurant Data:", restaurantData);
      console.log("User Data:", userMap);
      console.log("Menu Data:", menuData);

      setOrderGroups({
        pending,
        preparing,
        ready,
        picked,
        delivered,
      });
      setRestaurant(restaurantData);
      setUser(userMap);
      setMenuItems(Array.isArray(menuData?.data) ? menuData.data : []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
      setIsLoading(false);
    }
  };

  const acceptOrderHandler = async (orderId) => {
    try {
      await acceptOrder(orderId);
      await fetchAllOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const prepareOrderHandler = async (orderId) => {
    try {
      await prepareOrder(orderId);
      await fetchAllOrders();
    } catch (error) {
      console.error("Error preparing order:", error);
    }
  };

  const pickedOrderHandler = async (orderId) => {
    try {
      await pickedOrder(orderId);
      await fetchAllOrders();
    } catch (error) {
      console.error("Error picking up order:", error);
    }
  };

  console.log("Order Groups:", orderGroups);

  const renderOrder = (order) => {
    const customer = user[order.customer];
    console.log("Menu Items in renderOrder:", menuItems);
    console.log("Order Items:", order.items);

    // Create a lookup map for menu items by _id
    const menuItemMap = Array.isArray(menuItems)
      ? menuItems.reduce((acc, item) => {
          acc[item._id] = item;
          return acc;
        }, {})
      : {};

    return (
      <li
        key={order._id}
        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Order #{order._id.slice(-6).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.status === "preparing"
                  ? "bg-blue-100 text-blue-800"
                  : order.status === "ready-to-pickup"
                  ? "bg-purple-100 text-purple-800"
                  : order.status === "picked"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {order.status.replace(/-/g, " ").toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-100 p-3 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Customer
              </h4>
              <p className="font-medium text-gray-800">
                {customer?.name || "Unknown"}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Restaurant
              </h4>
              <p className="font-medium text-gray-800">
                {restaurant?.data.brandName || "Unknown"}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order Items
            </h4>
            <ul className="space-y-2">
              {order.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {menuItemMap[item.menuItem?._id || item.menuItem]?.name ||
                        item.menuItem?.name ||
                        "Unknown Item"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${item.price.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <p className="font-bold text-lg">
              Total:{" "}
              <span className="text-indigo-600">${order.total.toFixed(2)}</span>
            </p>
            <div className="space-x-2">
              {order.status === "pending" && (
                <button
                  onClick={() => acceptOrderHandler(order._id)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Accept Order
                </button>
              )}
              {order.status === "preparing" && (
                <button
                  onClick={() => prepareOrderHandler(order._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Mark as Ready
                </button>
              )}
              {order.status === "ready-to-pickup" && (
                <button
                  onClick={() => pickedOrderHandler(order._id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Confirm Pickup
                </button>
              )}
            </div>
          </div>
        </div>
      </li>
    );
  };

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Restaurant Selected
          </h2>
          <p className="text-gray-600">
            Please ensure you are logged in as a restaurant owner.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Fetching restaurant orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h2>
          <p className="text-gray-600">
            Manage all restaurant orders for {restaurant?.data.brandName || 'Unknown'}
          </p>
        </div>

        <div className="space-y-10">
          {[
            {
              title: "Pending Orders",
              status: "pending",
              orders: orderGroups.pending,
            },
            {
              title: "Preparing Orders",
              status: "preparing",
              orders: orderGroups.preparing,
            },
            {
              title: "Ready for Pickup",
              status: "ready",
              orders: orderGroups.ready,
            },
            {
              title: "Picked Orders",
              status: "picked",
              orders: orderGroups.picked,
            },
            {
              title: "Delivered Orders",
              status: "delivered",
              orders: orderGroups.delivered,
            },
          ].map((group) => (
            <div key={group.status} className="">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {group.title}
                </h3>
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {group.orders.length} orders
                </span>
              </div>

              {group.orders.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.orders.map(renderOrder)}
                </ul>
              ) : (
                <div className="bg-white rounded-xl border p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No {group.title.toLowerCase()}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    All caught up! New orders will appear here.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantAdminPage;