const express = require('express');
const router = express.Router();
const { Paciente, Discapacidad } = require('../modelos');
const ValidarPac = require('../validacion/ValidarPac');

// Crear paciente
router.post('/registrar', ValidarPac, async (req, res) => {
  try {
    const paciente = await Paciente.create({
      Nombre_pac: req.body.Nombre_pac,
      Appaterno_pac: req.body.Appaterno_pac,
      Apmaterno_pac: req.body.Apmaterno_pac,
      Fnaci_pac: req.body.Fnaci_pac,
      Genero_pac: req.body.Genero_pac,
      Ci_pac: req.body.Ci_pac,
      Telefono_pac: req.body.Telefono_pac,
      Direccion_pac: req.body.Direccion_pac,
      Seguro: req.body.Seguro,
      Tienediscapacidad: req.body.Tienediscapacidad,
      Diagnostico: req.body.Diagnostico,
      Iddisc: req.body.Iddisc
    });
    res.status(201).json({ paciente });
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});

// Buscar paciente por CI
router.get('/buscar', async (req, res) => {
  const { ci } = req.query;

  if (!ci) {
    return res.status(400).json({ mensaje: 'CI requerido' });
  }

  try {
    const paciente = await Paciente.findOne({ where: { Ci_pac: ci } }); 
    if (paciente) {
      return res.json({ 
        Idpac: paciente.Idpac,
        Nombre_pac: paciente.Nombre_pac,
        Appaterno_pac: paciente.Appaterno_pac,
        Apmaterno_pac: paciente.Apmaterno_pac,
      });
    } else {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Listar todos los pacientes
router.get('/listar', async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({
      include: {
        model: Discapacidad,
        as: 'detalleDiscapacidad',
        required: false
      },
      raw: true,
      nest: true
    });

    const pacientesModificados = pacientes.map(paciente => {
      return {
        ...paciente,
        Tienediscapacidad: paciente.Tienediscapacidad ? 'Sí' : 'No'
      };
    });

    res.json(pacientesModificados);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener la lista de pacientes',
      error: error.message 
    });
  }
});

// Obtener paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await Paciente.findOne({
      where: { Idpac: id },
      include: {
        model: Discapacidad,
        as: 'detalleDiscapacidad',
        required: false
      }
    });

    if (!paciente) {
      return res.status(404).json({ 
        success: false,
        message: 'Paciente no encontrado' 
      });
    }

    const response = {
      success: true,
      data: {
        ...paciente.get({ plain: true }),
        detalleDiscapacidad: paciente.detalleDiscapacidad || null
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener paciente'
    });
  }
});

// Diagnósticos del paciente (esta ruta parece tener un error con 'db' no definido)
router.get('/paciente/:idpac', async (req, res) => {
  const { idpac } = req.params;
  try {
    res.status(501).json({ message: 'Esta funcionalidad no está implementada' });
  } catch (error) {
    res.status(500).send("Error interno del servidor");
  }
});

// ACTUALIZAR PACIENTE - SOLO UNA RUTA PUT
router.put('/editar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Nombre_pac, Appaterno_pac, Apmaterno_pac, Fnaci_pac, Genero_pac,
      Ci_pac, Telefono_pac, Direccion_pac, Seguro, Diagnostico,
      Tienediscapacidad, Tipo_disc, Grado_disc, Obs, Iddisc
    } = req.body;

    const paciente = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });

    if (!Nombre_pac || !Fnaci_pac || !Genero_pac || !Ci_pac) {
      return res.status(400).json({ error: 'Campos obligatorios del paciente faltantes' });
    }

    // Actualizar datos básicos del paciente
    await paciente.update({ 
      Nombre_pac, Appaterno_pac, Apmaterno_pac, Fnaci_pac, Genero_pac, 
      Ci_pac, Telefono_pac, Direccion_pac, Seguro, Diagnostico 
    });

    const tieneDisc = Tienediscapacidad === "true" || Tienediscapacidad === true;

    if (tieneDisc) {
      // Validar que los campos de discapacidad estén presentes
      if (!Tipo_disc || !Grado_disc) {
        return res.status(400).json({ 
          error: 'Cuando el paciente tiene discapacidad, Tipo y Grado son obligatorios' 
        });
      }

      if (paciente.detalleDiscapacidad) {
        // Actualizar discapacidad existente
        await paciente.detalleDiscapacidad.update({ 
          Tipo_disc, 
          Grado_disc, 
          Obs: Obs || "" 
        });
      } else {
        // Crear nueva discapacidad solo si no existe
        const nuevaDiscapacidad = await Discapacidad.create({ 
          Tipo_disc, 
          Grado_disc, 
          Obs: Obs || "" 
        });
        await paciente.update({ Iddisc: nuevaDiscapacidad.Iddisc });
      }
      await paciente.update({ Tienediscapacidad: 1 });
    } else {
      // PACIENTE SIN DISCAPACIDAD
      if (paciente.detalleDiscapacidad) {
        // Desvincular primero
        await paciente.update({
          Iddisc: null,
          Tienediscapacidad: 0
        });
    
        // Ahora sí eliminar la discapacidad
        await paciente.detalleDiscapacidad.destroy();
      } else {
        await paciente.update({ 
          Iddisc: null,
          Tienediscapacidad: 0 
        });
      }
    }
    

    const pacienteActualizado = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    res.json({
      success: true,
      message: 'Paciente actualizado correctamente',
      data: pacienteActualizado
    });

  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.errors ? error.errors.map(err => err.message) : []
    });
  }
});
module.exports = router;