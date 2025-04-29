const express = require('express');
const router = express.Router();
const { Paciente, Discapacidad } = require('../modelos'); // Asegúrate de que esta ruta es la correcta
const ValidarPac = require('../validacion/ValidarPac');

// Crear paciente
router.post('/registrar', ValidarPac, async (req, res) => {
  try {
    // Crear el paciente con el Iddisc si fue registrado
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
      Tienediscapacidad:req.body.Tienediscapacidad,
      Diagnostico: req.body.Diagnostico,
      Iddisc: req.body.Iddisc  // puede ser null si no hubo discapacidad
    });
    res.status(201).json({ paciente });
  } catch (error) {
    console.error("❌ Error al registrar paciente:", error);
    res.status(400).json({ error: error.message });
  }
});
// Ruta para buscar paciente por CI
router.get('/buscar', async (req, res) => {
  const { ci } = req.query; // 👈 corregido aquí

  if (!ci) {
    return res.status(400).json({ mensaje: 'CI requerido' });
  }

  try {
    const paciente = await Paciente.findOne({ where: { Ci_pac: ci } }); // 👈 y aquí
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

      // Modificar la columna 'Tienediscapacidad' antes de devolverla
      const pacientesModificados = pacientes.map(paciente => {
        // Cambiar 'true' o 'false' a 'sí' o 'no'
        paciente.Tienediscapacidad = paciente.Tienediscapacidad ? 'Sí' : 'No';
        return paciente;
      });

    res.json(pacientesModificados);
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
    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const idDiscapacidad = paciente.Iddisc;

    // Primero eliminamos al paciente
    await paciente.destroy();

    // Luego verificamos si hay más pacientes con esa misma discapacidad
    if (idDiscapacidad) {
      const otrosPacientes = await Paciente.count({ where: { Iddisc: idDiscapacidad } });
      if (otrosPacientes === 0) {
        await Discapacidad.destroy({ where: { Iddisc: idDiscapacidad } });
      }
    }

    return res.status(200).json({ message: 'Paciente eliminado correctamente. Discapacidad eliminada si no fue referenciada por otro paciente.' });
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
      Tienediscapacidad,  // Valor que indica si tiene discapacidad (true/false)
      Tipo_disc,
      Grado_disc,
      Obs
    } = req.body;

    console.log("Datos recibidos:", req.body); // Verifica los datos que llegan del frontend

    const paciente = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Convierte Tienediscapacidad en booleano (true/false)
    const tieneDisc = Tienediscapacidad === "true" || Tienediscapacidad === true;
    console.log("Valor de Tienediscapacidad:", tieneDisc); // Verifica el valor de Tienediscapacidad

    // Actualizar datos del paciente (sin cambiar el campo Discapacidad aún)
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

    // Si tiene discapacidad
    if (tieneDisc) {
      if (paciente.Iddisc) {
        const discapacidadExistente = await Discapacidad.findByPk(paciente.Iddisc);
        if (discapacidadExistente) {
          await discapacidadExistente.update({ Tipo_disc, Grado_disc, Obs });
        } else {
          return res.status(404).json({ error: 'Discapacidad no encontrada para actualizar' });
        }
        console.log("Actualizando Discapacidad a 1");
        await paciente.update({ Tienediscapacidad: 1 });
      } else {
        console.log("Creando nueva discapacidad y asociando...");
        const nuevaDiscapacidad = await Discapacidad.create({ Tipo_disc, Grado_disc, Obs });
        await paciente.update({ Iddisc: nuevaDiscapacidad.Iddisc, Tienediscapacidad: 1 });
      }
    } else {
      if (paciente.Iddisc) {
        await paciente.update({ Iddisc: null });
      }
      await paciente.update({ Tienediscapacidad: 0 });
    }
    
    

    // Obtener el paciente actualizado con la discapacidad asociada
    const pacienteActualizado = await Paciente.findByPk(id, {
      include: { model: Discapacidad, as: 'detalleDiscapacidad' }
    });

    res.json(pacienteActualizado);

  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
