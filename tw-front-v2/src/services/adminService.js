import http from './api'

// Servicio admin: usuarios
export const adminService = {
  // Usuarios
  listUsers: async () => {
    const { data } = await http.get('/users/')
    // backend devuelve lista directa o {users: []}
    return Array.isArray(data) ? data : (data?.users || [])
  },
  updateUser: async (userId, payload) => {
    const { data } = await http.put(`/users/${userId}/`, payload)
    return data
  },
  deleteUser: async (userId) => {
    const { data } = await http.delete(`/users/${userId}/`)
    return data
  },
  changeRole: async (userId, role) => {
  const { data } = await http.put(`/change-role/${userId}/`, { role })
    return data
  },
  createUser: async (payload) => {
    const { data } = await http.post('/create-user/', payload)
    return data
  },
}

export default adminService
