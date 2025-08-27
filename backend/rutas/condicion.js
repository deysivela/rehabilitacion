const express = require('express');
const Condicion = require('../modelos/Condicio');
const router = express.Router();

// Listar todas las condiciones
router.get('/listar', async (req, res) => {
  try {
    const condiciones = await Condicion.findAll({
      order: [['condicion', 'ASC']] // Orden alfabético
    });
    res.status(200).json(condiciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error al obtener las condiciones', 
      error: error.message 
    });
  }
});




module.exports = router;