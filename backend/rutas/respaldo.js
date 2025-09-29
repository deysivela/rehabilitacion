const express = require('express');
const router = express.Router();
const path = require('path');
const mysqldump = require('mysqldump');

router.get('/', async (req, res) => { 
  try {
    const backupFile = path.join(__dirname, '../backups/backup_' + Date.now() + '.sql');

    await mysqldump({
      connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'rehabilitacion',
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
