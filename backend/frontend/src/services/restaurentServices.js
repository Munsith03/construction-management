import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}/restaurants`;

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken") || null;
};

// Create an Axios instance with default headers
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getRestaurants = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch restaurants"
    );
  }
};

export const getMenuItemsByRestaurant = async (restaurantId) => {
  try {
    const response = await axiosInstance.get(
      `/menu?restaurantId=${restaurantId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch menu items"
    );
  }
};

// Create a new restaurant
export const createRestaurant = async (restaurantData) => {
  try {
    if (!restaurantData) {
      throw new Error("Invalid restaurant data");
    }
    const response = await axiosInstance.post("/", restaurantData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set for image upload
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error creating restaurant:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to create restaurant";
  }
};

// Get unavailable restaurants
export const getUnavailableRestaurants = async () => {
  try {
    const response = await axiosInstance.get("/unavailable");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching unavailable restaurants:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.error || "Failed to fetch unavailable restaurants"
    );
  }
};

// Update restaurant availability
export const updateRestaurantAvailability = async (restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    const response = await axiosInstance.patch(
      `/${restaurantId}/availability`,
      {
        isAvailable: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating restaurant availability:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.error || "Failed to update restaurant availability"
    );
  }
};

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching restaurants:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to fetch restaurants";
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id) => {
  try {
    if (!id) {
      throw new Error("Restaurant ID is required");
    }
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching restaurant details:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to fetch restaurant details";
  }
};

// Update restaurant
export const updateRestaurant = async (id, updatedData) => {
  try {
    if (!id) {
      throw new Error("Restaurant ID is required");
    }
    if (!updatedData || typeof updatedData !== "object") {
      throw new Error("Invalid update data");
    }
    const response = await axiosInstance.put(`/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating restaurant:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to update restaurant";
  }
};

// Delete restaurant
export const deleteRestaurant = async (id) => {
  try {
    if (!id) {
      throw new Error("Restaurant ID is required");
    }
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting restaurant:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to delete restaurant";
  }
};

export const getRestaurantByOwner = async () => {
  try {
    const response = await axiosInstance.get("/owner");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching restaurant by owner:",
      error.response?.data || error.message
    );
    throw error.response?.data?.error || "Failed to fetch restaurant by owner";
  }
};
