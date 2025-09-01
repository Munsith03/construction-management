import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../../services/restaurentServices";
import { AlertCircle, PlusCircle } from "lucide-react";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const data = await getRestaurants();
        setRestaurants(data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Unable to load restaurants. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-600 p-4 rounded-lg shadow-md mb-8 flex items-center gap-3 animate-toast-in"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
          aria-busy="true"
          aria-label="Loading restaurants"
          role="status"
          aria-hidden="true"
        >
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm"
            >
              <div className="h-56 w-full bg-gray-200 rounded-md mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm text-center mt-6 animate-fade-in">
          <p className="text-gray-600 text-sm mb-4">
            No restaurants found. Start by adding a new one!
          </p>
          <Link
            to="/add-restaurant"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            aria-label="Add a new restaurant"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Restaurant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant._id}
              to={`/restaurant/${restaurant._id}`}
              className="bg-white border border-gray-100  rounded-lg shadow-sm transition-all duration-200"
              aria-label={`Visit ${restaurant.storeName}`}
            >
              <img
                src={
                  restaurant.image
                    ? `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${
                        restaurant.image
                      }`
                    : "https://via.placeholder.com/300x224?text=No+Image"
                }
                alt={restaurant.storeName}
                className="w-full h-28  rounded-t-md "
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x224?text=No+Image";
                }}
              />
              <div className="space-y-1 p-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {restaurant.storeName}
                </h3>
                <p className="text-sm font-medium text-gray-600 truncate">
                  {restaurant.brandName}
                </p>
                <p className="text-sm text-gray-500 capitalize truncate">
                  {restaurant.businessType}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {restaurant.city}, {restaurant.state}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
        .font-sans {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
    </div>
  );
}

export default Restaurants;
