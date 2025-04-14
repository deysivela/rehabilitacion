const express = require('express');
const router = express.Router();
const { Paciente, Discapacidad } = require('../modelos/asociaciones');
const ValidarPac = require('../validacion/ValidarPac');

// Crear paciente
router.post('/registrar', ValidarPac, async (req, res) => {
  try {
    const paciente = await Paciente.create(req.body);
    res.status(201).json(paciente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos los pacientes con su discapacidad (si tiene)
router.get('/listar', async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({
      include: {
        model: Discapacidad,
        as: 'detalleDiscapacidad',
        required: false
      }
    });
    res.json(pacientes);
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener paciente por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const paciente = await Paciente.findOne({
      where: { Idpac: id },
      include: {
        model: Discapacidad,
        as: 'detalleDiscapacidad'
      }
    });

    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    res.json(paciente);
  } catch (error) {
    console.error('Error al obtener el paciente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar paciente
router.delete('/eliminar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Paciente.destroy({
      where: { Idpac: id }
    });

    if (result > 0) {
      return res.status(200).json({ message: 'Paciente eliminado correctamente' });
    } else {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
});

// Editar paciente y su discapacidad

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
      tieneDiscapacidad,  
      Tipo_disc,
      Grado_disc,
      Obs
    } = req.body;

    const paciente = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' } // Asegurarse de que la discapacidad esté incluida
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    // Actualizamos los datos del paciente
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
      Diagnostico,
      Discapacidad: tieneDiscapacidad ? 1 : 0
    });

    // Si tiene discapacidad
    if (tieneDiscapacidad) {
      if (paciente.Iddisc) {
        // Actualizar discapacidad existente
        const discapacidadExistente = await Discapacidad.findByPk(paciente.Iddisc);
        if (discapacidadExistente) {
          await discapacidadExistente.update({ Tipo_disc, Grado_disc, Obs });
        } else {
          return res.status(404).json({ error: 'Discapacidad no encontrada para actualizar' });
        }
      } else {
        // Crear nueva discapacidad y asociar
        const nuevaDiscapacidad = await Discapacidad.create({ Tipo_disc, Grado_disc, Obs });
        await paciente.update({ Iddisc: nuevaDiscapacidad.Iddisc });
      }
    }

    // Vuelve a obtener el paciente con la discapacidad asociada y devolver los datos actualizados
    const pacienteActualizado = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' } // Incluir la discapacidad actualizada
    });

    res.json(pacienteActualizado); // Devolver el paciente actualizado con la discapacidad

  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;


