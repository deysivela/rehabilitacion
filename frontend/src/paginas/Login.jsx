import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

      // Log para verificar la respuesta
      console.log('Respuesta del backend:', response.data);

      // Guardar el token y el rol en localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('rol', response.data.rol);

      // Redirigir al inicio
      navigate('/');
    } catch (err) {
      console.error('Error en el login:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
