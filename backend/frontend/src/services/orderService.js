import axios from "axios";

const orderService = axios.create({
  baseURL: import.meta.env.VITE_API_ORDER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Bearer Token
orderService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const submitOrder = async (orderData) => {
  try {
    const response = await orderService.post("/orders", orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to submit order");
  }
};

export const getOrderUser = async () => {
  try {
    const response = await orderService.get(`/orders`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch order");
  }
};

export const getAllOrders = async () => {
  try {
    const response = await orderService.get("/orders/admin");
    return response.data;
  } catch (error) {
    console.error("Error while fetching: ", error);
    throw error;
  }
};

export const trackOrder = async (orderId) => {
  try {
    const response = await orderService.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
};
