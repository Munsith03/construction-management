import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCartItem,
  clearCart,
} from "../../services/cartServices";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    countryCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [addressErrors, setAddressErrors] = useState({});
  const [isCartUpdating, setIsCartUpdating] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const data = await getCart();
        setCart(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setAddressErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAddress = useCallback(() => {
    const errors = {};
    if (!address.street.trim()) errors.street = "Street address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.zipcode.trim()) errors.zipcode = "Zipcode is required";
    if (!address.countryCode.trim())
      errors.countryCode = "Country code is required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }, [address]);

  const handleIncrement = async (item) => {
    setIsCartUpdating(true);
    const updatedCart = cart.map((cartItem) =>
      cartItem.menuItem === item.menuItem
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    setCart(updatedCart);
    try {
      await addToCart({
        menuItem: item.menuItem,
        quantity: 1,
        price: item.price,
        restaurant: item.restaurant,
      });
    } catch (err) {
      setCart(cart);
      setError(err.message || "Failed to update quantity");
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleDecrement = async (item) => {
    setIsCartUpdating(true);
    if (item.quantity === 1) {
      handleRemoveItem(item.menuItem);
      return;
    }
    const updatedCart = cart.map((cartItem) =>
      cartItem.menuItem === item.menuItem
        ? { ...cartItem, quantity: cartItem.quantity - 1 }
        : cartItem
    );
    setCart(updatedCart);
    try {
      await removeFromCart(item.menuItem);
    } catch (err) {
      setCart(cart);
      setError(err.message || "Failed to update quantity");
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleRemoveItem = async (menuItemId) => {
    setIsCartUpdating(true);
    const updatedCart = cart.filter((item) => item.menuItem !== menuItemId);
    setCart(updatedCart);
    try {
      await clearCartItem(menuItemId);
    } catch (err) {
      setCart(cart);
      setError(err.message || "Failed to remove item");
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleClearCart = async () => {
    setIsCartUpdating(true);
    setCart([]);
    try {
      await clearCart();
    } catch (err) {
      const data = await getCart();
      setCart(data.data || []);
      setError(err.message || "Failed to clear cart");
    } finally {
      setIsCartUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (!validateAddress()) return;
    setIsLoading(true);
    try {
      if (paymentMethod === "cod") {
        navigate("/checkout", {
          state: { cart, address, paymentMethod },
        });
      } else {
        navigate("/payment", {
          state: { cart, address, paymentMethod },
        });
      }
    } catch (err) {
      setError(err.message || "Cart validation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto bg-gray py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-8 ">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white p-8 rounded-xl  border border-gray-100 animate-pulse">
          <div className="space-y-6">
            <div className="h-7 bg-gray-100 rounded w-1/3"></div>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-100 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
              <div className="h-5 bg-gray-100 rounded w-16"></div>
            </div>
          </div>
        </div>
      ) : cart.length === 0 ? (
        <div className="bg-white p-8 rounded-xl  border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <button
            onClick={() => navigate("/restaurants")}
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl  border border-gray-100">
              {cart.map((item) => (
                <div
                  key={item.menuItem}
                  className="flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
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
                    className="w-20 h-20 object-cover rounded-lg mr-6 "
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                    <div className="flex items-center mt-3 space-x-2">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={isCartUpdating}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 transition-colors duration-150"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <span className="text-lg">-</span>
                      </button>
                      <span className="text-sm font-medium text-gray-700 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={isCartUpdating}
                        className="w-7 h-7 flex items-center justify-center bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 transition-colors duration-150"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <span className="text-lg">+</span>
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.menuItem)}
                        disabled={isCartUpdating}
                        className="text-red-500 text-sm font-medium hover:text-red-600 disabled:text-red-300 transition-colors duration-150"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900 font-semibold text-base">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="p-6 flex justify-between items-center bg-gray-50 rounded-b-xl">
                <button
                  onClick={handleClearCart}
                  disabled={isCartUpdating}
                  className="text-red-500 text-sm font-medium hover:text-red-600 disabled:text-red-300 transition-colors duration-150"
                  aria-label="Clear entire cart"
                >
                  Clear Cart
                </button>
                <p className="text-xl font-bold text-gray-900">
                  Total: Rs. {total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div>
            <div className="bg-white p-8 rounded-xl border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Delivery Details
              </h3>
              <div className="space-y-2">
                <div>
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Street Address
                  </label>
                  <input
                    id="street"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      addressErrors.street
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-indigo-500"
                    } bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 `}
                    placeholder="123 Main St"
                    aria-invalid={!!addressErrors.street}
                    aria-describedby={
                      addressErrors.street ? "street-error" : undefined
                    }
                  />
                  {addressErrors.street && (
                    <p id="street-error" className="mt-2 text-sm text-red-500">
                      {addressErrors.street}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      addressErrors.city
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-indigo-500"
                    } bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 `}
                    placeholder="New York"
                    aria-invalid={!!addressErrors.city}
                    aria-describedby={
                      addressErrors.city ? "city-error" : undefined
                    }
                  />
                  {addressErrors.city && (
                    <p id="city-error" className="mt-2 text-sm text-red-500">
                      {addressErrors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      addressErrors.state
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-indigo-500"
                    } bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 `}
                    placeholder="NY"
                    aria-invalid={!!addressErrors.state}
                    aria-describedby={
                      addressErrors.state ? "state-error" : undefined
                    }
                  />
                  {addressErrors.state && (
                    <p id="state-error" className="mt-2 text-sm text-red-500">
                      {addressErrors.state}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="zipcode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Zipcode
                  </label>
                  <input
                    id="zipcode"
                    name="zipcode"
                    value={address.zipcode}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      addressErrors.zipcode
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-indigo-500"
                    } bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 `}
                    placeholder="10001"
                    aria-invalid={!!addressErrors.zipcode}
                    aria-describedby={
                      addressErrors.zipcode ? "zipcode-error" : undefined
                    }
                  />
                  {addressErrors.zipcode && (
                    <p id="zipcode-error" className="mt-2 text-sm text-red-500">
                      {addressErrors.zipcode}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="countryCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Country Code
                  </label>
                  <input
                    id="countryCode"
                    name="countryCode"
                    value={address.countryCode}
                    onChange={handleAddressChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      addressErrors.countryCode
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-indigo-500"
                    } bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:border-transparent transition-all duration-200 `}
                    placeholder="US"
                    aria-invalid={!!addressErrors.countryCode}
                    aria-describedby={
                      addressErrors.countryCode
                        ? "countryCode-error"
                        : undefined
                    }
                  />
                  {addressErrors.countryCode && (
                    <p
                      id="countryCode-error"
                      className="mt-2 text-sm text-red-500"
                    >
                      {addressErrors.countryCode}
                    </p>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-6">
                Payment Method
              </h3>
              <div className="">
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Cash on Delivery
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Pay Now (Stripe)
                  </span>
                </label>
              </div>
              <button
                onClick={handleCheckout}
                className="mt-8 w-full px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-black focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-900 disabled:cursor-not-allowed transition-all duration-200 "
                disabled={isLoading || isCartUpdating}
              >
                {paymentMethod === "cod" ? "Place Order" : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
