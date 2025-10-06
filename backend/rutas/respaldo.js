const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mysqldump = require('mysqldump');

router.get('/', async (req, res) => {
  try {
    // Ruta del archivo de respaldo
    const backupFile = path.join(__dirname, '../backups/backup_' + Date.now() + '.sql');

    // Lee el certificado CA
    const caCertPath = path.join(__dirname, '../rutas/ca.pem');
    const caCert = fs.readFileSync(caCertPath, 'utf8');

    // Genera el respaldo
    await mysqldump({
      connection: {
        host: 'rehabilitacion-deysivelaestrada-d394.k.aivencloud.com',
        port: 18258,
        user: 'avnadmin',
        password: 'AVNS_rfkY_sLpQEWLwdmUu_g',
        database: 'defaultdb',
        ssl: {
          ca: caCert,
        },
      },
      dumpToFile: backupFile,
    });

    // Descarga el respaldo
    res.download(backupFile);
  } catch (err) {
    console.error('❌ Error al generar respaldo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
