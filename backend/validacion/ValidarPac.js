const { check, validationResult } = require('express-validator');

// Validaciones para los campos de un paciente
const ValidarPac = [
  check('Nombre_pac')
    .notEmpty()
    .withMessage('El nombre del paciente es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede tener más de 50 caracteres'),

  check('Appaterno_pac')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El apellido paterno no puede tener más de 50 caracteres'),

  check('Apmaterno_pac')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El apellido materno no puede tener más de 50 caracteres'),

  check('Fnaci_pac')
    .notEmpty()
    .withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)'),

  check('Genero_pac')
    .optional()
    .isIn(['F', 'M'])
    .withMessage('El género debe ser F o M'),

  check('Ci_pac')
    .notEmpty()
    .withMessage('El CI es obligatorio')
    .isLength({ max: 20 })
    .withMessage('El CI no puede tener más de 20 caracteres'),

  check('Telefono_pac')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede tener más de 20 caracteres'),

  check('Direccion_pac')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La dirección no puede tener más de 255 caracteres'),

  check('Seguro')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El seguro no puede tener más de 50 caracteres'),

  check('Discapacidad')
    .optional()
    .isBoolean()
    .withMessage('Discapacidad debe ser verdadero (true) o falso (false)'),

  check('Diagnostico')
    .optional()
    .isLength({ max: 255 })
    .withMessage('El diagnóstico no puede tener más de 255 caracteres'),

  // Middleware para manejar los errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = ValidarPac;

  