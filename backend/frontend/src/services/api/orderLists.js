import axios from "axios";

const orderApi = axios.create({
  baseURL: "http://localhost:3003/api/orders",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`, // FIXED
  },
});

export const getPendingOrders = async (restaurantId) => {
  try {
    const response = await orderApi.get(`/restaurant/${restaurantId}/pending`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    throw error;
  }
};

export const acceptOrder = async (orderId) => {
  try {
    const response = await orderApi.patch(`/${orderId}/prepare`);
    return response.data;
  } catch (error) {
    console.error("Error accepting order:", error);
    throw error;
  }
};

export const getPrepare = async (restaurantId) => {
  try {
    const response = await orderApi.get(
      `/restaurant/${restaurantId}/preparing`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching preparing orders:", error);
    throw error;
  }
};

export const prepareOrder = async (orderId) => {
  try {
    const response = await orderApi.patch(`/${orderId}/ready`);
    return response.data;
  } catch (error) {
    console.error("Error preparing order:", error);
    throw error;
  }
};

export const getPickup = async (restaurantId) => {
  try {
    const response = await orderApi.get(`/restaurant/${restaurantId}/ready`);
    return response.data;
  } catch (error) {
    console.error("Error fetching pickup orders:", error);
    throw error;
  }
};

export const pickedOrder = async (orderId) => {
  try {
    const response = await orderApi.patch(`/${orderId}/confirm`);
    return response.data;
  } catch (error) {
    console.error("Error confirming picked order:", error);
    throw error;
  }
};

export const getPicked = async (restaurantId) => {
  try {
    const response = await orderApi.get(`/restaurant/${restaurantId}/picked`);
    return response.data;
  } catch (error) {
    console.error("Error fetching picked orders:", error);
    throw error;
  }
};

export const getDelivered = async (restaurantId) => {
  try {
    const response = await orderApi.get(
      `/restaurant/${restaurantId}/delivered`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    throw error;
  }
};

// export const getAllOrders = async () => {
//   try {
//     const response = await orderApi.get("/admin");
//     return response.data;
//   } catch (error) {
//     console.error("Error while fetching: ", error);
//     throw error;
//   }
// };
