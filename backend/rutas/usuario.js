const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../modelos/usuario');

// Listar usuarios
router.get('/listar', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    console.error('Error al listar usuarios:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// Ruta para crear un nuevo usuario
router.post('/crear', async (req, res) => {
  const { Usuario: username, Pass: password, Rol, Activo, Idprof } = req.body;  // 👈 Incluido Idprof

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
      Activo: Activo ?? true,
      Idprof: Idprof || null  // 👈 Incluido en la creación
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
});


// Actualizar usuario
router.put('/actualizar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Usuario: username, Pass, Rol, Activo, Idprof } = req.body;
    const data = { Usuario: username, Rol, Activo, Idprof: Idprof || null };
    if (Pass) {
      data.Pass = await bcrypt.hash(Pass, 10);
    }
    await Usuario.update(data, { where: { Iduser: id } });
    const updated = await Usuario.findByPk(id);
    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Ver un usuario por ID (incluye contraseña encriptada)
router.get('/ver/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario); // Aquí se incluye el campo `Pass`
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario', error });
  }
});

module.exports = router;
