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
    // Payload puede ser { nombre, descripcion, precio, stock, categoria, imagen? }
    let body = payload; let config={}
    if (payload?.imagen instanceof File){
      const fd = new FormData()
      Object.entries(payload).forEach(([k,v])=>{ if (k==='imagen') return; fd.append(k, v) })
      fd.append('imagen', payload.imagen)
      body = fd; config.headers = { 'Content-Type': 'multipart/form-data' }
    }
    const { data } = await http.post('/market/model/products/', body, config);
    return data;
  },
  update: async (id, payload) => {
    let body = payload; let config={}
    if (payload?.imagen instanceof File){
      const fd = new FormData()
      Object.entries(payload).forEach(([k,v])=>{ if (k==='imagen') return; fd.append(k, v) })
      fd.append('imagen', payload.imagen)
      body = fd; config.headers = { 'Content-Type': 'multipart/form-data' }
    }
    const { data } = await http.patch(`/market/model/products/${id}/`, body, config);
    return data;
  },
  remove: async (id) => {
    const { data } = await http.delete(`/market/model/products/${id}/`);
    return data;
  },
};

export default productService;
