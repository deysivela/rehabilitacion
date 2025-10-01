const { Sequelize } = require('sequelize');

// CONEXIÓN SUPER SIMPLIFICADA - elimina SSL temporalmente
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: true
});

// O si necesitas SSL básico:
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'mysql',
//   logging: true,
//   dialectOptions: {
//     ssl: {
//       rejectUnauthorized: false
//     }
//   }
// });

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión EXITOSA con MySQL Aiven');
  })
  .catch((error) => {
    console.error('❌ Error de conexión:', error.message);
  });

module.exports = sequelize;