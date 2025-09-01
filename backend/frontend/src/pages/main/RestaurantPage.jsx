import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getMenuItemsByRestaurant,
  getRestaurantById,
} from "../../services/restaurentServices";
import {
  addToCart,
  getCart,
  clearCart,
  removeFromCart,
} from "../../services/cartServices";
import {
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";

function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState({ items: [], restaurant: null, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [menuData, restaurantData, cartData] = await Promise.all([
          getMenuItemsByRestaurant(id),
          getRestaurantById(id),
          getCart(),
        ]);

        setMenuItems(menuData.data || []);
        setRestaurant(restaurantData.data || null);

        const cartItems = Array.isArray(cartData?.data) ? cartData.data : [];
        setCart({
          items: cartItems,
          restaurant: id,
          total: cartItems.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          ),
        });

        setQuantities(
          cartItems.reduce(
            (acc, item) => ({ ...acc, [item.menuItem]: item.quantity }),
            {}
          )
        );
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const updateCartState = (response, item, quantity) => {
    console.log("response" + response);
    const itemId = item._id;
    setCart({
      items: Array.isArray(response?.items) ? response.items : [],
      restaurant: response?.restaurant || null,
      total: response?.total || 0,
    });
    setQuantities((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleAddToCart = async (item) => {
    const itemId = item._id;
    setError("");
    setSuccess("");
    try {
      if (cart.restaurant && cart.restaurant !== id) {
        await clearCart();
      }
      const response = await addToCart({
        restaurant: id,
        menuItem: itemId,
        quantity: 1,
        price: item.price,
      });
      const newQuantity = (quantities[itemId] || 0) + 1;
      updateCartState(response, item, newQuantity);
      setSuccess(
        `${item.name} ${quantities[itemId] ? "updated" : "added"} in cart!`
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add to cart.");
    }
  };

  const handleRemoveFromCart = async (item) => {
    const itemId = item._id;
    setError("");
    setSuccess("");
    try {
      if (quantities[itemId] <= 0) return;
      const response = await removeFromCart(itemId);
      const newQuantity = Math.max(0, (quantities[itemId] || 0) - 1);
      updateCartState(response, item, newQuantity);
      setSuccess(`${item.name} removed from cart!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to remove from cart.");
    }
  };

  const cartItemCount = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto py-8">
      {isLoading ? (
        <div className="animate-pulse">
          <div className="w-full h-64 bg-gray-200 rounded mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
      ) : (
        restaurant && (
          <div className="pb-12">
            <img
              src={
                restaurant.image
                  ? `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${
                      restaurant.image
                    }`
                  : "https://via.placeholder.com/1200x900?text=No+Image"
              }
              alt={restaurant.storeName}
              className="w-full h-64 object-cover rounded mb-4"
              width="1200"
              height="900"
              loading="lazy"
            />
            <h1 className="text-3xl font-bold">{restaurant.storeName}</h1>
            <p className="text-sm text-gray-600">
              {restaurant.brandName} • {restaurant.city}, {restaurant.state}
            </p>
          </div>
        )
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-600 p-4 rounded shadow-lg flex items-center gap-2 animate-slide-in max-w-sm z-50">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-600 p-4 rounded shadow-lg flex items-center gap-2 animate-slide-in max-w-sm z-50">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 p-4 rounded"
            >
              <div className="w-full h-56 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">No menu items available.</p>
          <Link
            to="/restaurants"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-white border-2  border-gray-100 p-4 rounded hover:bg-gray-50"
            >
              <div className="relative h-56 mb-4">
                <img
                  src={
                    item.image
                      ? `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${
                          item.image
                        }`
                      : "https://via.placeholder.com/300x224?text=No+Image"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                  width="300"
                  height="224"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded capitalize">
                  {item.category}
                </span>
                {item.isAvailable && (
                  <div className="absolute bottom-2 right-2">
                    {quantities[item._id] ? (
                      <div className="flex items-center space-x-2 bg-white p-1 rounded shadow">
                        <button
                          onClick={() => handleRemoveFromCart(item)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-8 text-center">
                          {quantities[item._id]}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-1.5 bg-white text-black rounded hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">
                {item.description}
              </p>
              <p className="text-sm font-medium">Rs {item.price.toFixed(2)}</p>
              <p className="text-sm">
                {item.isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Unavailable</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/cart")}
          className="inline-flex items-center px-8 py-3 bg-black text-white rounded hover:bg-gray-700"
        >
          <ShoppingCart size={16} className="mr-2" />
          View Cart {cartItemCount > 0 && `(${cartItemCount})`}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default RestaurantPage;
