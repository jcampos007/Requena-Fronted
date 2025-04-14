import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo_RequenaAbogados.png';
import Background from '../19420.jpg';

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Inicio de sesión exitoso');
                localStorage.setItem('user', JSON.stringify(data.user));

                setTimeout(() => {
                    setLoading(false);
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else if (data.user.role === 'employee') {
                        navigate('/employee');
                    } else {
                        navigate('/home');
                    }
                }, 1500);
            } else {
                setLoading(false);
                setErrorMessage(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setLoading(false);
            setErrorMessage('No se pudo conectar con el servidor');
        }
    };

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundImage: `url(${Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '2rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    maxWidth: '400px',
                    width: '90%',
                }}
            >
                <img
                    src={Logo}
                    alt="Requena Abogados"
                    style={{
                        width: '200px',
                        marginBottom: '1.5rem',
                        display: 'block',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                />
                <h1 style={{ marginBottom: '1rem', color: '#333' }}>Iniciar Sesión</h1>

                {loading && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                margin: '0 auto',
                                border: '5px solid #ccc',
                                borderTop: '5px solid #D32F2F',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}
                        ></div>
                    </div>
                )}
                {errorMessage && <p style={{ color: '#D32F2F', fontWeight: 'bold', marginBottom: '1rem' }}>{errorMessage}</p>}
                {successMessage && <p style={{ color: '#388E3C', fontWeight: 'bold', marginBottom: '1rem' }}>{successMessage}</p>}

                <form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginBottom: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginBottom: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: loading ? '#B71C1C' : '#D32F2F',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.3s ease',
                        }}
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>

                <style>
                    {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
                </style>
            </div>
        </div>
    );
};

export default Login;