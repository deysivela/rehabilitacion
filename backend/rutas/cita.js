const express = require('express');
const router = express.Router();
const { CitaMedica, Paciente, ProfSalud, Area } = require('../modelos');
const { fn, col } = require('sequelize');
const { Op } = require('sequelize'); 

router.get('/listar', async (req, res) => {
  try {
    const citas = await CitaMedica.findAll({
      include: [
        {
          model: Paciente,
          as: 'paciente',
          attributes: [
            'Idpac',
            'Ci_pac', 
            [
              fn('CONCAT',
                fn('COALESCE', col('paciente.Nombre_pac'), ''),
                ' ',
                fn('COALESCE', col('paciente.Appaterno_pac'), ''),
                ' ',
                fn('COALESCE', col('paciente.Apmaterno_pac'), '')
              ),
              'nombreCompleto'
            ]
          ]
          
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: [
            [
              fn('CONCAT',
                fn('COALESCE', col('profesional.Nombre_prof'), ''),
                ' ',
                fn('COALESCE', col('profesional.Appaterno_prof'), ''),
                ' ',
                fn('COALESCE', col('profesional.Apmaterno_prof'), '')
              ),
              'nombreCompleto'
            ]
          ]
          ,
          include: [
            {
              model: Area,
              as: 'area',
              attributes: ['Nombre']
            }
          ]
        }
      ]
    });
    res.json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las citas médicas' });
  }
});

router.post('/crear', async (req, res) => {
  const { fecha_cita, hora_cita, Idpac, Idprof, motivo_cita, estado_cita } = req.body;

  try {
    // Convertir a Date por si viene como string
    const fecha = new Date(fecha_cita);
    const hora = new Date(hora_cita);

    // Buscar si ya hay una cita en esa fecha y hora para el mismo profesional
    const citaExistente = await CitaMedica.findOne({
      where: {
        Idprof,
        fecha_cita: fecha_cita,
        hora_cita: hora_cita
      }
    });

    if (citaExistente) {
      const fechaHoraExistente = new Date(`${citaExistente.fecha_cita}T${citaExistente.hora_cita}`);
      const horaFormateada = fechaHoraExistente.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    
      return res.status(409).json({
        mensaje: `El profesional ya tiene una cita ese día a las ${horaFormateada}.`
      });
    }
    

    // Si no hay conflictos, crear la nueva cita
    const nuevaCita = await CitaMedica.create({
      fecha_cita,
      hora_cita,
      Idpac,
      Idprof,
      motivo_cita,
      estado_cita,
    });

    res.status(201).json(nuevaCita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear cita' });
  }
});


// Eliminar una cita
router.delete('/eliminar/:id', async (req, res) => {
  try {
    // Eliminamos la cita con el Idcita proporcionado
    await CitaMedica.destroy({ where: { Idcita: req.params.id } });
    // Respondemos con un status 204 si la eliminación fue exitosa
    res.sendStatus(204);
  } catch (error) {
    // Si ocurre algún error, respondemos con el error
    res.status(400).json({ error: error.message });
  }
});
// Actualizar una cita
router.put('/editar/:id', async (req, res) => {
  try {
    // Actualizamos la cita con los datos del cuerpo de la solicitud
    await CitaMedica.update(req.body, { where: { Idcita: req.params.id } });
    // Responde con un status 204 si la actualización fue exitosa
    res.sendStatus(204);
  } catch (error) {
    // Si ocurre algún error, respondemos con el error
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
