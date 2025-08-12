import React from "react";

const DashboardSection = ({ dashboardData }) => {
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>📊 Dashboard Administrativo</h1>
        <p>Resumen general del sistema</p>
      </div>

      {dashboardData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{dashboardData.totalProducts}</h3>
              <p>Productos Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>{dashboardData.totalCategories}</h3>
              <p>Categorías</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{dashboardData.totalOrders}</h3>
              <p>Pedidos Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>$0</h3>
              <p>Ventas del Mes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSection;