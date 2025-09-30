const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'avnadmin',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conexión establecida con Aiven MySQL'))
  .catch((error) => {
    console.error('❌ Error al conectar con Aiven:', error.message);
    console.log('ℹ️  Verifica las variables de entorno en Render');
  });

module.exports = sequelize;