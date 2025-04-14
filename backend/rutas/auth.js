const express = require('express');
const bcrypt = require('bcrypt'); // Para comparar contraseñas encriptadas
const jwt = require('jsonwebtoken'); // Para generar tokens de sesión
const Usuario = require('../modelos/usuario'); 

const router = express.Router();

// Clave secreta para el token (idealmente almacenada en una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { Usuario: username, Pass: password } = req.body;

  try {
    // Verificar que se envíen los datos requeridos
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    }
    const user = await Usuario.findOne({ where: { Usuario: username, Activo: true } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.Pass);// Comparar contraseñas
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    // Generar un token de sesión
    const token = jwt.sign(
      { id: user.Iduser, rol: user.Rol }, // Datos que incluirá el token
      JWT_SECRET, // Clave secreta
      { expiresIn: '1h' } // Duración del token
    );

    // Respuesta exitosa con el token
    res.json({ message: 'Inicio de sesión exitoso', token, rol: user.Rol });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;

