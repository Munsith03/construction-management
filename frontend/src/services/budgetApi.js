import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Attach auth token from localStorage if present
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token"); // ✅ get from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching token:", err);
  }
  return config;
});

// Budgets
export const fetchBudgets = () => api.get("/budgets");
export const addBudget = (budget) => api.post("/budgets", budget);
export const updateBudget = (id, budget) => api.put(`/budgets/${id}`, budget);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

// Expenses
export const fetchExpenses = () => api.get("/expenses");
export const addExpense = (expense) => api.post("/expenses", expense);
export const updateExpense = (id, expense) =>
  api.put(`/expenses/${id}`, expense);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Categories
export const fetchCategories = () => api.get("/categories");
export const addCategory = (category) => api.post("/categories", category);
export const updateCategory = (id, category) =>
  api.put(`/categories/${id}`, category);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export default api;
