const Sequelize = require("sequelize");
const sequelize = require("../conexion/db");

const db = {};
db.sequelize = sequelize;

// Importar modelos
db.Usuario = require("./usuario");
db.ProfSalud = require("./ProfSalud");
db.Paciente = require("./Paciente");
db.Discapacidad = require("./Discapacidad");
db.CitaMedica = require("./CitaMedica");
db.Sesion = require("./Sesion");
db.Tratamiento = require("./Tratamiento");
db.Tecnica = require("./Tecnica");
db.Area = require("./Area");
db.Sesion_Tecnica = require("./Sesion_tecnica");
db.Actividad = require("./Actividad");

// Asociaciones

db.Usuario.belongsTo(db.ProfSalud, {
  foreignKey: "Idprof",
  as: "profesional",
});

// CitaMedica pertenece a un Paciente y un Profesional de salud
db.CitaMedica.belongsTo(db.Paciente, { foreignKey: "Idpac", as: "paciente" });
db.CitaMedica.belongsTo(db.ProfSalud, {
  foreignKey: "Idprof",
  as: "profesional",
});

// Una CitaMedica tiene muchas Sesiones
db.CitaMedica.hasMany(db.Sesion, { foreignKey: "Idcita", as: "sesiones" });

// Una Sesión pertenece a una CitaMedica y a un Tratamiento
db.Sesion.belongsTo(db.CitaMedica, { foreignKey: "Idcita", as: "cita" });
db.Sesion.belongsTo(db.Tratamiento, {
  foreignKey: "Idtrat",
  as: "tratamiento",
});

// Un Tratamiento pertenece a un Paciente
db.Tratamiento.belongsTo(db.Paciente, { foreignKey: "Idpac", as: "paciente" });
db.Paciente.hasMany(db.Tratamiento, {
  foreignKey: "Idpac",
  as: "tratamientos",
});

// Un Paciente tiene una Discapacidad
db.Paciente.hasOne(db.Discapacidad, {
  foreignKey: "Iddisc",
  as: "detalleDiscapacidad",
});

// Un Profesional de salud pertenece a un Área
db.ProfSalud.belongsTo(db.Area, { foreignKey: "Idarea", as: "area" });

// Una Técnica pertenece a un Área
db.Tecnica.belongsTo(db.Area, { foreignKey: "Idarea", as: "area" });

// Un Área puede tener muchas Técnicas
db.Area.hasMany(db.Tecnica, { foreignKey: "Idarea", as: "tecnicas" });

db.Sesion_Tecnica.belongsTo(db.Sesion, { foreignKey: "Idsesion" });
db.Sesion_Tecnica.belongsTo(db.Tecnica, { foreignKey: "Idtec" });

db.Sesion.belongsToMany(db.Tecnica, {
  through: db.Sesion_Tecnica,
  foreignKey: "Idsesion",
  otherKey: "Idtec",
  as: "tecnicas",
});

db.Tecnica.belongsToMany(db.Sesion, {
  through: db.Sesion_Tecnica,
  foreignKey: "Idtec",
  otherKey: "Idsesion",
  as: "sesiones",
});

db.Actividad.belongsTo(db.ProfSalud, { foreignKey: 'Idprof', as: 'profesional' });


module.exports = db;
