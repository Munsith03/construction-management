import { useState, useEffect } from "react";
import { getRestaurantByOwner } from "../../services/restaurentServices.js"; // Adjust path as needed
import RestaurantAdminPage from "./RestaurantAdminPage.jsx"; // Adjust path as needed

const RestaurantAdminWrapper = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await getRestaurantByOwner();
        setRestaurantId(response.data._id);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch restaurant");
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading restaurant...
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return <RestaurantAdminPage restaurantId={restaurantId} />;
};

export default RestaurantAdminWrapper;
