import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}/menu`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getMenuItems = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch menu items"
    );
  }
};

export const createMenuItem = async (menuItemData, imageFile) => {
  try {
    const formData = new FormData();
    Object.entries(menuItemData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await axiosInstance.post("/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to create menu item"
    );
  }
};

export const updateMenuItem = async (id, menuItemData, imageFile) => {
  try {
    const formData = new FormData();
    Object.entries(menuItemData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await axiosInstance.patch(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update menu item"
    );
  }
};

export const deleteMenuItem = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to delete menu item"
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
