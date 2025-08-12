import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/components/Cart.css";

const Cart = ({ onThemeToggle, themeInfo }) => {
  const navigate = useNavigate();
  
  // Funciones de navegación
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProducts = () => {
    navigate('/products');
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingCheckout, setProcessingCheckout] = useState(false);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("No hay token de acceso. Por favor, inicia sesión.");
      }

      const response = await fetch("http://localhost:8000/api/market/model/cart/", {
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
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCartData(data);
      
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error.message || "Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(cartItemId);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`http://localhost:8000/api/market/model/cart-items/${cartItemId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad: newQuantity }),
      });

      if (response.ok) {
        fetchCartData(); // Recargar carrito
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Error al actualizar cantidad";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error de conexión al actualizar la cantidad");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(`http://localhost:8000/api/market/model/cart-items/${cartItemId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        fetchCartData(); // Recargar carrito
        
        if (result.mensaje) {
          alert(result.mensaje);
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Error al eliminar producto";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error de conexión al eliminar el producto");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/market/model/cart/clear/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCartData(); // Recargar carrito
        alert("Carrito vaciado");
      } else {
        throw new Error("Error al vaciar carrito");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Error al vaciar el carrito");
    }
  };

  const proceedToCheckout = async () => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setProcessingCheckout(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch("http://localhost:8000/api/market/model/cart/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`¡Pedido creado exitosamente! ID: ${result.pedido_id}`);
        fetchCartData(); // Recargar carrito (debería estar vacío)
        navigate('/orders');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el pedido");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Error al procesar el pedido: " + error.message);
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Extraer datos del carrito con validaciones
  const cartItems = cartData?.items || [];
  const subtotal = cartData?.total || 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="cart-container">
      {/* Header de navegación */}
      <header className="cart-nav-header">
        <div className="nav-content">
          <button className="back-btn" onClick={handleGoToProducts}>
            ← Volver a Productos
          </button>
          <h1>🛒 Mi Carrito</h1>
          <div className="nav-actions">
            <button className="nav-btn" onClick={handleGoToDashboard}>
              🏠 Inicio
            </button>
            <button className="nav-btn" onClick={handleGoToOrders}>
              📦 Pedidos
            </button>
          </div>
        </div>
      </header>

      <div className="cart-content">
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button onClick={fetchCartData} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>¡Agrega algunos productos para comenzar!</p>
            <button 
              className="shop-now-btn" 
              onClick={handleGoToProducts}
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Lista de productos */}
            <div className="cart-items-section">
              <div className="cart-header">
                <h2>Productos en tu carrito ({cartItems.length})</h2>
                <button 
                  className="clear-cart-btn" 
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </button>
              </div>

              <div className="cart-items">
                {cartItems.map((item) => {
                  const productName = item.producto_nombre || "Producto sin nombre";
                  const productDescription = item.producto_descripcion || "Sin descripción";
                  const categoryName = item.categoria_nombre || "Sin categoría";
                  const productPrice = item.precio_unitario || 0;
                  const productImage = item.producto_imagen_url || null;
                  const quantity = item.cantidad || 1;
                  const itemId = item.id;

                  return (
                    <div key={itemId} className="cart-item">
                      <div className="item-image">
                        {productImage ? (
                          <img src={productImage} alt={productName} />
                        ) : (
                          <div className="placeholder-image">📦</div>
                        )}
                      </div>

                      <div className="item-info">
                        <h3>{productName}</h3>
                        <p className="item-description">{productDescription}</p>
                        <div className="item-category">
                          <span className="category-tag">
                            🏷️ {categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="item-price">
                        <span className="unit-price">${productPrice}</span>
                        <span className="price-label">c/u</span>
                      </div>

                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(itemId, quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(itemId, quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="item-total">
                        <span className="total-price">
                          ${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : (productPrice * quantity).toFixed(2)}
                        </span>
                      </div>

                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(itemId)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="order-summary">
              <div className="summary-card">
                <h3>Resumen del Pedido</h3>
                
                <div className="summary-line">
                  <span>Subtotal ({cartItems.length} productos)</span>
                  <span>${subtotal}</span>
                </div>
                
                <div className="summary-line">
                  <span>Envío</span>
                  <span>{shipping === 0 ? "GRATIS" : `$${shipping.toFixed(2)}`}</span>
                </div>
                
                {shipping === 0 && (
                  <div className="free-shipping-notice">
                    🎉 ¡Envío gratis por compras mayores a $50!
                  </div>
                )}
                
                <div className="summary-divider"></div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button 
                  className="checkout-btn"
                  onClick={proceedToCheckout}
                  disabled={processingCheckout}
                >
                  {processingCheckout ? (
                    <>
                      <div className="btn-spinner"></div>
                      Procesando...
                    </>
                  ) : (
                    "Proceder al Checkout"
                  )}
                </button>

                <div className="payment-info">
                  <p>💳 Aceptamos todas las tarjetas</p>
                  <p>🔒 Compra 100% segura</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;