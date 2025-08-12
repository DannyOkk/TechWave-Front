import React, { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import { productService } from "../services/productService";

const ProductsSection = ({ products, setProducts, categories }) => {
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const handleCreateProduct = async (productData) => {
    try {
      const response = await productService.create(productData);
      if (response.ok) {
        loadProducts();
        setShowCreateProductModal(false);
      } else {
        const errorData = await response.json();
        console.error("Error al crear producto:", errorData);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Edit product
  const handleEditProduct = async (productId, productData) => {
    try {
      const response = await productService.update(productId, productData);
      if (response.ok) {
        loadProducts();
        setShowEditProductModal(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      const response = await productService.delete(productId);
      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Cargar productos automáticamente al montar el componente
  useEffect(() => {
    loadProducts();
  }, []); // Se ejecuta una vez al montar el componente

  return (
    <div className="section-content">
      <div className="section-header">
        <h1>📦 Gestión de Productos</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateProductModal(true)}
        >
          + Agregar Producto
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>#{product.id}</td>
                <td>{product.nombre}</td>
                <td>{product.categoria?.nombre || 'Sin categoría'}</td>
                <td>${product.precio}</td>
                <td>{product.stock}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowEditProductModal(true);
                      }}
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear producto */}
      {showCreateProductModal && (
        <ProductModal
          product={null}
          categories={categories}
          onSave={handleCreateProduct}
          onClose={() => setShowCreateProductModal(false)}
        />
      )}

      {/* Modal para editar producto */}
      {showEditProductModal && editingProduct && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={(data) => handleEditProduct(editingProduct.id, data)}
          onClose={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsSection;