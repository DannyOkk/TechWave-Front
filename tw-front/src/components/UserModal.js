import React, { useState, useEffect } from 'react';

const UserModal = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    phone: '',
    role: 'client',
    is_active: true,
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      // Editando usuario existente
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        address: user.address || '',
        phone: user.phone || '',
        role: user.role || 'client',
        is_active: user.is_active ?? true,
        password: '' // No mostrar contraseña existente
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validaciones básicas
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    if (!user && !formData.password.trim()) newErrors.password = 'Contraseña es requerida para usuarios nuevos';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Preparar datos para enviar
    const dataToSend = { ...formData };
    
    // Si es edición y no se cambió la contraseña, no enviarla
    if (user && !dataToSend.password.trim()) {
      delete dataToSend.password;
    }

    const success = await onSave(dataToSend);
    
    if (success) {
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-modal">
        <div className="modal-header">
          <h3>{user ? '✏️ Editar Usuario' : '➕ Crear Usuario'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className={errors.username ? 'error' : ''}
                required
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rol *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="client">👤 Cliente</option>
                <option value="operator">⚙️ Operador</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
              >
                <option value="true">✅ Activo</option>
                <option value="false">❌ Inactivo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;