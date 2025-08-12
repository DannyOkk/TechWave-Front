import http, { saveTokens, clearAuth } from './api';

const login = async ({ username, password }) => {
  const { data } = await http.post('/login/', { username, password }); // TokenObtainPairView
  const access = data?.access;
  const refresh = data?.refresh;
  if (access && refresh) {
    saveTokens({ access, refresh });
    try {
      const me = await profile();
      if (me) {
        localStorage.setItem('user_role', me.role || 'client');
        localStorage.setItem('user_data', JSON.stringify(me));
      }
    } catch { /* ignore */ }
  }
  return data;
};

const register = async (payload) => {
  // No autenticado -> crea cliente
  const { data } = await http.post('/create-user/', payload);
  return data;
};

const profile = async () => {
  const { data } = await http.get('/profile/');
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await http.put('/profile/', payload);
  // persistir en localStorage para reflejar cambios rápidos
  try { localStorage.setItem('user_data', JSON.stringify(data)); } catch {}
  return data;
};

const logout = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    await http.post('/logout/', { refresh }, { headers: { 'x-skip-refresh': 'true' } });
  } finally {
    clearAuth();
  }
};

export const authService = { login, register, profile, updateProfile, logout };
export default authService;
