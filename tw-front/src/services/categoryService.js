import { API_BASE_URL, getAuthHeaders } from './api';

export const categoryService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/market/model/categories/`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  create: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/categories/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
    return response;
  },

  update: async (categoryId, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/market/model/categories/${categoryId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
    return response;
  },

  delete: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/market/model/categories/${categoryId}/`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response;
  }
};