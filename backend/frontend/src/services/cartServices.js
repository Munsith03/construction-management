import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/cart`;

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

export const getCart = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch cart");
  }
};

export const addToCart = async (item) => {
  try {
    const response = await axiosInstance.post(`/${item.menuItem}`, {
      quantity: item.quantity,
      price: item.price,
      restaurant: item.restaurant,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to add item to cart"
    );
  }
};
2;

export const removeFromCart = async (menuItemId) => {
  try {
    const response = await axiosInstance.patch(`/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to remove item from cart"
    );
  }
};

export const clearCartItem = async (menuItemId) => {
  try {
    const response = await axiosInstance.delete(`/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to remove item from cart"
    );
  }
};

export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete("/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to clear cart");
  }
};
