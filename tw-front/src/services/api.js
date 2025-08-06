export const API_BASE_URL = 'http://localhost:8000/api';

// Función para obtener headers de autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Función para hacer logout cuando el token expire
const handleTokenExpiration = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_data");
  
  // Recargar la página para resetear el estado
  window.location.href = '/';
};

// Interceptor para manejar respuestas
const handleResponse = async (response) => {
  if (response.status === 401) {
    handleTokenExpiration();
    throw new Error('Token expirado');
  }
  return response;
};

// Función genérica para hacer requests
export const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    await handleResponse(response);
    return response;
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error);
    throw error;
  }
};

export default {
  apiRequest,
  handleTokenExpiration,
  API_BASE_URL,
  getAuthHeaders
};