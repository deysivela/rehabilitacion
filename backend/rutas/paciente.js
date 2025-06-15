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
    console.error("❌ Error al registrar paciente:", error);
    res.status(400).json({ error: error.message });
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
      return res.json({ Idpac: paciente.Idpac });
    } else {
      return res.status(404).json({ mensaje: 'Paciente no encontrado' });
    }
  } catch (error) {
    console.error('Error al buscar paciente:', error);
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
      }
    });

    const pacientesModificados = pacientes.map(paciente => {
      paciente.Tienediscapacidad = paciente.Tienediscapacidad ? 'Sí' : 'No';
      return paciente;
    });

    res.json(pacientesModificados);
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener paciente por ID (this is the route you're trying to access)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de paciente inválido' 
      });
    }

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
        discapacidades: paciente.detalleDiscapacidad 
          ? [paciente.detalleDiscapacidad]
          : []
      }
    };
    res.json(response);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener paciente',
      error: error.message 
    });
  }
});

// Diagnósticos del paciente
router.get('/paciente/:idpac', async (req, res) => {
  const { idpac } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM diagnostico WHERE idpac = ?', [idpac]);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener diagnósticos del paciente:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Editar paciente
router.put('/editar/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      Nombre_pac,
      Appaterno_pac,
      Apmaterno_pac,
      Fnaci_pac,
      Genero_pac,
      Ci_pac,
      Telefono_pac,
      Direccion_pac,
      Seguro,
      Diagnostico,
      Tienediscapacidad,
      Tipo_disc,
      Grado_disc,
      Obs
    } = req.body;

    const paciente = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const tieneDisc = Tienediscapacidad === "true" || Tienediscapacidad === true;
  
    await paciente.update({
      Nombre_pac,
      Appaterno_pac,
      Apmaterno_pac,
      Fnaci_pac,
      Genero_pac,
      Ci_pac,
      Telefono_pac,
      Direccion_pac,
      Seguro,
      Diagnostico
    });

    if (tieneDisc) {
      if (paciente.Iddisc) {
        const discapacidadExistente = await Discapacidad.findByPk(paciente.Iddisc);
        if (discapacidadExistente) {
          await discapacidadExistente.update({ Tipo_disc, Grado_disc, Obs });
        } else {
          return res.status(404).json({ error: 'Discapacidad no encontrada para actualizar' });
        }
        await paciente.update({ Tienediscapacidad: 1 });
      } else {
        const nuevaDiscapacidad = await Discapacidad.create({ Tipo_disc, Grado_disc, Obs });
        await paciente.update({ Iddisc: nuevaDiscapacidad.Iddisc, Tienediscapacidad: 1 });
      }
    } else {
      if (paciente.Iddisc) {
        await paciente.update({ Iddisc: null });
      }
      await paciente.update({ Tienediscapacidad: 0 });
    }
    
    const pacienteActualizado = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    res.json(pacienteActualizado);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ error: error.message });
  }
});

// Only one export at the end
module.exports = router;