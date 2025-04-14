import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/login'); // Redirige al login si no hay usuario
    }
  }, [navigate]);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Si el usuario no ha cargado, mostrar mensaje de carga
  if (!user) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Título principal */}
      <h1 style={styles.title}>Panel de Administración</h1>

      {/* Mensaje de bienvenida */}
      <h2 style={styles.subtitle}>Bienvenido, {user.name}</h2>

      {/* Botones principales */}
      <div style={styles.content}>
        <button style={styles.button} onClick={() => navigate('/admin/users')}>
          Gestión de Usuarios
        </button>
        <button style={styles.button} onClick={() => navigate('/admin/checkins')}>
          Gestión de Entradas y Salidas
        </button>
        <button
            style={styles.button}
            onClick={() => navigate('/admin/vacations')}
            className="relative"
        >
          Gestión de Vacaciones
      
        </button>
      </div>

      {/* Botón de cerrar sesión en la parte inferior */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

// 🎨 Estilos para diseño minimalista
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#F5F5F7', // Color de fondo estilo Apple
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1D1D1F', // Gris oscuro Apple
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: 'normal',
    color: '#333',
    marginBottom: '30px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#007AFF', // Azul Apple
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
    width: '250px',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: '50px',
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#D32F2F', // Rojo oscuro
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
    width: '250px',
    textAlign: 'center',
  },
  loading: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#555',
  },
};

export default AdminDashboard;