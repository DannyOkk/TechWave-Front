import React from "react";

const AdminSidebar = ({ 
  activeSection, 
  setActiveSection, 
  onNavigateToHome, 
  onLogout 
}) => (
  <div className="admin-sidebar">
    <div className="sidebar-header">
      <h2>🔧 Panel Admin</h2>
      <div className="admin-info">
        <span>👨‍💼 Administrador</span>
      </div>
    </div>

    <nav className="sidebar-nav">
      <button 
        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveSection('dashboard')}
      >
        📊 Dashboard
      </button>
      
      <button 
        className={`nav-item ${activeSection === 'products' ? 'active' : ''}`}
        onClick={() => setActiveSection('products')}
      >
        📦 Productos
      </button>
      
      <button 
        className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}
        onClick={() => setActiveSection('categories')}
      >
        🏷️ Categorías
      </button>
      
      <button 
        className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
        onClick={() => setActiveSection('orders')}
      >
        📋 Pedidos
      </button>
      
      <button 
        className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
        onClick={() => setActiveSection('users')}
      >
        👥 Usuarios
      </button>
    </nav>

    <div className="sidebar-footer">
      <button className="nav-item" onClick={onNavigateToHome}>
        🏠 Volver al Inicio
      </button>
      <button className="nav-item logout-btn" onClick={onLogout}>
        🚪 Cerrar Sesión
      </button>
    </div>
  </div>
);

export default AdminSidebar;