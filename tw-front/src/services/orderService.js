import { API_BASE_URL, getAuthHeaders } from './api';

export const orderService = {
  getAll: async () => {
    const token = localStorage.getItem("access_token");
    const response = await fetch("http://localhost:8000/api/market/model/orders/", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Error al obtener todos los pedidos");
    }
    return response.json();
  },

  getMyOrders: async () => {
    const token = localStorage.getItem("access_token");
    // CAMBIO: Usar los helpers para consistencia, igual que en getById
    const response = await fetch(`${API_BASE_URL}/market/model/orders/my-orders/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      // Mejorar el mensaje de error para dar más contexto
      const errorData = await response.json().catch(() => ({ detail: "Error desconocido" }));
      throw new Error(`Error al obtener mis pedidos: ${errorData.detail}`);
    }
    return response.json();
  },

  getById: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      return response.json();
    }
    throw new Error(`Error loading order: ${response.status}`);
  },

  update: async (orderId, orderData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return response;
  },

  updateStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ estado: status })
    });
    return response;
  },

  updateOrder: async (orderId, orderData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el pedido");
    }
    return response.json();
  },

  cancel: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/cancel/`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    return response;
  },

  updateTotal: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/update_total/`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    return response;
  },

  delete: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/orders/${orderId}/`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response;
  }
};