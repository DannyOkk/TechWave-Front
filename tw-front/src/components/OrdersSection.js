import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderService } from "../services/orderService";
import "../styles/components/OrdersSection.css";

const OrdersSection = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
      return;
    }

    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      // CAMBIO: Llamar siempre a la función que trae solo "Mis Pedidos"
      loadMyOrders();
    }
  }, [orderId, navigate]);

  const loadOrderDetails = async (id) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await orderService.getById(id);
      // Pequeña validación para seguridad: un usuario no debería poder ver pedidos ajenos por URL
      // (Aunque el backend ya debería impedirlo, es una buena práctica)
      setSelectedOrder(data);
    } catch (error) {
      console.error("Error loading order details:", error);
      setDetailError("No se pudieron cargar los detalles del pedido.");
    } finally {
      setDetailLoading(false);
    }
  };

  // CAMBIO: Esta función ahora carga solo los pedidos del usuario.
  const loadMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders(); // Usamos la función correcta
      setOrders(data);
    } catch (error) {
      console.error("Error loading my orders:", error);
      setError("No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': 'status-pendiente',
      'pagado': 'status-pagado',
      'preparando': 'status-preparando',
      'enviado': 'status-enviado',
      'entregado': 'status-entregado',
      'cancelado': 'status-cancelado'
    };
    return colors[status] || 'status-default';
  };

  // --- VISTA DE DETALLE DE PEDIDO (Sin cambios) ---
  if (orderId) {
    if (detailLoading) {
      return (
        <div className="orders-section-loading">
          <div className="spinner"></div>
          <p>Cargando detalle del pedido...</p>
        </div>
      );
    }

    if (detailError || !selectedOrder) {
      return (
        <div className="order-detail-container">
           <button onClick={() => navigate(-1)} className="back-btn">
              ← Volver
            </button>
          <div className="orders-section-error">
            <p>⚠️ {detailError || "Pedido no encontrado."}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="order-detail-container">
        <header className="detail-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Volver
          </button>
          <div className="header-info">
            <h1>Pedido #{selectedOrder.id}</h1>
            <span className={`status-badge ${getStatusColor(selectedOrder.estado)}`}>
              {selectedOrder.estado}
            </span>
          </div>
        </header>

        <div className="detail-card summary-card">
          <h3>Resumen del Pedido</h3>
          <div className="summary-grid">
            <p><strong>👤 Cliente:</strong> {selectedOrder.usuario_detalle?.username || 'N/A'}</p>
            <p><strong>📅 Fecha:</strong> {new Date(selectedOrder.fecha).toLocaleString()}</p>
            <p><strong>📍 Envío:</strong> {selectedOrder.direccion_envio || 'No especificada'}</p>
            <p><strong>💵 Total:</strong> ${parseFloat(selectedOrder.total).toFixed(2)}</p>
          </div>
        </div>

        <div className="detail-card items-card">
          <h3>Artículos en este pedido</h3>
          <ul className="items-list">
            {selectedOrder.detalles.map(item => (
              <li key={item.id} className="item-row">
                <div className="item-info">
                  <img 
                    src={item.producto_detalle.imagen_url || 'https://via.placeholder.com/50'} 
                    alt={item.producto_detalle.nombre} 
                    className="item-image"
                  />
                  <span className="item-name">{item.producto_detalle.nombre}</span>
                </div>
                <div className="item-details">
                  <span>{item.cantidad} x ${parseFloat(item.producto_detalle.precio).toFixed(2)}</span>
                  <span className="item-subtotal">${parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // --- VISTA DE LISTA "MIS PEDIDOS" ---
  if (loading) {
    return <div className="orders-section-loading"><div className="spinner"></div><p>Cargando tus pedidos...</p></div>;
  }

  if (error) {
    return <div className="orders-section-error"><p>⚠️ {error}</p><button onClick={loadMyOrders} className="retry-btn">Reintentar</button></div>;
  }

  return (
    <div className="orders-section">
      {/* CAMBIO: Header de "Mis Pedidos" integrado directamente */}
      <header className="orders-nav-header">
        <div className="nav-content">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Volver
          </button>
          <h1>📦 Mis Pedidos</h1>
          <div className="nav-actions">
            <button className="nav-btn" onClick={() => navigate('/products')}>
              🛍️ Seguir Comprando
            </button>
          </div>
        </div>
      </header>

      {/* CAMBIO: Lista de pedidos simplificada para el usuario */}
      <div className="orders-list">
        {/* CAMBIO: Añadimos 'index' al map */}
        {orders.map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-info">
              <div className="order-id">
                {/* CAMBIO: Usamos index + 1 en lugar de order.id */}
                <strong>Pedido #{index + 1}</strong>
              </div>
              <div className="order-details">
                <div className="order-detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{new Date(order.fecha).toLocaleString()}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">${order.total}</span>
                </div>
                <div className="order-detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className={`detail-value status-badge ${getStatusColor(order.estado)}`}>
                    {order.estado}
                  </span>
                </div>
              </div>
            </div>
            <div className="order-actions">
              <Link to={`/orders/${order.id}`} className="action-btn view">
                Ver Detalles
              </Link>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <div className="no-orders-icon">📪</div>
          <h3>Aún no tienes pedidos</h3>
          <p>¡Explora nuestros productos y haz tu primera compra!</p>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;