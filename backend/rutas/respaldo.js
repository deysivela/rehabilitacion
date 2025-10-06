const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mysqldump = require('mysqldump');

router.get('/', async (req, res) => {
  try {
    const backupFile = path.join(__dirname, '../backups/backup_' + Date.now() + '.sql');

    // Leer el certificado CA desde el archivo local
    const caCert = fs.readFileSync(path.join(__dirname, 'ca.pem'));

    await mysqldump({
      connection: {
        host: 'rehabilitacion-deysivelaestrada-d394.k.aivencloud.com',
        port: 18258,
        user: 'avnadmin',
        password: 'AVNS_rfkY_sLpQEWLwdmUu_g',
        database: 'defaultdb', 
        ssl: {
          ca: caCert,
          rejectUnauthorized: true, 
        },
      },
      dumpToFile: backupFile,
    });

    res.download(backupFile);
  } catch (err) {
    console.error('Error al generar respaldo:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
