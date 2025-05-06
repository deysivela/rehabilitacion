import React, { useState } from 'react';  
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaUserAlt } from 'react-icons/fa';  // Usando FaUserAlt
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        Usuario: username,
        Pass: password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('rol', response.data.rol);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <div className="login-logo-section">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          <h2>¡Bienvenido al Sistema del Centro de Rehabilitación Llallagua!</h2>
          <p>Tu bienestar es nuestra prioridad.</p>
        </div>
        <form className="login-form-section" onSubmit={handleLogin}>
          <div className="user-icon-container">  {/* Icono de usuario */}
            <FaUserAlt className="user-icon" />
          </div>
          <h3>Iniciar Sesión</h3>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="toggle-pass" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
