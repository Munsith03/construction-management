import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitOrder } from "../../services/orderService";

function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!state?.cart || !state?.address || !state?.paymentMethod) {
      navigate("/cart");
    }
  }, [state, navigate]);

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    setError("");
    try {
      const orderData = {
        restaurantId: state.cart[0]?.restaurant,
        items: state.cart.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: item.price,
        })),
        address: state.address,
        paymentMethod: state.paymentMethod,
      };
      const response = await submitOrder(orderData);
      setOrder(response.data);
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (!state?.cart) return null;

  const total = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto mt-24">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Order Confirmation
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      {order ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Order Placed Successfully!
          </h3>
          <p className="text-gray-600">Order ID: {order._id}</p>
          <p className="text-gray-600">Total: ${order.total.toFixed(2)}</p>
          <p className="text-gray-600">Payment Method: Cash on Delivery</p>
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-3 bg-black text-white rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate(`/track-order/${order._id}`)}
              className="mt-4 px-6 py-3 bg-black text-white rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Track Order
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          {state.cart.map((item) => (
            <div
              key={item.menuItem}
              className="flex items-center border-b border-gray-200 py-4 last:border-b-0"
            >
              <img
                src={
                  item.image
                    ? `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${
                        item.image
                      }`
                    : "https://via.placeholder.com/100x100?text=No+Image"
                }
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
                loading="lazy"
              />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  ${item.price.toFixed(2)} x {item.quantity}
                </p>
              </div>
              <p className="text-gray-800 font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-bold text-gray-800">
              Total: ${total.toFixed(2)}
            </p>
            <h4 className="text-lg font-semibold text-gray-800 mt-4">
              Delivery Address
            </h4>
            <p className="text-gray-600">
              {state.address.street}, {state.address.city},{" "}
              {state.address.state} {state.address.zipcode},{" "}
              {state.address.countryCode}
            </p>
            <h4 className="text-lg font-semibold text-gray-800 mt-4">
              Payment Method
            </h4>
            <p className="text-gray-600">Cash on Delivery</p>
            <button
              onClick={handleConfirmOrder}
              disabled={isLoading}
              className="mt-6 w-full px-6 py-3 bg-black text-white rounded-md hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
