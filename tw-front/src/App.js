import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Products from "./components/Products";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel";
import Settings from "./components/Settings";
import OrdersSection from "./components/OrdersSection";
import { userService } from "./services/userService";
import "./styles/globals/themes.css";
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [themeMode, setThemeMode] = useState('auto');
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
      loadUserProfile();
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    // Función para aplicar el tema
    const applyTheme = (mode) => {
      if (mode === 'auto') {
        // Usar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-theme', !prefersDark);
      } else if (mode === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }
    };

    // Cargar tema guardado o usar 'auto' por defecto
    const savedTheme = localStorage.getItem("theme") || 'auto';
    setThemeMode(savedTheme);
    applyTheme(savedTheme);

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (themeMode === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  const handleThemeToggle = () => {
    // Ciclar entre: auto -> light -> dark -> auto
    let newMode;
    if (themeMode === 'auto') {
      newMode = 'light';
    } else if (themeMode === 'light') {
      newMode = 'dark';
    } else {
      newMode = 'auto';
    }
    
    setThemeMode(newMode);
    localStorage.setItem("theme", newMode);
    
    // Aplicar el tema inmediatamente
    if (newMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('light-theme', !prefersDark);
    } else if (newMode === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  // Función para obtener el ícono y texto del tema actual
  const getThemeInfo = () => {
    switch (themeMode) {
      case 'auto':
        return { icon: '🌓', text: 'Tema: Auto' };
      case 'light':
        return { icon: '☀️', text: 'Tema: Claro' };
      case 'dark':
        return { icon: '🌙', text: 'Tema: Oscuro' };
      default:
        return { icon: '🌓', text: 'Cambiar tema' };
    }
  };

  const loadUserProfile = async () => {
    const result = await userService.loadProfile();
    
    if (result.success) {
      setUserData(result.data);
      setUserRole(result.data.role);
    } else {
      // Si falla, hacer logout
      handleLogout();
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    loadUserProfile();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
    userService.clearUserData();
  };

  const handleRegisterSuccess = () => {
    alert("Cuenta creada exitosamente. Por favor, inicia sesión.");
  };

  const handleUserDataUpdate = (updatedData) => {
    setUserData(updatedData);
    localStorage.setItem("user_data", JSON.stringify(updatedData));
  };

  const canAccessAdmin = () => {
    return userService.canAccessAdmin(userData, userRole);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* RUTA HOME PÚBLICA */}
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <Home
                  isPublic={true}
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* LOGIN */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* REGISTER */}
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <Register onRegisterSuccess={handleRegisterSuccess} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* DASHBOARD (Home autenticado) */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Home
                  isPublic={false}
                  userRole={userRole}
                  userData={userData}
                  onLogout={handleLogout}
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* PRODUCTOS (LISTA) */}
          <Route 
            path="/products" 
            element={
              <Products
                onThemeToggle={handleThemeToggle}
                themeInfo={getThemeInfo()}
              />
            } 
          />

          {/* PRODUCTOS (DETALLE) */}
          <Route 
            path="/products/:productId" 
            element={
              <Products
                onThemeToggle={handleThemeToggle}
                themeInfo={getThemeInfo()}
              />
            } 
          />

          {/* CARRITO */}
          <Route 
            path="/cart" 
            element={
              isAuthenticated ? (
                <Cart
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* PEDIDOS (LISTA Y DETALLE) */}
          <Route 
            path="/orders" 
            element={
              isAuthenticated ? (
                <OrdersSection
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/orders/:orderId" 
            element={
              isAuthenticated ? (
                <OrdersSection
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* ADMIN */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated && canAccessAdmin() ? (
                <AdminPanel
                  onLogout={handleLogout}
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* CONFIGURACIÓN */}
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? (
                <Settings
                  userData={userData}
                  onUserDataUpdate={handleUserDataUpdate}
                  onThemeToggle={handleThemeToggle}
                  themeInfo={getThemeInfo()}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* CATCH-ALL: Redirigir rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;