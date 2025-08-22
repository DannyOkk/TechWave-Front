import http from './api';

const myOrders = async () => {
  const { data } = await http.get('/market/model/orders/my-orders/');
  return data;
};

const getAll = async () => {
  const { data } = await http.get('/market/model/orders/');
  return data;
};

const getById = async (id) => {
  const { data } = await http.get(`/market/model/orders/${id}/`);
  return data;
};

const update = async (id, payload) => {
  const { data } = await http.put(`/market/model/orders/${id}/`, payload);
  try { window.dispatchEvent(new Event('orders-changed')); } catch {}
  return data;
};

const cancel = async (id) => {
  const { data } = await http.post(`/market/model/orders/${id}/cancel/`);
  try { window.dispatchEvent(new Event('orders-changed')); } catch {}
  return data;
};

const remove = async (id) => {
  const { data } = await http.delete(`/market/model/orders/${id}/`);
  try { window.dispatchEvent(new Event('orders-changed')); } catch {}
  return data;
};

export const orderService = { myOrders, getAll, getById, update, cancel, remove };
export default orderService;
// Extensión: crear pago para un pedido
export const createPayment = async (pedidoId, metodo = 'tarjeta') => {
  const { data } = await http.post('/market/model/pay/', { pedido: pedidoId, metodo, estado: 'pendiente' });
  try { window.dispatchEvent(new Event('orders-changed')); } catch {}
  return data;
};
orderService.createPayment = createPayment;
