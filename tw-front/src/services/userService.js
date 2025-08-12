import { API_BASE_URL, getAuthHeaders, apiRequest } from './api';

export const userService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      return data.users || data;
    }
    throw new Error(`Error loading users: ${response.status}`);
  },

  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/create-user/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response;
  },

  update: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return response;
  },

  delete: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return response;
  },

  // Cargar perfil de usuario
  loadProfile: async () => {
    try {
      const response = await apiRequest('/profile/');

      if (response.ok) {
        const data = await response.json();

        // Guardar en localStorage
        localStorage.setItem("user_role", data.role);
        localStorage.setItem("user_data", JSON.stringify(data));

        return { success: true, data };
      } else {
        return { success: false, error: 'Error al cargar perfil' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Verificar si puede acceder a admin
  canAccessAdmin: (userData, userRole) => {
    if (!userData || !userRole) {
      return false;
    }

    return (
      userRole === 'admin' ||
      userRole === 'operator' ||
      userData.permissions?.can_access_admin === true
    );
  },

  // Limpiar datos de usuario
  clearUserData: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
  }
};

export default userService;