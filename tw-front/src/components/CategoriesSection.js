import React, { useState, useEffect } from "react";
import CategoryModal from "./CategoryModal";
import { categoryService } from "../services/categoryService";

const CategoriesSection = ({ categories, setCategories }) => {
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Cargar categorías automáticamente
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await categoryService.create(categoryData);
      if (response.ok) {
        loadCategories();
        setShowCreateCategoryModal(false);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleEditCategory = async (categoryId, categoryData) => {
    try {
      const response = await categoryService.update(categoryId, categoryData);
      if (response.ok) {
        loadCategories();
        setShowEditCategoryModal(false);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await categoryService.delete(categoryId);
      if (response.ok) {
        loadCategories();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <h1>🏷️ Gestión de Categorías</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateCategoryModal(true)}
        >
          + Agregar Categoría
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>#{category.id}</td>
                <td>{category.nombre}</td>
                <td>{category.descripcion}</td>
                <td>0</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowEditCategoryModal(true);
                      }}
                      title="Editar categoría"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCategory(category.id)}
                      title="Eliminar categoría"
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

      {/* Modal para crear categoría */}
      {showCreateCategoryModal && (
        <CategoryModal
          category={null}
          onSave={handleCreateCategory}
          onClose={() => setShowCreateCategoryModal(false)}
        />
      )}

      {/* Modal para editar categoría */}
      {showEditCategoryModal && editingCategory && (
        <CategoryModal
          category={editingCategory}
          onSave={(data) => handleEditCategory(editingCategory.id, data)}
          onClose={() => {
            setShowEditCategoryModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default CategoriesSection;