import React, { useState, useEffect } from 'react';
import { Edit, Trash2, ArrowLeft, Plus, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    vacation_days: 0,
    role: 'employee'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (retry = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar usuarios');
      }

      setUsers(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);

      if (!retry) {
        setTimeout(() => fetchUsers(true), 2000);
      } else {
        alert('Error al conectar con el servidor. Intenta recargar la página.');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditedUser({ ...user });
    setSelectedUser(user);
    setIsAddingUser(false);
  };

  const handleDeleteClick = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/delete-user/${userId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || 'Error al eliminar usuario');
          throw new Error(data.message);
        }

        alert(data.message);
        fetchUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/update-user/${editedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });
      if (!response.ok) throw new Error('Error al actualizar usuario');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error('Error al agregar usuario');
      fetchUsers();
      setNewUser({ name: '', email: '', password: '', vacation_days: 0, role: 'employee' });
      setIsAddingUser(false);
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Encabezado con botón y título */}
        <div className="flex items-center mb-6 gap-4">
          <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition flex-shrink-0"
          >
            <svg
                className="w-5 h-5 mx-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        </div>

        {/* Tabla de usuarios */}
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex justify-between items-center bg-requena-red p-4">
            <h2 className="text-xl font-semibold text-white">Lista de Usuarios</h2>
            <button
                onClick={() => {
                  setIsAddingUser(true);
                  setSelectedUser(null);
                }}
                className="bg-white text-requena-red px-4 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Agregar Usuario
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-red-50">
            <tr>
              <th className="p-3 text-left text-requena-red">Nombre</th>
              <th className="p-3 text-left text-requena-red">Correo</th>
              <th className="p-3 text-left text-requena-red">Rol</th>
              <th className="p-3 text-left text-requena-red">Vacaciones</th>
              <th className="p-3 text-left text-requena-red">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user, index) => (
                <tr
                    key={user.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="p-3 text-gray-700 border-b border-gray-200">{user.name}</td>
                  <td className="p-3 text-gray-700 border-b border-gray-200">{user.email}</td>
                  <td className="p-3 text-gray-700 border-b border-gray-200">{user.role}</td>
                  <td className="p-3 text-gray-700 border-b border-gray-200 text-center">{user.vacation_days}</td>
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex gap-2">
                      <button
                          onClick={() => handleEditClick(user)}
                          className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Formulario de Edición */}
        {selectedUser && (
            <div className="mt-6 w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Editar Usuario</h3>
              <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <input
                    type="email"
                    placeholder="Correo"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <input
                    type="number"
                    placeholder="Días de Vacaciones"
                    value={editedUser.vacation_days}
                    onChange={(e) => setEditedUser({ ...editedUser, vacation_days: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <select
                    value={editedUser.role}
                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
                <div className="flex gap-2">
                  <button
                      onClick={handleSaveChanges}
                      className="bg-requena-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={16} /> Guardar Cambios
                  </button>
                  <button
                      onClick={() => setSelectedUser(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Formulario de Agregar Usuario */}
        {isAddingUser && (
            <div className="mt-6 w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Agregar Usuario</h3>
              <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <input
                    type="email"
                    placeholder="Correo"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <input
                    type="number"
                    placeholder="Días de Vacaciones"
                    value={newUser.vacation_days}
                    onChange={(e) => setNewUser({ ...newUser, vacation_days: Number(e.target.value) })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-requena-red"
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
                <div className="flex gap-2">
                  <button
                      onClick={handleAddUser}
                      className="bg-requena-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} /> Agregar
                  </button>
                  <button
                      onClick={() => setIsAddingUser(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X size={16} /> Cancelar
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminUsers;