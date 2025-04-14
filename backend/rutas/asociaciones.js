
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Rutas de asociaciones');
});

module.exports = router;
