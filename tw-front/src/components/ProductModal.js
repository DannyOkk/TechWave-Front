import React, { useState, useEffect } from "react";

const ProductModal = ({ product, onSave, onClose, categories }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "", // <--- agrega esto
    categoria: "",
    precio: "",
    stock: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre,
        descripcion: product.descripcion || "", // <--- agrega esto
        categoria: product.categoria?.id || "",
        precio: product.precio,
        stock: product.stock,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      categoria: Number(form.categoria),
      precio: Number(form.precio),
      stock: Number(form.stock)
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? "✏️ Editar Producto" : "➕ Nuevo Producto"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción"
              required
            />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input
                name="precio"
                type="number"
                value={form.precio}
                onChange={handleChange}
                placeholder="Precio"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                required
                min="0"
                step="1"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;