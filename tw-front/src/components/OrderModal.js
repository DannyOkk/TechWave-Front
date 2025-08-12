import React, { useState, useEffect } from "react"; // ✅ AGREGA useEffect
import "../styles/components/OrderModal.css";

const OrderModal = ({ order, onSave, onClose }) => {
  // ✅ AGREGA ESTOS ESTADOS:
  const [formData, setFormData] = useState({
    estado: '',
    notas: ''
  });

  // ✅ AGREGA ESTE useEffect:
  useEffect(() => {
    if (order) {
      setFormData({
        estado: order.estado || '',
        notas: order.notas || ''
      });
    }
  }, [order]);

  // ✅ AGREGA ESTAS FUNCIONES:
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ AGREGA ESTA FUNCIÓN:
  const getStatusColor = (status) => {
    const colors = {
      'pendiente': '#f59e0b',
      'pagado': '#10b981',
      'preparando': '#3b82f6',
      'enviado': '#8b5cf6',
      'entregado': '#059669',
      'cancelado': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // ✅ AGREGA ESTA FUNCIÓN:
  const calculateTotal = () => {
    if (!order?.detalles) return 0;
    return order.detalles.reduce((total, item) => {
      return total + parseFloat(item.subtotal);
    }, 0).toFixed(2);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Pedido #{order?.id}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Información del pedido */}
          <div className="order-info-section">
            <div className="info-grid">
              <div className="info-item">
                <label>Cliente:</label>
                <span>{order?.usuario_detalle?.username || order?.usuario_detalle?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Fecha del pedido:</label>
                <span>{order?.fecha ? new Date(order.fecha).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Estado actual:</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order?.estado) }}
                >
                  {order?.estado}
                </span>
              </div>
              <div className="info-item">
                <label>Total:</label>
                <span className="total-amount">${calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Items del pedido */}
          <div className="order-items-section">
            <h3>🛍️ Productos del pedido</h3>
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio unitario</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.detalles?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto_detalle?.nombre || `Producto #${item.producto}`}</td>
                      <td>${item.subtotal / item.cantidad}</td>
                      <td>{item.cantidad}</td>
                      <td>${item.subtotal}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="no-items">No hay items disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulario de edición */}
          <form onSubmit={handleSubmit} className="edit-order-form">
            <h3>✏️ Editar pedido</h3>
            
            <div className="form-group">
              <label htmlFor="estado">Estado del pedido:</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar estado</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="preparando">Preparando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="notas">Notas adicionales:</label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Agregar notas sobre el pedido..."
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                💾 Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;