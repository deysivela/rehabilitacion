const { Sequelize } = require('sequelize');

console.log('🔧 Intentando conectar a:', process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => console.log('🎉 ¡CONECTADO!'))
  .catch(err => console.log('💥 Error:', err.message));

module.exports = sequelize;