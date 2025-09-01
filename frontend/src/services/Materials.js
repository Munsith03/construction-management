const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const materialsApi = {
  list: (q = "") => request(`/materials${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  get: (id) => request(`/materials/${id}`),
  create: (data) => request(`/materials`, { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/materials/${id}`, { method: "DELETE" }),

  suppliers: () => request(`/suppliers`),
  purchaseOrders: () => request(`/purchase-orders`),
  movements: () => request(`/inventory/movements`),
};
