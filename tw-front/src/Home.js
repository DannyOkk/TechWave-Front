import React, { useState, useEffect } from "react";
import "./Home.css";

const Home = ({ onLogout, onLoginClick, onRegisterClick, isPublic }) => {
  const username = localStorage.getItem("username");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos carga de productos destacados
    setTimeout(() => {
      setProducts([
        { id: 1, name: "Smartphone Pro", price: "$899", image: "📱" },
        { id: 2, name: "Laptop Gaming", price: "$1299", image: "💻" },
        { id: 3, name: "Auriculares Wireless", price: "$199", image: "🎧" },
        { id: 4, name: "Smart Watch", price: "$299", image: "⌚" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    onLogout();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🌐 TechWave</h1>
            <span className="tagline">Marketplace & Tech Solutions</span>
          </div>
          <nav className="main-nav">
            <a href="#products">Productos</a>
            <a href="#orders">Mis Pedidos</a>
            <a href="#cart">Carrito</a>
          </nav>
          <div className="user-section">
            {isPublic ? (
              <>
                <button className="logout-btn" onClick={onLoginClick}>
                  Iniciar sesión
                </button>
                <button
                  className="logout-btn"
                  style={{ background: "linear-gradient(90deg, #06b6d4 0%, #818cf8 100%)", marginLeft: "0.5rem" }}
                  onClick={onRegisterClick}
                  id="register-btn"
                  type="button"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <>
                <span className="welcome-text">👋 Hola, {username}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  Cerrar sesión
                </button>
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
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Productos</span>
            </div>
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Clientes</span>
            </div>
            <div className="stat">
              <span className="stat-number">99%</span>
              <span className="stat-label">Satisfacción</span>
            </div>
          </div>
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
          <button className="view-all-btn">Ver Todos los Productos</button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">📦</span>
            <span>Mis Pedidos</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🛒</span>
            <span>Mi Carrito</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">❤️</span>
            <span>Favoritos</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">👤</span>
            <span>Mi Perfil</span>
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