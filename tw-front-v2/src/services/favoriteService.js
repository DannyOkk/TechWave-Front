import http from './api';

// Clave de localStorage para favoritos de invitado
export const FAVORITES_KEY = 'guest_favorites';

const dispatchChange = () => {
  try { window.dispatchEvent(new Event('favorites-changed')); } catch {}
};

// Utilidades de almacenamiento local (guest)
export const getGuestFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(id => typeof id === 'number' || typeof id === 'string').map(Number) : [];
  } catch { return []; }
};

const saveGuestFavorites = (ids) => {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids.map(Number))])); } catch {}
  dispatchChange();
};

const isAuth = () => !!localStorage.getItem('access_token');

// Normaliza respuesta de backend Favorite -> product object mínimo
const mapServerFavorite = (fav) => {
  // Esperado: { id, product: { id, nombre, precio }, created_at }
  if (fav && fav.product) return { ...fav.product };
  return fav;
};

// Servicio principal
export const favoriteService = {
  list: async () => {
    if (!isAuth()) {
      return getGuestFavorites(); // array de IDs (guest)
    }
    const { data } = await http.get('/market/model/favorites/');
    return Array.isArray(data) ? data.map(mapServerFavorite) : [];
  },
  add: async (productId) => {
    if (!productId && productId !== 0) return;
    if (!isAuth()) {
      const current = getGuestFavorites();
      if (!current.includes(Number(productId))) {
        saveGuestFavorites([...current, Number(productId)]);
      }
      return { guest: true, product_id: Number(productId) };
    }
    const { data } = await http.post('/market/model/favorites/', { product_id: productId });
    dispatchChange();
    return data;
  },
  remove: async (productId) => {
    if (!productId && productId !== 0) return;
    if (!isAuth()) {
      const current = getGuestFavorites().filter(id => Number(id) !== Number(productId));
      saveGuestFavorites(current);
      return { guest: true, removed: true, product_id: Number(productId) };
    }
    // Necesitamos el id del favorito (no solo product_id) para usar endpoint detalle
    try {
      const { data } = await http.get('/market/model/favorites/');
      const fav = Array.isArray(data) ? data.find(f => Number(f?.product?.id) === Number(productId)) : null;
      if (fav?.id != null) {
        await http.delete(`/market/model/favorites/${fav.id}/`);
      } else {
        // fallback: intentar query param (por si backend acepta DELETE en lista con product_id)
        await http.delete(`/market/model/favorites/`, { params: { product_id: productId } }).catch(()=>{});
      }
    } catch (e) {
      // rethrow para que toggle pueda hacer reload
      throw e;
    }
    dispatchChange();
    return { removed: true };
  },
  toggle: async (productId) => {
    const list = await favoriteService.list();
    const isFav = isAuth() ? list.some(p => Number(p.id) === Number(productId)) : list.includes(Number(productId));
    if (isFav) return favoriteService.remove(productId);
    return favoriteService.add(productId);
  },
  count: async () => {
    const list = await favoriteService.list();
    if (!isAuth()) return list.length; // guest is array de IDs
    return list.length; // array de products
  },
  bulkMerge: async (ids) => {
    if (!isAuth()) return { merged: 0 };
    if (!Array.isArray(ids) || !ids.length) return { merged: 0 };
    const { data } = await http.post('/market/model/favorites/bulk/', { product_ids: ids });
    dispatchChange();
    return data; // { merged: n }
  },
  clearGuest: () => {
    try { localStorage.removeItem(FAVORITES_KEY); } catch {}
    dispatchChange();
  }
};

export default favoriteService;
