import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import UsersSection from "./UsersSection";
import CategoriesSection from "./CategoriesSection";
import ProductsSection from "./ProductsSection";
import DashboardSection from "./DashboardSection";
import AdminSidebar from "./AdminSidebar";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { orderService } from "../services/orderService";
import "../styles/components/AdminPanel.css";
import AdminOrders from "./AdminOrders";

const AdminPanel = ({ 
  onLogout, 
  onThemeToggle, 
  themeInfo 
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Estados para diferentes secciones (solo arrays de datos)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Solo cargamos el dashboard cuando se accede a él
  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadDashboardData();
    }
  }, [activeSection]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, ordersData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        orderService.getAll()
      ]);

      setDashboardData({
        totalProducts: productsData.length || 0,
        totalCategories: categoriesData.length || 0,
        totalOrders: ordersData.length || 0,
        recentOrders: ordersData.slice(0, 5) || []
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection dashboardData={dashboardData} />;
      case 'products':
        return (
          <ProductsSection
            products={products}
            setProducts={setProducts}
            categories={categories}
          />
        );
      case 'categories':
        return (
          <CategoriesSection
            categories={categories}
            setCategories={setCategories}
          />
        );
      case 'orders':
        return (
          <AdminOrders
            orders={orders}
            setOrders={setOrders}
          />
        );
      case 'users':
        return (
          <UsersSection
            users={users}
            setUsers={setUsers}
          />
        );
      default:
        return <DashboardSection dashboardData={dashboardData} />;
    }
  };

  // Cambiar esta función para usar navigate
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="admin-panel">
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateToHome={handleGoToDashboard}  // Usar la función con navigate
        onLogout={onLogout}
      />
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>TechWave Admin</h1>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={onThemeToggle}>
              {themeInfo?.icon || '🌙'} {themeInfo?.text || 'Cambiar tema'}
            </button>
          </div>
        </header>
        <main className="admin-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;