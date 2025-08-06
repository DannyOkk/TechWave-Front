import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import "../styles/components/Products.css";

const Products = ({ 
  onThemeToggle, 
  themeInfo
}) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetailLoading, setProductDetailLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [productDetailError, setProductDetailError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (productId) {
      fetchProductDetails(productId);
    } else {
      fetchCategories();
      fetchProducts();
    }
  }, [productId, navigate]);

  const fetchProductDetails = async (id) => {
    setProductDetailLoading(true);
    setProductDetailError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/market/model/products/${id}/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Producto no encontrado.");
        }
        throw new Error("Error al cargar los detalles del producto.");
      }
      const data = await response.json();
      setSelectedProduct(data);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDetailError(error.message);
    } finally {
      setProductDetailLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/market/model/categories/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      } else {
        console.error("Error al cargar categorías:", response.status);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async (filters = {}) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("No hay token de acceso. Por favor, inicia sesión.");
      }

      let url = "http://localhost:8000/api/market/model/products/";
      
      const params = new URLSearchParams();
      if (filters.nombre) params.append('nombre', filters.nombre);
      if (filters.precio_min) params.append('precio_min', filters.precio_min);
      if (filters.precio_max) params.append('precio_max', filters.precio_max);
      if (filters.categoria) params.append('categoria', filters.categoria);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setProducts(data.results || data);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts({ 
      nombre: searchTerm,
      precio_min: priceFilter.min,
      precio_max: priceFilter.max,
      categoria: selectedCategory
    });
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts({ 
      nombre: searchTerm,
      precio_min: priceFilter.min,
      precio_max: priceFilter.max,
      categoria: categoryId
    });
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/market/model/products/${productId}/add_to_cart/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ cantidad: 1 }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar al carrito");
      }

      const result = await response.json();
      alert(result.mensaje || "Producto agregado al carrito!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error al agregar al carrito");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter({ min: "", max: "" });
    setSelectedCategory("");
    fetchProducts();
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_data");
    navigate('/');
  };

  if (productId) {
    if (productDetailLoading) {
      return (
        <div className="products-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando detalle del producto...</p>
          </div>
        </div>
      );
    }

    if (productDetailError) {
      return (
        <div className="products-container">
          <div className="error-message">
            <p>⚠️ {productDetailError}</p>
            <Link to="/products" className="back-btn" style={{marginTop: '20px'}}>
              Volver al listado
            </Link>
          </div>
        </div>
      );
    }

    if (!selectedProduct) {
      return (
        <div className="products-container">
          <div className="no-products">
            <p>📭 Producto no encontrado.</p>
            <Link to="/products" className="back-btn" style={{marginTop: '20px'}}>
              Volver al listado
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="product-detail-container">
        <header className="products-nav-header">
          <div className="nav-content">
            <Link to="/products" className="back-btn">
              ← Volver al Listado
            </Link>
            <h1>{selectedProduct.nombre}</h1>
            <div className="nav-actions">
              <button className="nav-btn" onClick={handleGoToCart}>
                🛒 Carrito
              </button>
            </div>
          </div>
        </header>

        <main className="product-detail-content">
          <div className="product-detail-image-container">
            {selectedProduct.imagen_url ? (
              <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} className="product-detail-image" />
            ) : (
              <div className="placeholder-image large">📦</div>
            )}
          </div>
          <div className="product-detail-info">
            <p className="product-detail-description">{selectedProduct.descripcion}</p>
            <div className="product-detail-meta">
              <span className="category-tag">
                🏷️ {selectedProduct.categoria.nombre}
              </span>
              <span className="product-detail-stock">Stock: {selectedProduct.stock}</span>
            </div>
            <div className="product-detail-buy-section">
              <span className="product-detail-price">${selectedProduct.precio}</span>
              <button 
                className="add-cart-btn large"
                onClick={() => handleAddToCart(selectedProduct.id)}
                disabled={selectedProduct.stock === 0}
              >
                {selectedProduct.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="products-container">
      <header className="products-nav-header">
        <div className="nav-content">
          <button className="back-btn" onClick={handleGoToDashboard}>
            ← Volver al Inicio
          </button>
          <h1>🛍️ Productos</h1>
          <div className="nav-actions">
            <button className="nav-btn" onClick={handleGoToCart}>
              🛒 Carrito
            </button>
            <button className="nav-btn" onClick={() => navigate('/orders')}>
              📦 Pedidos
            </button>
          </div>
        </div>
      </header>

      <header className="products-header">
        <h1>🛍️ Productos</h1>
        <p>Descubre nuestra amplia gama de productos tecnológicos</p>
      </header>

      <section className="categories-section">
        <h3>Categorías</h3>
        <div className="categories-container">
          {categoriesLoading ? (
            <div className="categories-loading">Cargando categorías...</div>
          ) : (
            <div className="categories-grid">
              <button 
                className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
                onClick={() => handleCategoryFilter("")}
              >
                <span className="category-icon">📦</span>
                <span>Todas</span>
              </button>
              {categories.map((category) => (
                <button 
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id.toString() ? "active" : ""}`}
                  onClick={() => handleCategoryFilter(category.id.toString())}
                >
                  <span className="category-icon">🏷️</span>
                  <span>{category.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍 Buscar
            </button>
          </div>
          
          <div className="filters-row">
            <div className="price-filters">
              <input
                type="number"
                placeholder="Precio mín"
                value={priceFilter.min}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                className="price-input"
              />
              <input
                type="number"
                placeholder="Precio máx"
                value={priceFilter.max}
                onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                className="price-input"
              />
            </div>
            
            <div className="category-select-container">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="category-select"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <button type="button" onClick={clearFilters} className="clear-btn">
              Limpiar Filtros
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={() => fetchProducts()} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : (
        <section className="products-section">
          <div className="products-stats">
            <p>
              {products.length} productos encontrados
              {selectedCategory && (
                <span className="category-filter-active">
                  {" "} en "{categories.find(c => c.id.toString() === selectedCategory)?.nombre}"
                </span>
              )}
            </p>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.imagen_url ? (
                    <img src={product.imagen_url} alt={product.nombre} />
                  ) : (
                    <div className="placeholder-image">📦</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.nombre}</h3>
                  <p className="product-description">{product.descripcion}</p>
                  <div className="product-category">
                    <span className="category-tag">
                      🏷️ {product.categoria.nombre}
                    </span>
                  </div>
                  <div className="product-details">
                    <span className="product-price">${product.precio}</span>
                    <span className="product-stock">Stock: {product.stock}</span>
                  </div>
                </div>

                <div className="product-actions">
                  <Link to={`/products/${product.id}`} className="view-btn">
                    Ver Detalles
                  </Link>
                  <button 
                    className="add-cart-btn"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div className="no-products">
              <p>📭 No se encontraron productos</p>
              <button onClick={clearFilters} className="clear-btn">
                Ver todos los productos
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Products;