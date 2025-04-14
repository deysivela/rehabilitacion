const express = require('express');
const bcrypt = require('bcrypt'); // Para hashear contraseñas
const Usuario = require('../modelos/usuario'); // Modelo de la tabla Usuario
const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/crear', async (req, res) => {
  const { Usuario: username, Pass: password, Rol, Activo } = req.body;  

  try {
    // Validar datos básicos
    if (!username || !password || !Rol) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { Usuario: username } });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      Usuario: username,
      Pass: hashedPassword,
      Rol,
      Activo: Activo ?? true, // Por defecto, el usuario estará activo
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
});

module.exports = router;
