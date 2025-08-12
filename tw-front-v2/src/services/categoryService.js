import http from './api';
import { mockCategories } from '../data/mockProducts';

export const categoryService = {
  getAll: async () => {
    try {
  const { data } = await http.get('/market/model/categories/');
  return data;
    } catch {
      return mockCategories;
    }
  },
  create: async (payload) => {
    const { data } = await http.post('/market/model/categories/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await http.patch(`/market/model/categories/${id}/`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await http.delete(`/market/model/categories/${id}/`);
    return data;
  },
};

export default categoryService;
