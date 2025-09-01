import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Registration successful",
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Registration failed";
    const errorStatus = error.response?.status || 500;
    return {
      success: false,
      message: errorMessage,
      status: errorStatus,
    };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Login successful",
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    const errorStatus = error.response?.status || 500;
    return {
      success: false,
      message: errorMessage,
      status: errorStatus,
    };
  }
};
