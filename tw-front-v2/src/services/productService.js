import http from './api';
import { mockProducts } from '../data/mockProducts';

export const productService = {
  getAll: async () => {
    try {
  const { data } = await http.get('/market/model/products/');
  return data;
    } catch {
      return mockProducts;
    }
  },
  getById: async (id) => {
    try {
  const { data } = await http.get(`/market/model/products/${id}/`);
  return data;
    } catch {
      return mockProducts.find(p => String(p.id) === String(id));
    }
  },
  create: async (payload) => {
    const { data } = await http.post('/market/model/products/', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await http.patch(`/market/model/products/${id}/`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await http.delete(`/market/model/products/${id}/`);
    return data;
  },
};

export default productService;
