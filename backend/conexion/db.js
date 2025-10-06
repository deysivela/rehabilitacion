const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: true
});

sequelize.authenticate()
  .then(() => {
    console.log(' Conexión EXITOSA con MySQL Aiven');
  })
  .catch((error) => {
    console.error(' Error de conexión:', error.message);
  });

module.exports = sequelize;