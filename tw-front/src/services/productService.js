import { API_BASE_URL, getAuthHeaders } from './api';

export const productService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/market/model/products/`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/products/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return response;
  },

  update: async (productId, productData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/products/${productId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    return response;
  },

  delete: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/products/${productId}/`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response;
  }
};