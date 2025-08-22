import http from './api';

export const paymentService = {
  create: async ({ pedido, metodo, metadata = {}, external_id = '', external_redirect_url = '', comprobante_url = '', comprobante_archivo = null }) => {
    const hasFile = !!comprobante_archivo;
    let config = {};
    let body;
    if (hasFile) {
      const fd = new FormData();
      fd.append('pedido', String(pedido));
      fd.append('metodo', metodo);
      if (metadata && typeof metadata === 'object') {
        // Enviar metadata como JSON string para DRF
        fd.append('metadata', JSON.stringify(metadata));
      }
      if (external_id) fd.append('external_id', external_id);
      if (external_redirect_url) fd.append('external_redirect_url', external_redirect_url);
      if (comprobante_url) fd.append('comprobante_url', comprobante_url);
      if (comprobante_archivo) fd.append('comprobante_archivo', comprobante_archivo);
      body = fd;
      config.headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      body = { pedido, metodo, metadata, external_id, external_redirect_url, comprobante_url };
    }
    const { data } = await http.post('/market/model/pay/', body, config);
    try { window.dispatchEvent(new Event('orders-changed')); } catch {}
    return data;
  },
  complete: async (id) => {
    const { data } = await http.post(`/market/model/pay/${id}/complete/`);
    try { window.dispatchEvent(new Event('orders-changed')); } catch {}
    return data;
  },
  fail: async (id) => {
    const { data } = await http.post(`/market/model/pay/${id}/fail/`);
    try { window.dispatchEvent(new Event('orders-changed')); } catch {}
    return data;
  },
  approve: async (id) => {
    const { data } = await http.post(`/market/model/pay/${id}/approve/`);
    try { window.dispatchEvent(new Event('orders-changed')); } catch {}
    return data;
  },
  reject: async (id) => {
    const { data } = await http.post(`/market/model/pay/${id}/reject/`);
    try { window.dispatchEvent(new Event('orders-changed')); } catch {}
    return data;
  },
  proof: async (id, { comprobante_url = '', comprobante_archivo = null }) => {
    const hasFile = !!comprobante_archivo
    let body; let config={}
    if (hasFile){
      const fd = new FormData()
      if (comprobante_url) fd.append('comprobante_url', comprobante_url)
      fd.append('comprobante_archivo', comprobante_archivo)
      body = fd; config.headers = { 'Content-Type': 'multipart/form-data' }
    } else {
      body = { comprobante_url }
    }
    const { data } = await http.post(`/market/model/pay/${id}/proof/`, body, config)
    return data
  },
  list: async (params = {}) => {
    const { data } = await http.get('/market/model/pay/', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await http.get(`/market/model/pay/${id}/`);
    return data;
  }
};

export default paymentService;
