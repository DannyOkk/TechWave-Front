import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/components/Home.css"; // Actualizada la ruta

const Home = ({ 
  isPublic = true, 
  userRole, 
  userData, 
  onLogout, 
  onThemeToggle, 
  themeInfo 
}) => {
  const navigate = useNavigate();

  // ⭐ AGREGAR ESTAS VARIABLES QUE FALTAN:
  const [username, setUsername] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // ⭐ AGREGAR ESTAS FUNCIONES QUE FALTAN:
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  const handleAdminPanel = () => {
    setShowUserMenu(false);
    navigate('/admin');
  };

  const handleThemeToggle = () => {
    setShowUserMenu(false);
    onThemeToggle && onThemeToggle();
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout && onLogout();
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleNavigateToProducts = () => {
    navigate('/products');
  };

  const handleNavigateToCart = () => {
    navigate('/cart');
  };

  const handleNavigateToOrders = () => {
    navigate('/orders'); // Si tienes esta ruta
  };

  // ⭐ OBTENER EL USERNAME DEL USUARIO
  useEffect(() => {
    if (userData && userData.username) {
      setUsername(userData.username);
    }
  }, [userData]);

  useEffect(() => {
    // Solo cargar productos si el usuario está autenticado
    if (!isPublic) {
      fetchFeaturedProducts();
    } else {
      // Para usuarios no logueados, mostrar productos de ejemplo
      setProducts([
        { id: 1, name: "Smartphone Pro", price: "$899", image: "📱" },
        { id: 2, name: "Laptop Gaming", price: "$1299", image: "💻" },
        { id: 3, name: "Auriculares Wireless", price: "$199", image: "🎧" }
      ]);
      setLoading(false);
    }
  }, [isPublic]);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("No hay token de acceso");
      }

      const response = await fetch("http://localhost:8000/api/market/model/products/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Adaptar según la estructura de tu respuesta
      let productsList = [];
      if (Array.isArray(data)) {
        productsList = data.slice(0, 3); // Solo los primeros 3
      } else if (data.results && Array.isArray(data.results)) {
        productsList = data.results.slice(0, 3); // Si hay paginación
      }

      // Mapear los datos del backend al formato del frontend
      const mappedProducts = productsList.map(product => ({
        id: product.id,
        name: product.nombre,
        price: `$${product.precio}`,
        image: product.imagen_url || "📦",
        description: product.descripcion,
        stock: product.stock
      }));

      setProducts(mappedProducts);
      
    } catch (error) {
      console.error("Error al cargar productos:", error);
      // Mostrar productos de ejemplo si falla
      setProducts([
        { id: 1, name: "Error de conexión", price: "$0", image: "❌" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Detectar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🌐 TechWave</h1>
            <span className="tagline">Marketplace & Tech Solutions</span>
          </div>
          <nav className="main-nav">
            <a href="#products" onClick={(e) => { e.preventDefault(); handleNavigateToProducts(); }}>
              Productos
            </a>
            <a href="#orders" onClick={(e) => { e.preventDefault(); handleNavigateToOrders(); }}>
              Mis Pedidos
            </a>
            <a href="#cart" onClick={(e) => { e.preventDefault(); handleNavigateToCart(); }}>
              Carrito
            </a>
          </nav>
          <div className="user-section">
            {isPublic ? (
              <>
                <button className="login-btn" onClick={handleLoginClick}>
                  Iniciar sesión
                </button>
                <button
                  className="register-btn"
                  onClick={handleRegisterClick}
                  id="register-btn"
                  type="button"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                <span className="welcome-text">👋 Hola, {username}</span>
                <div className="user-menu-container" ref={menuRef}>
                  <button className={`hamburger-btn ${showUserMenu ? 'active' : ''}`} onClick={toggleUserMenu}>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown-menu">
                      <div className="menu-header">
                        <h3>👤 {username}</h3>
                      </div>
                      <div className="menu-content">
                        <div className="menu-item" onClick={handleSettings}>
                          <span className="menu-icon">⚙️</span>
                          <span>Configuración</span>
                          <span className="menu-arrow">›</span>
                        </div>
                        
                        {/* ⭐ BOTÓN ADMIN - Solo visible para admin/operador */}
                        {userRole === 'admin' || userRole === 'operator' ? (
                          <div className="menu-item admin-menu-item" onClick={handleAdminPanel}>
                            <span className="menu-icon">🔧</span>
                            <span>Panel Admin</span>
                            <span className="menu-arrow">›</span>
                          </div>
                        ) : null}
                        
                        <div className="menu-item" onClick={handleThemeToggle}>
                          <span className="menu-icon">{themeInfo.icon}</span>
                          <span>{themeInfo.text}</span>
                          <span className="menu-arrow">›</span>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-item logout-item" onClick={handleLogout}>
                          <span className="menu-icon">🚪</span>
                          <span>Cerrar sesión</span>
                          <span className="menu-arrow">›</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Bienvenido a TechWave</h2>
          <p>Descubre la mejor tecnología al mejor precio. Marketplace confiable con envíos seguros.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h3>¿Por qué elegir TechWave?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h4>Envío Rápido</h4>
            <p>Entrega en 24-48 horas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>Pago Seguro</h4>
            <p>Múltiples métodos de pago</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h4>Calidad Garantizada</h4>
            <p>Productos originales certificados</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <h4>Soporte 24/7</h4>
            <p>Atención al cliente siempre</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section" id="products">
        <h3>Productos Destacados</h3>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">{product.image}</div>
                <h4>{product.name}</h4>
                <p className="product-price">{product.price}</p>
                <button className="add-to-cart-btn">Agregar al Carrito</button>
              </div>
            ))}
          </div>
        )}
        <div className="view-all">
          <button 
            className="view-all-btn" 
            onClick={() => {
              if (isPublic) {
                // Si es público, redirigir al login
                handleLoginClick();
              } else {
                // Si está logueado, ir a productos
                handleNavigateToProducts();
              }
            }}
          >
            {isPublic ? "Iniciar Sesión para Ver Productos" : "Ver Todos los Productos"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>TechWave</h4>
            <p>Tu marketplace de tecnología confiable</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="#about">Acerca de</a></li>
              <li><a href="#contact">Contacto</a></li>
              <li><a href="#support">Soporte</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacidad</a></li>
              <li><a href="#terms">Términos</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 TechWave. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;