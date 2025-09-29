
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('rehabilitacion', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});
sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos'))
  .catch((error) => console.error('Error al conectar:', error));
module.exports = sequelize;
