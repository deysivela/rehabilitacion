const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, ProfSalud } = require('../modelos');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto';

router.post('/login', async (req, res) => {
  const { Usuario: username, Pass: password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    }

    const user = await Usuario.findOne({
      where: { Usuario: username },
      include: [{
        model: ProfSalud,
        as: 'profesional',
        attributes: ['Idprof', 'Nombre_prof', 'Appaterno_prof', 'Apmaterno_prof']
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.Activo) {
      return res.status(403).json({ message: 'Usuario inactivo. Comuníquese con el encargado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Pass);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales incorrecta' });
    }

    let idprof = null;
    let nombreCompleto = '';

    if (user.profesional) {
      const { Idprof, Nombre_prof, Appaterno_prof, Apmaterno_prof } = user.profesional;
      idprof = Idprof;
      nombreCompleto = `${Nombre_prof} ${Appaterno_prof} ${Apmaterno_prof}`;
    }

    // Crear token con iduser, rol y idprof en el payload
    const token = jwt.sign(
      { id: user.Iduser, rol: user.Rol, idprof: idprof },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      rol: user.Rol,
      nombre: nombreCompleto,
      id: user.Iduser,
      Idprof: idprof
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;
