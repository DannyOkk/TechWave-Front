import React, { useState, useEffect } from "react";

const CategoryModal = ({ category, onSave, onClose }) => {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    if (category) {
      setForm({
        nombre: category.nombre,
        descripcion: category.descripcion || "",
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{category ? "✏️ Editar Categoría" : "➕ Nueva Categoría"}</h3>
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

export default CategoryModal;