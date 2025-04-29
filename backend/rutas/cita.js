const express = require('express');
const router = express.Router();
//const { CitaMedica, Paciente, ProfSalud } = require('../modelos');
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
            [fn('CONCAT', col('paciente.Nombre_pac'), ' ', col('paciente.Appaterno_pac'), ' ', col('paciente.Apmaterno_pac')), 'nombreCompleto']
          ]
        },
        {
          model: ProfSalud,
          as: 'profesional',
          attributes: [
            [fn('CONCAT', col('profesional.Nombre_prof'), ' ', col('profesional.Appaterno_prof'), ' ', col('profesional.Apmaterno_prof')), 'nombreCompleto']
          ],
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

// Obtener todas las citas (alternativa redundante)
router.get('/', async (req, res) => {
  const citas = await CitaMedica.findAll({
    include: ['paciente', 'profesional']
  });
  res.json(citas);
});

const generarHorasDisponibles = () => {
  const horas = [];
  for (let i = 8; i <= 17; i++) {
    const hora = `${i.toString().padStart(2, '0')}:00`;
    if (!horasOcupadas.includes(hora)) {
      horas.push(hora);
    }
  }
  return horas;
};


router.post('/crear', async (req, res) => {
  const { fecha_cita, hora_cita, Idpac, Idprof, motivo_cita, estado_cita } = req.body;

  try {
    const nuevaCita = await Cita.create({
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



// Actualizar una cita
router.put('/actualizar/:id', async (req, res) => {
  try {
    await CitaMedica.update(req.body, { where: { Idcita: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar una cita
router.delete('/eliminar/:id', async (req, res) => {
  try {
    await CitaMedica.destroy({ where: { Idcita: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
