import axios from "axios";
import {
  getOrderUser,
  trackOrder as trackOrderFromOrderService,
} from "./orderService";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/user`;

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

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axiosInstance.patch(`/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error updating user role" };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch user details"
    );
  }
};

export const updateUserDetails = async (userDetails) => {
  try {
    const response = await axiosInstance.patch("/update", userDetails);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update user details"
    );
  }
};

export const deleteUser = async () => {
  try {
    const response = await axiosInstance.delete("/delete");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get("/profile");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch user profile"
    );
  }
};

export const getOrders = async () => {
  return getOrderUser();
};

export const trackOrder = async (orderId) => {
  return trackOrderFromOrderService(orderId);
};
