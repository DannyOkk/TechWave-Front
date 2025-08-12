import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/components/Settings.css";

const Settings = ({ 
  onLogout, 
  onThemeToggle, 
  themeInfo,
  userData,
  onUserDataUpdate 
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' o 'error'

  // Estados para perfil
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    phone: ''
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Estados para notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email_orders: true,
    email_promotions: false,
    email_security: true,
    push_notifications: true
  });

  useEffect(() => {
    if (userData) {
      setProfileData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        address: userData.address || '',
        phone: userData.phone || ''
      });
    }
  }, [userData]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        onUserDataUpdate && onUserDataUpdate(updatedData);
        showMessage("Perfil actualizado correctamente", "success");
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || "Error al actualizar perfil", "error");
      }
    } catch (error) {
      showMessage("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage("Las contraseñas no coinciden", "error");
      return;
    }

    if (passwordData.new_password.length < 8) {
      showMessage("La contraseña debe tener al menos 8 caracteres", "error");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (response.ok) {
        showMessage("Contraseña cambiada correctamente", "success");
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || "Error al cambiar contraseña", "error");
      }
    } catch (error) {
      showMessage("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/notification-settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(notificationSettings)
      });

      if (response.ok) {
        showMessage("Configuración de notificaciones actualizada", "success");
      } else {
        showMessage("Error al actualizar notificaciones", "error");
      }
    } catch (error) {
      showMessage("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => (
    <div className="settings-content">
      <h3>Información Personal</h3>
      <form onSubmit={handleProfileUpdate} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre de usuario</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={profileData.first_name}
              onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              value={profileData.last_name}
              onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <textarea
            value={profileData.address}
            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );

  const renderPasswordSection = () => (
    <div className="settings-content">
      <h3>Cambiar Contraseña</h3>
      <form onSubmit={handlePasswordChange} className="settings-form">
        <div className="form-group">
          <label>Contraseña actual</label>
          <input
            type="password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
            required
            minLength="8"
          />
        </div>

        <div className="form-group">
          <label>Confirmar nueva contraseña</label>
          <input
            type="password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
            required
            minLength="8"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar Contraseña"}
        </button>
      </form>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="settings-content">
      <h3>Notificaciones</h3>
      <div className="notifications-settings">
        <div className="notification-item">
          <div className="notification-info">
            <h4>📧 Notificaciones de pedidos</h4>
            <p>Recibe emails sobre el estado de tus pedidos</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationSettings.email_orders}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                email_orders: e.target.checked
              })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>🎯 Promociones y ofertas</h4>
            <p>Recibe información sobre descuentos y productos nuevos</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationSettings.email_promotions}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                email_promotions: e.target.checked
              })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>🔒 Alertas de seguridad</h4>
            <p>Notificaciones importantes sobre tu cuenta</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationSettings.email_security}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                email_security: e.target.checked
              })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="notification-item">
          <div className="notification-info">
            <h4>🔔 Notificaciones push</h4>
            <p>Alertas en tiempo real en tu navegador</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationSettings.push_notifications}
              onChange={(e) => setNotificationSettings({
                ...notificationSettings,
                push_notifications: e.target.checked
              })}
            />
            <span className="slider"></span>
          </label>
        </div>

        <button 
          onClick={handleNotificationUpdate}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProducts = () => {
    navigate('/products');
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div className="header-content">
          <button className="back-btn" onClick={handleGoToDashboard}>
            ← Volver al Inicio
          </button>
          <h1>⚙️ Configuración</h1>
          <div className="header-actions">
            <button className="theme-btn" onClick={onThemeToggle}>
              {themeInfo.icon} {themeInfo.text}
            </button>
            <button className="logout-btn" onClick={onLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              👤 Perfil
            </button>
            <button
              className={`nav-item ${activeSection === 'password' ? 'active' : ''}`}
              onClick={() => setActiveSection('password')}
            >
              🔒 Contraseña
            </button>
            <button
              className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              🔔 Notificaciones
            </button>
          </nav>
        </aside>

        <main className="settings-main">
          {activeSection === 'profile' && renderProfileSection()}
          {activeSection === 'password' && renderPasswordSection()}
          {activeSection === 'notifications' && renderNotificationsSection()}
          {activeSection === 'theme' && (
            <div className="settings-content">
              <h3>Apariencia</h3>
              <div className="theme-settings">
                <p>Selecciona el tema de la aplicación:</p>
                <button className="theme-option-btn" onClick={onThemeToggle}>
                  {themeInfo.icon} {themeInfo.text}
                </button>
                <p className="theme-description">
                  Puedes alternar entre: Automático (sigue el sistema) → Claro → Oscuro
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;