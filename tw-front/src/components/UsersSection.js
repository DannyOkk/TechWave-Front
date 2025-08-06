import React, { useState, useEffect } from "react";
import UserModal from "./UserModal";
import { userService } from "../services/userService";

const UsersSection = ({ users, setUsers }) => {
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Cargar usuarios automáticamente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await userService.create(userData);
      if (response.ok) {
        loadUsers();
        setShowCreateUserModal(false);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Error al crear usuario:", errorData);
        return false;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
  };

  const handleEditUser = async (userId, updatedData) => {
    try {
      const response = await userService.update(userId, updatedData);
      if (response.ok) {
        loadUsers();
        setShowEditUserModal(false);
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar usuario:", errorData);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    try {
      const response = await userService.delete(userId);
      if (response.ok) {
        loadUsers();
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar usuario:", errorData);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Función para filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesRole = !userRoleFilter || user.role === userRoleFilter;
    const matchesStatus = !userStatusFilter || user.is_active.toString() === userStatusFilter;
    const matchesSearch = !userSearchTerm || 
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase()));
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  return (
    <div className="section-content">
      <div className="section-header">
        <h1>👥 Gestión de Usuarios</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateUserModal(true)}
        >
          + Agregar Usuario
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <select 
            className="filter-select"
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="operator">Operadores</option>
            <option value="client">Clientes</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select"
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="search-input"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Nombre Completo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' && '👑 Admin'}
                    {user.role === 'operator' && '⚙️ Operador'}
                    {user.role === 'client' && '👤 Cliente'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'status-activo' : 'status-inactivo'}`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{new Date(user.register_date).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => openEditUserModal(user)}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      title="Eliminar usuario"
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

      {/* Modal para crear usuario */}
      {showCreateUserModal && (
        <UserModal
          user={null}
          onSave={handleCreateUser}
          onClose={() => setShowCreateUserModal(false)}
        />
      )}

      {/* Modal para editar usuario */}
      {showEditUserModal && editingUser && (
        <UserModal
          user={editingUser}
          onSave={(userData) => handleEditUser(editingUser.id, userData)}
          onClose={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersSection;