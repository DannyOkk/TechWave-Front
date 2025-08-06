import React from "react";
import "../styles/components/OrderModal.css";

const OrderViewModal = ({ order, onClose }) => {
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
          <h2>👁️ Ver Pedido #{order?.id}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Información del pedido */}
          <div className="order-info-section">
            <div className="info-grid">
              <div className="info-item">
                <label>Cliente:</label>
                <div className="customer-details">
                  <span className="customer-name">
                    {order?.usuario_detalle?.username || 'N/A'}
                  </span>
                  {order?.usuario_detalle?.email && (
                    <span className="customer-email">
                      📧 {order.usuario_detalle.email}
                    </span>
                  )}
                  {order?.usuario_detalle?.phone && (
                    <span className="customer-phone">
                      📱 {order.usuario_detalle.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <label>Fecha del pedido:</label>
                <div className="date-details">
                  <span className="date">
                    📅 {order?.fecha ? new Date(order.fecha).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="time">
                    🕐 {order?.fecha ? new Date(order.fecha).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <label>Estado actual:</label>
                <span 
                  className="status-badge view-mode"
                  style={{ backgroundColor: getStatusColor(order?.estado) }}
                >
                  {order?.estado?.toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Total del pedido:</label>
                <span className="total-amount view-mode">
                  💰 ${calculateTotal()}
                </span>
              </div>
            </div>
          </div>

          {/* Notas del pedido */}
          {order?.notas && (
            <div className="order-notes-section">
              <h3>📝 Notas del pedido</h3>
              <div className="notes-content">
                {order.notas}
              </div>
            </div>
          )}

          {/* Items del pedido */}
          <div className="order-items-section">
            <h3>🛍️ Productos del pedido ({order?.detalles?.length || 0} items)</h3>
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
                      <td>
                        <div className="product-info">
                          <span className="product-name">
                            {item.producto_detalle?.nombre || `Producto #${item.producto}`}
                          </span>
                          {item.producto_detalle?.categoria && (
                            <span className="product-category">
                              🏷️ {item.producto_detalle.categoria.nombre} {/* ← CAMBIO AQUÍ: .nombre */}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>${(item.subtotal / item.cantidad).toFixed(2)}</td>
                      <td>
                        <span className="quantity-badge">
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="subtotal-cell">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="no-items">
                        📭 No hay items disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón de cerrar */}
          <div className="view-actions">
            <button onClick={onClose} className="btn-close-view">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;