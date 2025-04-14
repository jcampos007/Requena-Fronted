import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleStart = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'employee') {
      navigate('/employee');
    } else {
      alert('No se pudo determinar el rol del usuario.');
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f8f9fa', // Fondo claro para profesionalismo
        height: '100vh', // Ocupa toda la pantalla
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '1rem', fontSize: '2.5rem', color: '#343a40' }}>
        Bienvenido a Requena Abogados
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#6c757d' }}>
        Sistema de administración de personal.
      </p>
      <button
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#007bff', // Azul profesional
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={handleStart}
      >
        Comenzar
      </button>
    </div>
  );
};

export default Home;