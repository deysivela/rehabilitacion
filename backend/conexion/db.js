const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      ca: fs.readFileSync(path.resolve(__dirname, 'ca.pem'))
    }
  },
  logging: console.log,
});

sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos MySQL'))
  .catch((error) => console.error('Error al conectar MySQL:', error));

module.exports = sequelize;
