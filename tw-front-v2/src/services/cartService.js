import http from './api';

const getCart = async () => {
  // GET /market/model/cart/ -> retorna el carrito del usuario
  const { data } = await http.get('/market/model/cart/');
  return data;
};

const clearCart = async () => {
  const { data } = await http.post('/market/model/cart/clear/');
  try { window.dispatchEvent(new Event('cart-changed')); } catch {}
  return data;
};

// Permite pasar direccion_envio opcional para validar en backend
const checkout = async (direccion_envio) => {
  const payload = direccion_envio ? { direccion_envio } : undefined;
  const { data } = await http.post('/market/model/cart/checkout/', payload);
  try {
    window.dispatchEvent(new Event('cart-changed'));
    window.dispatchEvent(new Event('orders-changed'));
  } catch {}
  return data;
};

const addProduct = async (productId, cantidad = 1) => {
  // POST /market/model/products/{id}/add_to_cart/
  const { data } = await http.post(`/market/model/products/${productId}/add_to_cart/`, { cantidad });
  try { window.dispatchEvent(new Event('cart-changed')); } catch {}
  return data;
};

const listItems = async () => {
  const { data } = await http.get('/market/model/cart-items/');
  return data;
};

const updateItem = async (itemId, cantidad) => {
  const { data } = await http.patch(`/market/model/cart-items/${itemId}/`, { cantidad });
  try { window.dispatchEvent(new Event('cart-changed')); } catch {}
  return data;
};

const removeItem = async (itemId) => {
  const { data } = await http.delete(`/market/model/cart-items/${itemId}/`);
  try { window.dispatchEvent(new Event('cart-changed')); } catch {}
  return data;
};

export const cartService = { getCart, clearCart, checkout, addProduct, listItems, updateItem, removeItem };
export default cartService;
