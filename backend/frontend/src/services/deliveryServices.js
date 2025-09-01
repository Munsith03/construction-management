import axios from "axios";

const deliveryApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_DELIVERY_BASE_URL ||
    "http://localhost:3004/api/delivery",
  headers: {
    "Content-Type": "application/json",
  },
});

const orderApi = axios.create({
  baseURL: "http://localhost:3003/api/orders",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for deliveryApi
deliveryApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for orderApi
orderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getReadyDeliveries = async () => {
  try {
    const response = await orderApi.get("/ready");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to fetch ready deliveries";
    throw new Error(message);
  }
};

export const assignDelivery = async (orderId) => {
  try {
    if (!orderId) throw new Error("Order ID is required");
    const response = await deliveryApi.post("/assign", { orderId });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to assign delivery";
    throw new Error(message);
  }
};

export const updateDeliveryStatus = async (deliveryId, status) => {
  try {
    if (!deliveryId || !status)
      throw new Error("Delivery ID and status are required");
    const response = await deliveryApi.put(`/${deliveryId}`, { status });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to update delivery status";
    throw new Error(message);
  }
};

export const getDeliveries = async () => {
  try {
    const response = await deliveryApi.get("/my-deliveries");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to fetch deliveries";
    throw new Error(message);
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    if (!orderId) throw new Error("Order ID is required");
    const response = await orderApi.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to fetch order details";
    throw new Error(message);
  }
};

export const getDeliveryById = async (deliveryId) => {
  try {
    if (!deliveryId) throw new Error("Delivery ID is required");
    const response = await deliveryApi.get(`/${deliveryId}`);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Failed to fetch delivery details";
    throw new Error(message);
  }
};

export const getDeliveryByOrderId = async (orderId) => {
  try {
    const response = await deliveryApi.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching delivery by order ID:",
      error.message,
      error.response?.data
    );
    throw new Error(message);
  }
};
