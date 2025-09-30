const { Sequelize } = require('sequelize');

// Usar PostgreSQL en producción, MySQL en desarrollo
const sequelize = process.env.NODE_ENV === 'production' 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize(
      process.env.DB_NAME || 'defaultdb',
      process.env.DB_USER || 'avnadmin',
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        dialectOptions: {
          ssl: {
            rejectUnauthorized: true
          }
        },
        logging: false
      }
    );

sequelize.authenticate()
  .then(() => console.log('✅ Conexión establecida con la base de datos'))
  .catch((error) => console.error('❌ Error al conectar:', error.message));

module.exports = sequelize;