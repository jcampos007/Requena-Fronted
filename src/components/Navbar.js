import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ background: '#333', padding: '1rem' }}>
      <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Inicio</Link>
      <Link to="/login" style={{ color: '#fff' }}>Login</Link>
    </nav>
  );
};

export default Navbar;