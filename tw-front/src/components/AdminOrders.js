import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import '../styles/components/OrdersSection.css'; // Reutilizamos los estilos existentes

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Estados para los filtros
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. LLAMAMOS A LA FUNCIÓN QUE TRAE TODOS LOS PEDIDOS
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError('No se pudieron cargar los pedidos. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  // 2. LÓGICA DE FILTRADO
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Filtro por estado
        if (statusFilter === 'todos') return true;
        return order.estado === statusFilter;
      })
      .filter(order => {
        // Filtro por término de búsqueda (ID de pedido o nombre de cliente)
        const search = searchTerm.toLowerCase();
        if (!search) return true;
        const customerName = order.usuario_detalle?.username?.toLowerCase() || '';
        return (
          order.id.toString().includes(search) ||
          customerName.includes(search)
        );
      });
  }, [orders, statusFilter, searchTerm]);

  const getStatusColor = (status) => {
    const colors = {
      'pendiente': 'status-pendiente',
      'pagado': 'status-pagado',
      'preparando': 'status-preparando',
      'enviado': 'status-enviado',
      'entregado': 'status-entregado',
      'cancelado': 'status-cancelado',
    };
    return colors[status] || 'status-default';
  };

  // Placeholder para futuras funciones de edición/eliminación
  const handleEditStatus = (orderId) => {
  const order = orders.find(o => o.id === orderId);
  setOrderToEdit(order);
  setNewStatus(order?.estado || '');
  setEditAddress(order?.direccion_envio || '');
  setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
  setShowEditModal(false);
  setOrderToEdit(null);
  setNewStatus('');
  };

  const handleSaveStatus = async () => {
  if (!orderToEdit) return;
  try {
    await orderService.updateOrder(orderToEdit.id, {
      estado: newStatus,
      direccion_envio: editAddress
    });
    setOrders(prev =>
      prev.map(order =>
        order.id === orderToEdit.id
          ? { ...order, estado: newStatus, direccion_envio: editAddress }
          : order
      )
    );

    handleCloseEditModal();
      } catch (err) {
        alert('No se pudo actualizar el pedido. Intenta nuevamente.');
        console.error(err);
      }
    };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el pedido #${orderId}? Esta acción no se puede deshacer.`)) {
      try {
        await orderService.delete(orderId);
        setOrders(prev => prev.filter(order => order.id !== orderId));
        alert('Pedido eliminado correctamente.');
      } catch (err) {
        alert('No se pudo eliminar el pedido. Intenta nuevamente.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="orders-section-loading"><div className="spinner"></div><p>Cargando todos los pedidos...</p></div>;
  }

  if (error) {
    return <div className="orders-section-error"><p>⚠️ {error}</p><button onClick={loadAllOrders} className="retry-btn">Reintentar</button></div>;
  }

  return (
    <div className="orders-section">
      <div className="section-header">
        <h1>📋 Gestión de Pedidos</h1>
      </div>

      {/* 3. BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por ID o cliente..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="preparando">Preparando</option>
            <option value="enviado">Enviado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* 4. LISTA DE PEDIDOS PARA EL ADMIN */}
      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-info">
                <div className="order-id">
                  <strong>Pedido #{order.id}</strong>
                </div>
                <div className="order-details">
                  {/* MOSTRAMOS EL NOMBRE DEL CLIENTE */}
                  <div className="order-detail-item">
                    <span className="detail-label">👤 Cliente:</span>
                    <span className="detail-value">{order.usuario_detalle?.username || 'N/A'}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">📅 Fecha:</span>
                    <span className="detail-value">{new Date(order.fecha).toLocaleString()}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">💵 Total:</span>
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
              {/* 5. BOTONES DE ACCIÓN PARA EL ADMIN */}
              <div className="order-actions">
                <button onClick={() => handleShowDetails(order)} className="action-btn view">
                  Detalles
                </button>
                <button onClick={() => handleEditStatus(order.id)} className="btn-edit">
                  ✏️
                </button>
                <button onClick={() => handleDeleteOrder(order.id)} className="btn-delete">
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-orders">
            <h3>No se encontraron pedidos</h3>
            <p>Pruebe a cambiar los filtros o el término de búsqueda.</p>
          </div>
        )}
      </div>

{showEditModal && orderToEdit && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Editar pedido #{orderToEdit.id}</h2>
      <p><strong>Cliente:</strong> {orderToEdit.usuario_detalle?.username || 'N/A'}</p>
      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="edit-status-select"><strong>Nuevo estado:</strong></label>
        <select
          id="edit-status-select"
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          style={{ marginLeft: '1rem' }}
        >
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="preparando">Preparando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div style={{ margin: '1rem 0' }}>
        <label htmlFor="edit-address"><strong>Dirección de envío:</strong></label>
        <textarea
          id="edit-address"
          value={editAddress}
          onChange={e => setEditAddress(e.target.value)}
          rows={3}
          className='edit-address-textarea'
        />
      </div>
      <button onClick={handleSaveStatus} className="btn-primary" style={{ marginRight: '0.5rem' }}>Guardar</button>
      <button onClick={handleCloseEditModal} className="btn-secondary">Cancelar</button>
    </div>
  </div>
)}

{showDetailsModal && selectedOrder && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Detalles del Pedido #{selectedOrder.id}</h2>
      <p><strong>Número de pedido (usuario):</strong> {selectedOrder.numero_pedido || 'N/A'}</p>
      <p><strong>Cliente:</strong> {selectedOrder.usuario_detalle?.username || 'N/A'} ({selectedOrder.usuario_detalle?.email || 'Sin email'})</p>
      <p><strong>Fecha:</strong> {new Date(selectedOrder.fecha).toLocaleString()}</p>
      <p><strong>Dirección de envío:</strong> {selectedOrder.direccion_envio || 'No especificada'}</p>
      <p><strong>Total:</strong> ${selectedOrder.total}</p>
      <p>
        <strong>Estado:</strong>
        <span className={`status-badge ${getStatusColor(selectedOrder.estado)}`}>
          {selectedOrder.estado}
        </span>
      </p>
      <div>
        <strong>Artículos en el pedido:</strong>
        <ul>
          {selectedOrder.articulos?.length > 0 ? (
            selectedOrder.articulos.map((item, idx) => (
              <li key={idx}>
                {item.nombre} x{item.cantidad} (${item.precio} c/u)
              </li>
            ))
          ) : (
            <li>No hay artículos en este pedido.</li>
          )}
        </ul>
      </div>
      <p><strong>Teléfono de contacto:</strong> {selectedOrder.usuario_detalle?.telefono || 'No disponible'}</p>
      <p><strong>Notas del pedido:</strong> {selectedOrder.notas || 'Sin notas'}</p>
      <button onClick={handleCloseDetails} className="btn-secondary">Cerrar</button>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminOrders;