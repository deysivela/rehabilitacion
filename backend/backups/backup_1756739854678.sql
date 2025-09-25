/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: actividades
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `actividades` (
  `Idact` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `Actividad` varchar(255) DEFAULT NULL,
  `Tipo` varchar(50) DEFAULT NULL,
  `Lugar` varchar(255) DEFAULT NULL,
  `Resultado` text DEFAULT NULL,
  `Medio_ver` text DEFAULT NULL,
  `Idprof` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idact`),
  KEY `Idprof` (`Idprof`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`Idprof`) REFERENCES `prof_salud` (`Idprof`)
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: area
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `area` (
  `Idarea` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(50) DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  PRIMARY KEY (`Idarea`),
  UNIQUE KEY `Nombre` (`Nombre`)
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: citasmd
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `citasmd` (
  `Idcita` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_cita` date NOT NULL,
  `hora_cita` time NOT NULL,
  `motivo_cita` text DEFAULT NULL,
  `estado_cita` text NOT NULL,
  `Idpac` int(11) DEFAULT NULL,
  `idprof` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idcita`),
  KEY `Idpac` (`Idpac`),
  KEY `idprof` (`idprof`),
  CONSTRAINT `citasmd_ibfk_1` FOREIGN KEY (`Idpac`) REFERENCES `paciente` (`Idpac`),
  CONSTRAINT `citasmd_ibfk_2` FOREIGN KEY (`idprof`) REFERENCES `prof_salud` (`Idprof`)
) ENGINE = InnoDB AUTO_INCREMENT = 53 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: condicion
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `condicion` (
  `id_cond` int(11) NOT NULL AUTO_INCREMENT,
  `condicion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_cond`)
) ENGINE = InnoDB AUTO_INCREMENT = 37 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: discapacidad
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `discapacidad` (
  `Iddisc` int(11) NOT NULL AUTO_INCREMENT,
  `Tipo_disc` enum(
  'FÍSICA',
  'INTELECTUAL',
  'MÚLTIPLE',
  'VISUAL',
  'AUDITIVO',
  'MENTAL'
  ) NOT NULL,
  `Grado_disc` enum('Moderado', 'Grave', 'Muy Grave') NOT NULL,
  `Obs` text DEFAULT NULL,
  PRIMARY KEY (`Iddisc`)
) ENGINE = InnoDB AUTO_INCREMENT = 61 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: paciente
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `paciente` (
  `Idpac` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_pac` varchar(50) NOT NULL,
  `Appaterno_pac` varchar(50) DEFAULT NULL,
  `Apmaterno_pac` varchar(50) DEFAULT NULL,
  `Fnaci_pac` datetime NOT NULL,
  `Genero_pac` enum('F', 'M') DEFAULT NULL,
  `Ci_pac` varchar(20) DEFAULT NULL,
  `Telefono_pac` varchar(20) DEFAULT NULL,
  `Direccion_pac` text DEFAULT NULL,
  `Seguro` varchar(50) DEFAULT NULL,
  `Tienediscapacidad` tinyint(1) DEFAULT NULL,
  `Diagnostico` text DEFAULT NULL,
  `Iddisc` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idpac`),
  UNIQUE KEY `Ci_pac` (`Ci_pac`),
  UNIQUE KEY `Ci_pac_2` (`Ci_pac`),
  UNIQUE KEY `Ci_pac_3` (`Ci_pac`),
  UNIQUE KEY `Ci_pac_4` (`Ci_pac`),
  UNIQUE KEY `Ci_pac_5` (`Ci_pac`),
  KEY `Iddisc` (`Iddisc`),
  CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`Iddisc`) REFERENCES `discapacidad` (`Iddisc`)
) ENGINE = InnoDB AUTO_INCREMENT = 115 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: prof_salud
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `prof_salud` (
  `Idprof` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_prof` varchar(255) NOT NULL,
  `Appaterno_prof` varchar(255) NOT NULL,
  `Apmaterno_prof` varchar(255) DEFAULT NULL,
  `Ci_prof` varchar(255) DEFAULT NULL,
  `Fnaci_prof` datetime NOT NULL,
  `Genero_prof` enum('F', 'M') DEFAULT NULL,
  `Especialidad` varchar(255) DEFAULT NULL,
  `Telefono_prof` varchar(255) DEFAULT NULL,
  `Idarea` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idprof`),
  UNIQUE KEY `Ci_prof` (`Ci_prof`),
  KEY `Idarea` (`Idarea`),
  CONSTRAINT `prof_salud_ibfk_1` FOREIGN KEY (`Idarea`) REFERENCES `area` (`Idarea`)
) ENGINE = InnoDB AUTO_INCREMENT = 10 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sesion
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sesion` (
  `Idsesion` int(11) NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `Tipo` text DEFAULT NULL,
  `Atencion` text DEFAULT NULL,
  `Hora_ini` time DEFAULT NULL,
  `Hora_fin` time DEFAULT NULL,
  `Notas` text DEFAULT NULL,
  `Novedades` text DEFAULT NULL,
  `Idtrat` int(11) DEFAULT NULL,
  `Idpac` int(11) DEFAULT NULL,
  `idprof` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idsesion`),
  KEY `Idtrat` (`Idtrat`),
  KEY `fk_sesion_paciente` (`Idpac`),
  KEY `fk_sesion_profesional` (`idprof`),
  CONSTRAINT `fk_sesion_paciente` FOREIGN KEY (`Idpac`) REFERENCES `paciente` (`Idpac`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sesion_profesional` FOREIGN KEY (`idprof`) REFERENCES `prof_salud` (`Idprof`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `sesion_ibfk_3` FOREIGN KEY (`Idtrat`) REFERENCES `tratamiento` (`Idtrat`)
) ENGINE = InnoDB AUTO_INCREMENT = 187 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: sesion_tecnica
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `sesion_tecnica` (
  `Idsesion` int(11) NOT NULL,
  `Idtec` int(11) NOT NULL,
  KEY `Idsesion` (`Idsesion`),
  KEY `Idtecnica` (`Idtec`),
  CONSTRAINT `sesion_tecnica_ibfk_1` FOREIGN KEY (`Idsesion`) REFERENCES `sesion` (`Idsesion`),
  CONSTRAINT `sesion_tecnica_ibfk_2` FOREIGN KEY (`Idtec`) REFERENCES `tecnicas` (`Idtec`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tecnicas
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tecnicas` (
  `Idtec` int(11) NOT NULL AUTO_INCREMENT,
  `Descripcion` text NOT NULL,
  `Idarea` int(11) DEFAULT NULL,
  PRIMARY KEY (`Idtec`),
  KEY `Idarea` (`Idarea`),
  CONSTRAINT `tecnicas_ibfk_1` FOREIGN KEY (`Idarea`) REFERENCES `area` (`Idarea`)
) ENGINE = InnoDB AUTO_INCREMENT = 19 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: tratamiento
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `tratamiento` (
  `Idtrat` int(11) NOT NULL AUTO_INCREMENT,
  `diagnostico` text DEFAULT NULL,
  `nombre` text DEFAULT NULL,
  `Fecha_ini` date NOT NULL,
  `Fecha_fin` date DEFAULT NULL,
  `Idpac` int(11) DEFAULT NULL,
  `Estado` text DEFAULT NULL,
  `Idprof` int(11) DEFAULT NULL,
  `Obs` text DEFAULT NULL,
  `Razon` text DEFAULT NULL,
  PRIMARY KEY (`Idtrat`),
  KEY `Idpac` (`Idpac`),
  KEY `fk_tratamiento_prof_salud` (`Idprof`),
  CONSTRAINT `fk_tratamiento_prof_salud` FOREIGN KEY (`Idprof`) REFERENCES `prof_salud` (`Idprof`) ON DELETE
  SET
  NULL ON UPDATE CASCADE,
  CONSTRAINT `tratamiento_ibfk_1` FOREIGN KEY (`Idpac`) REFERENCES `paciente` (`Idpac`)
) ENGINE = InnoDB AUTO_INCREMENT = 33 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: usuario
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuario` (
  `Iduser` int(11) NOT NULL AUTO_INCREMENT,
  `Usuario` varchar(50) NOT NULL,
  `Pass` varchar(255) NOT NULL,
  `Rol` varchar(50) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 1,
  `Idprof` int(11) DEFAULT NULL,
  PRIMARY KEY (`Iduser`),
  UNIQUE KEY `Usuario` (`Usuario`),
  KEY `Idprof` (`Idprof`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Idprof`) REFERENCES `prof_salud` (`Idprof`)
) ENGINE = InnoDB AUTO_INCREMENT = 15 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: actividades
# ------------------------------------------------------------

INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    1,
    '2024-12-01',
    'Taller de manejo del estrés',
    'Terapéutica',
    'Centro de Rehabilitación',
    'Alivio de ansiedad',
    'Redes sociales',
    1
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    2,
    '2024-12-02',
    'Rehabilitación de movilidad',
    'Fisioterapia',
    'Hospital Central',
    'Mejoría en la movilidad',
    'Informe médico',
    2
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    3,
    '2024-12-03',
    'Evaluación de lenguaje',
    'Psicológica',
    'Consultorio',
    'Mejoría en el habla',
    'Observación directa',
    3
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    4,
    '2024-12-04',
    'Terapia ocupacional',
    'Ocupacional',
    'Unidad de Rehabilitación',
    'Avances en actividades diarias',
    'Observación directa',
    4
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    5,
    '2024-12-05',
    'Intervención social comunitaria',
    'Trabajo social',
    'Comunidad',
    'Mejor integración social',
    'Informe de progreso',
    5
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    6,
    '2025-08-01',
    'dfghjk',
    'Terapéutica',
    'Centro de Rehabilitación',
    'dfghjkl',
    'dfghjm',
    2
  );
INSERT INTO
  `actividades` (
    `Idact`,
    `Fecha`,
    `Actividad`,
    `Tipo`,
    `Lugar`,
    `Resultado`,
    `Medio_ver`,
    `Idprof`
  )
VALUES
  (
    7,
    '2025-08-03',
    'Taller de manejo del estrés',
    'Terapéutica',
    'Centro de Rehabilitación',
    'otro',
    'otro',
    2
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: area
# ------------------------------------------------------------

INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (
    1,
    'Fisioterapia',
    'Rehabilitación física y mejora de movilidad'
  );
INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (
    2,
    'Psicología',
    'Atención y terapia psicológica para bienestar emocional'
  );
INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (
    3,
    'Fonoaudiología',
    'Tratamiento de trastornos del habla y lenguaje'
  );
INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (
    4,
    'Terapia Ocupacional',
    'Promoción de la autonomía e independencia funcional'
  );
INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (
    5,
    'Trabajo Social',
    'Apoyo en integración y resolución de problemas sociales'
  );
INSERT INTO
  `area` (`Idarea`, `Nombre`, `Descripcion`)
VALUES
  (7, 'OTROS', 'otros ');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: citasmd
# ------------------------------------------------------------

INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    1,
    '2025-05-22',
    '08:30:00',
    'Evaluación inicial para rehabilitación',
    'Finalizada',
    1,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    2,
    '2025-04-09',
    '09:45:00',
    'Control postoperatorio',
    'Finalizada',
    2,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    3,
    '2025-06-13',
    '10:15:00',
    'Consulta para terapia ocupacional',
    'Programada',
    3,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    4,
    '2025-04-14',
    '11:30:00',
    'Seguimiento psicológico',
    'Finalizada',
    4,
    5
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    5,
    '2025-04-21',
    '09:00:00',
    'Consulta por trastorno del lenguaje',
    'Finalizada',
    5,
    1
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    7,
    '2025-04-17',
    '15:00:00',
    'Sesión de trabajo social',
    'Finalizada',
    7,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    8,
    '2025-04-18',
    '16:45:00',
    'Evaluación física',
    'Ausente',
    8,
    5
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    9,
    '2025-05-19',
    '17:15:00',
    'Consulta psicológica por estrés',
    'Finalizada',
    9,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    10,
    '2025-04-23',
    '17:00:00',
    'Rehabilitación para lesión deportiva',
    'Finalizada',
    10,
    1
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    17,
    '2025-04-29',
    '15:35:00',
    'fractura',
    'Programada',
    2,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    19,
    '2025-04-29',
    '09:40:00',
    'lesion',
    'Programada',
    2,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    22,
    '2025-04-30',
    '16:00:00',
    'dolores',
    'Programada',
    22,
    5
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    25,
    '2025-05-09',
    '16:00:00',
    'fisio',
    'Finalizada',
    4,
    5
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    27,
    '2025-05-02',
    '15:00:00',
    'fisioterapia',
    'Programada',
    3,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    28,
    '2025-05-02',
    '17:00:00',
    'psicologia',
    'Finalizada',
    1,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    29,
    '2025-05-02',
    '09:00:00',
    'lkjhgfd',
    'Programada',
    1,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    31,
    '2025-05-22',
    '09:34:00',
    'revision ',
    'Programada',
    71,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    32,
    '2025-08-14',
    '17:13:00',
    'dolores',
    'Ausente',
    7,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    33,
    '2025-05-26',
    '14:15:00',
    'dolores',
    'Programada',
    22,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    34,
    '2025-05-26',
    '15:35:00',
    'fractura',
    'Finalizada',
    74,
    5
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    35,
    '2025-06-14',
    '15:43:00',
    'dolores musculares',
    'Programada',
    36,
    4
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    36,
    '2025-06-21',
    '14:55:00',
    'fractura',
    'Programada',
    73,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    37,
    '2025-06-10',
    '09:30:00',
    'cita',
    'Programada',
    102,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    40,
    '2025-06-10',
    '10:30:00',
    'cita',
    'Programada',
    100,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    41,
    '2025-06-29',
    '14:40:00',
    'avance',
    'Programada',
    71,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    42,
    '2025-06-29',
    '14:10:00',
    'cita',
    'Programada',
    102,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    43,
    '2025-07-06',
    '17:43:00',
    'fghjm',
    'Programada',
    91,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    44,
    '2025-07-21',
    '14:36:00',
    'programada',
    'Programada',
    54,
    1
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    45,
    '2025-07-25',
    '16:14:00',
    'programada',
    'Programada',
    86,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    49,
    '2025-08-28',
    '16:34:00',
    'cita medica',
    'Programada',
    106,
    3
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    50,
    '2025-08-29',
    '15:44:00',
    'sesion',
    'Programada',
    71,
    9
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    51,
    '2025-08-28',
    '15:46:00',
    'sesioooo',
    'Programada',
    4,
    2
  );
INSERT INTO
  `citasmd` (
    `Idcita`,
    `fecha_cita`,
    `hora_cita`,
    `motivo_cita`,
    `estado_cita`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    52,
    '2025-09-01',
    '10:00:00',
    'Consulta general',
    'Programado',
    1,
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: condicion
# ------------------------------------------------------------

INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (1, 'Algias vertebrales');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (2, 'Amputacion');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (3, 'Artritis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (4, 'Artritis reumatoidea');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (5, 'Artrosis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (6, 'Bursitis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (7, 'Contractura muscular');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (8, 'Deformidades angulares de rodilla');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (9, 'Deformidades de columna');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (10, 'Displasia del desarrollo de cadera');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (11, 'Distrofias musculares');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (12, 'Enf. Respiratorias (asma, epoc)');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (13, 'Enf. Vascular Cerebral (secuelas)');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (14, 'Esclerosis Multiple');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (15, 'Esguince');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (16, 'Fascitis plantar');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (17, 'Fracturas');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (18, 'Lesion medular');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (19, 'Luxacion');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (20, 'Mialgias');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (21, 'Paralisis Braquial');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (22, 'Paralisis Cerebral');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (23, 'Paralisis fascial periferico');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (24, 'Parkinson');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (25, 'Pie equino varo');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (26, 'Pie Plano');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (27, 'Polineuropatia');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (28, 'Sindrome de Down');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (29, 'Sindrome de inmovilidad');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (30, 'Sindrome post poliomielitis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (31, 'Sinovitis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (32, 'Tendinitis - tendinosis');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (33, 'Trastorno del Desarrollo');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (34, 'Traumatismo craneoencefalico');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (35, 'Ulceras por presion');
INSERT INTO
  `condicion` (`id_cond`, `condicion`)
VALUES
  (36, 'Otros');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: discapacidad
# ------------------------------------------------------------

INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    1,
    'FÍSICA',
    'Muy Grave',
    'Parálisis en extremidades superiores'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    2,
    'AUDITIVO',
    'Moderado',
    'Sordera parcial en oído izquierdo'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    3,
    'FÍSICA',
    'Grave',
    'Parálisis cerebral que afecta movilidad'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    4,
    'AUDITIVO',
    'Moderado',
    'Pérdida auditiva progresiva'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    5,
    'FÍSICA',
    'Muy Grave',
    'Parálisis en extremidades inferiores'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (6, 'AUDITIVO', 'Muy Grave', 'Sordera total');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (7, 'MENTAL', 'Moderado', 'Trastorno de ansiedad');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    8,
    'FÍSICA',
    'Grave',
    'Dolor lumbar crónico que limita movilidad'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    9,
    'MENTAL',
    'Moderado',
    'Trastorno de la ansiedad generalizada'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    10,
    'MÚLTIPLE',
    'Moderado',
    'Problemas de movilidad debido a lesiones deportivas'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (11, 'FÍSICA', 'Moderado', 'lesion en la pierna ');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (12, 'FÍSICA', 'Moderado', 'Obs de prueba');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (13, 'FÍSICA', 'Moderado', 'dolores muculares');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (14, 'INTELECTUAL', 'Moderado', 'perdida del habla');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    15,
    'VISUAL',
    'Moderado',
    'visalidad devil de ojo derecho '
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (16, 'MÚLTIPLE', 'Moderado', 'fractura');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (17, 'FÍSICA', 'Grave', 'fractura en el brazo');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (18, 'MENTAL', 'Moderado', 'sensorial');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (19, 'FÍSICA', 'Grave', 'sensorial');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (20, 'FÍSICA', 'Moderado', 'lesion en los brazos');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (21, 'MÚLTIPLE', 'Moderado', 'dolores musculares');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (22, 'FÍSICA', 'Muy Grave', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (23, 'FÍSICA', 'Moderado', 'dolores fisico');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (24, 'INTELECTUAL', 'Muy Grave', 'es tontito');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    25,
    'INTELECTUAL',
    'Moderado',
    'deficis de atencion'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (26, 'FÍSICA', 'Moderado', 'moderado');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (27, 'FÍSICA', 'Moderado', 'dolores');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (28, 'FÍSICA', 'Moderado', 'dolores');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (29, 'FÍSICA', 'Grave', 'fractura');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (30, 'FÍSICA', 'Grave', 'fractura');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (31, 'FÍSICA', 'Grave', 'fractura');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (35, 'VISUAL', 'Moderado', 'perdida del ojo derecho');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (42, 'MENTAL', 'Moderado', 'sdfghj');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (43, 'MÚLTIPLE', 'Moderado', 'sdfghjk');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (45, 'INTELECTUAL', 'Grave', 'lkjhgfd');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (46, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (47, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (48, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (49, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (50, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (51, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (52, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (53, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (54, 'FÍSICA', 'Moderado', 'fractura en la pierna');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    55,
    'FÍSICA',
    'Muy Grave',
    'fractura en el pierna derecha'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (
    56,
    'FÍSICA',
    'Muy Grave',
    'fractura en el pierna derecha'
  );
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (57, 'FÍSICA', 'Grave', 'lesion en el brazo');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (58, 'FÍSICA', 'Grave', 'lesion en el brazo');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (59, 'FÍSICA', 'Moderado', 'dfghjkl');
INSERT INTO
  `discapacidad` (`Iddisc`, `Tipo_disc`, `Grado_disc`, `Obs`)
VALUES
  (60, 'VISUAL', 'Moderado', 'ojo derecho');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: paciente
# ------------------------------------------------------------

INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    1,
    'Luis',
    'Villca',
    'Villaroel',
    '2024-06-10 00:00:00',
    'M',
    '87654321',
    '78912350',
    'Av. Siempre Viva',
    'SUS',
    1,
    'ceguerra parcial',
    5
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    2,
    'Ana',
    'Fernández',
    'Dasilva',
    '1985-07-20 00:00:00',
    'F',
    '7653210',
    '78912351',
    'Calle Central',
    'SUS',
    1,
    'paralisis',
    1
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    3,
    'Pedro',
    'Gómez',
    'Murrillo',
    '2000-01-15 00:00:00',
    'M',
    '65432100',
    '78912352',
    'Barrio Norte',
    'SUS',
    0,
    'Lesión deportiva',
    8
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    4,
    'Sofía',
    'Ramírez',
    'López',
    '1995-03-25 00:00:00',
    'F',
    '54321098',
    '78912353',
    'Zona Sur',
    'SUS',
    1,
    'Déficit sensorial',
    19
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    5,
    'Laura',
    'Hernández',
    'Perez',
    '1978-11-30 00:00:00',
    'F',
    '43210987',
    '78912354',
    'Calle Bolívar',
    'SUS',
    0,
    'Artritis reumatoide',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    6,
    'Javier',
    'Mendoza',
    'Torres',
    '2024-09-10 00:00:00',
    'M',
    '78912312',
    '78912355',
    'Barrio Norte',
    'SUS',
    1,
    'Dolor lumbar crónico',
    2
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    7,
    'Marta',
    'Ruiz',
    'Rojas',
    '1997-09-18 00:00:00',
    'F',
    '67891234',
    '78912356',
    'Calle Central',
    'SUS',
    0,
    'Trastorno del lenguaje',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    8,
    'Elena',
    'Vargas',
    'Paz',
    '1992-06-14 00:00:00',
    'F',
    '56789123',
    '78912357',
    'Zona Este',
    'SUS',
    0,
    'Fractura de cadera',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    9,
    'Diego',
    'Suárez',
    'Quiroga',
    '2008-12-21 00:00:00',
    'M',
    '45678912',
    '78912358',
    'Avenida Bolívar',
    'SUS',
    0,
    'Parálisis cerebral leve',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    10,
    'Camila',
    'Núñez',
    'Silva',
    '1969-03-30 00:00:00',
    'F',
    '34567891',
    '78912359',
    'Barrio Universitario',
    'SUS',
    1,
    'Déficit auditivo',
    5
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    11,
    'Luis',
    'Castro',
    'Molina',
    '2023-11-02 00:00:00',
    'M',
    '23456789',
    '78912360',
    'Zona Central',
    'SUS',
    1,
    'Lesión en la columna',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    12,
    'Andrea',
    'García',
    'Loza',
    '1975-01-10 00:00:00',
    'F',
    '12345678',
    '78912361',
    'Calle Sur',
    'SUS',
    0,
    'Artrosis avanzada',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    13,
    'Carlos',
    'Paz',
    'Mendoza',
    '1987-05-22 00:00:00',
    'M',
    '88887777',
    '78912362',
    'Zona Oeste',
    'SUS',
    1,
    'Tendinitis crónica',
    6
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    14,
    'Marcos',
    'López',
    'Martínez',
    '2008-08-15 00:00:00',
    'M',
    '12345679',
    '78912362',
    'Calle Real',
    'SUS',
    0,
    'Tensión muscular',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    15,
    'Fernanda',
    'Díaz',
    'Morales',
    '1986-02-25 00:00:00',
    'F',
    '23456780',
    '78912363',
    'Zona Este',
    'SUS',
    1,
    'Parálisis facial',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    16,
    'José',
    'Mora',
    'Zapata',
    '1989-11-10 00:00:00',
    'M',
    '34567811',
    '78912364',
    'Calle 10',
    'SUS',
    0,
    'Hernia discal',
    7
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    17,
    'Raquel',
    'Sánchez',
    'Vega',
    '1994-06-30 00:00:00',
    'F',
    '45678922',
    '78912365',
    'Barrio del Sol',
    'SUS',
    0,
    'Fractura de muñeca',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    18,
    'Felipe',
    'Reyes',
    'Torres',
    '2015-03-14 00:00:00',
    'M',
    '56789033',
    '78912366',
    'Avenida Norte',
    'SUS',
    1,
    'Ceguera parcial',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    19,
    'Camila',
    'Navarro',
    'Gómez',
    '2002-10-22 00:00:00',
    'F',
    '67890144',
    '78912367',
    'Calle de la Paz',
    'SUS',
    0,
    'Trombosis venosa',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    20,
    'Marcos',
    'Hernández',
    'Morales',
    '1996-09-30 00:00:00',
    'M',
    '78901255',
    '78912368',
    'Avenida La Florida',
    'SUS',
    1,
    'Discapacidad motora',
    10
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    21,
    'Beatriz',
    'Castillo',
    'González',
    '2000-05-05 00:00:00',
    'F',
    '89012366',
    '78912369',
    'Zona Industrial',
    'SUS',
    0,
    'Artritis psoriásica',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    22,
    'Carlos',
    'Guzmán',
    'Rivas',
    '1991-01-18 00:00:00',
    'M',
    '90123477',
    '78912370',
    'Barrio Sur',
    'SUS',
    0,
    'Rehabilitación post-quirúrgica',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    23,
    'Paula',
    'Jiménez',
    'Cordero',
    '1990-04-25 00:00:00',
    'F',
    '98765432',
    '78912371',
    'Calle Bolívar',
    'SUS',
    1,
    'Esquizofrenia',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    24,
    'Ricardo',
    'Serrano',
    'Méndez',
    '2005-11-30 00:00:00',
    'M',
    '89654321',
    '78912372',
    'Zona Oeste',
    'SUS',
    0,
    'Infección crónica',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    25,
    'Juan',
    'Jiménez',
    'Pérez',
    '1988-07-07 00:00:00',
    'M',
    '76543210',
    '78912373',
    'Calle Larga',
    'SUS',
    1,
    'Discapacidad auditiva',
    35
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    26,
    'Verónica',
    'Martínez',
    'Díaz',
    '1984-12-13 00:00:00',
    'F',
    '65432109',
    '78912374',
    'Barrio Los Pinos',
    'SUS',
    0,
    'Migrañas crónicas',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    27,
    'Luis',
    'Romero',
    'González',
    '1992-09-21 00:00:00',
    'M',
    '54321090',
    '78912375',
    'Calle Alta',
    'SUS',
    1,
    'Sindrome de Fatiga Crónica',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    28,
    'Margarita',
    'Mendoza',
    'Alvarez',
    '1987-03-09 00:00:00',
    'F',
    '43210907',
    '78912376',
    'Zona Norte',
    'SUS',
    0,
    'Problema respiratorio',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    29,
    'Francisco',
    'Rivas',
    'Jiménez',
    '1995-05-10 00:00:00',
    'M',
    '32109076',
    '78912377',
    'Avenida Oeste',
    'SUS',
    1,
    'Trastorno de la ansiedad',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    30,
    'Gabriel',
    'Velázquez',
    'Torres',
    '1980-08-12 00:00:00',
    'M',
    '21098765',
    '78912378',
    'Zona Comercial',
    'SUS',
    1,
    'Discapacidad visual moderada',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    31,
    'Julia',
    'Zapata',
    'Ortiz',
    '1994-10-02 00:00:00',
    'F',
    '20197654',
    '78912379',
    'Calle Jardines',
    'SUS',
    0,
    'Desorden neurológico',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    32,
    'Emilio',
    'Paredes',
    'Gutiérrez',
    '1986-01-30 00:00:00',
    'M',
    '19286543',
    '78912380',
    'Barrio Colonial',
    'SUS',
    1,
    'Problemas de movilidad',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    33,
    'Santiago',
    'Peralta',
    'Espinoza',
    '1990-12-11 00:00:00',
    'M',
    '18375432',
    '78912381',
    'Zona Este',
    'SUS',
    0,
    'Dolor articular crónico',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    34,
    'Carolina',
    'Quispe',
    'Aguirre',
    '1997-04-20 00:00:00',
    'F',
    '17464321',
    '78912382',
    'Calle Flores',
    'SUS',
    1,
    'Autismo leve',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    35,
    'Diana',
    'Montes',
    'Castro',
    '1989-06-18 00:00:00',
    'F',
    '16553210',
    '78912383',
    'Avenida Central',
    'SUS',
    0,
    'Epilepsia controlada',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    36,
    'Antonio',
    'Zambrano',
    'Vásquez',
    '1985-03-22 00:00:00',
    'M',
    '15642109',
    '78912384',
    'Barrio Vista Hermosa',
    'SUS',
    1,
    'Trastorno motor',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    37,
    'Natalia',
    'Ortega',
    'Valenzuela',
    '1993-11-05 00:00:00',
    'F',
    '14731098',
    '78912385',
    'Zona Sur',
    'SUS',
    0,
    'Esclerosis múltiple avanzada',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    38,
    'Daniel',
    'Morales',
    'Suárez',
    '1981-07-13 00:00:00',
    'M',
    '13820987',
    '78912386',
    'Barrio Los Álamos',
    'SUS',
    1,
    'Enfermedad degenerativa',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    39,
    'Valeria',
    'Arce',
    'Lozano',
    '1995-09-24 00:00:00',
    'F',
    '12910876',
    '78912387',
    'Calle Primavera',
    'SUS',
    0,
    'Lesión cervical',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    40,
    'Carlos',
    'Domínguez',
    'Fierro',
    '1987-02-16 00:00:00',
    'M',
    '12009765',
    '78912388',
    'Avenida Bolívar',
    'SUS',
    1,
    'Amputación miembro inferior',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    41,
    'María',
    'Esquivel',
    'Pineda',
    '1992-05-28 00:00:00',
    'F',
    '11098654',
    '78912389',
    'Calle Real',
    'SUS',
    0,
    'Hernia discal',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    42,
    'Fernando',
    'Cruz',
    'Rivera',
    '1984-10-09 00:00:00',
    'M',
    '10187543',
    '78912390',
    'Zona Oeste',
    'SUS',
    1,
    'Trastorno cognitivo leve',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    43,
    'Lucía',
    'Villalobos',
    'Mejía',
    '1988-01-04 00:00:00',
    'F',
    '98765431',
    '78912391',
    'Barrio El Molino',
    'SUS',
    0,
    'Tendinitis aguda',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    44,
    'Esteban',
    'Navarro',
    'López',
    '1991-06-27 00:00:00',
    'M',
    '80654321',
    '78912392',
    'Zona Norte',
    'SUS',
    1,
    'Discapacidad auditiva leve',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    45,
    'Laura',
    'Fuentes',
    'Salazar',
    '1986-12-15 00:00:00',
    'F',
    '76543219',
    '78912393',
    'Calle Libertad',
    'SUS',
    0,
    'Problemas ortopédicos',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    46,
    'Jorge',
    'Meza',
    'Cárdenas',
    '1990-09-11 00:00:00',
    'M',
    '65432108',
    '78912394',
    'Zona Este',
    'SUS',
    1,
    'Esclerosis lateral',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    47,
    'Alejandra',
    'Rosales',
    'Fernández',
    '1989-03-03 00:00:00',
    'F',
    '54321097',
    '78912395',
    'Avenida del Sol',
    'SUS',
    0,
    'Déficit sensorial',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    48,
    'Roberto',
    'Araya',
    'Martínez',
    '1993-07-19 00:00:00',
    'M',
    '43210986',
    '78912396',
    'Calle Los Nogales',
    'SUS',
    1,
    'Trombosis recurrente',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    49,
    'Luisa',
    'Campos',
    'Sánchez',
    '1987-11-23 00:00:00',
    'F',
    '32109875',
    '78912397',
    'Barrio La Esperanza',
    'SUS',
    0,
    'Esquizofrenia leve',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    52,
    'Lola',
    'Calle',
    'Cortez',
    '2016-04-06 00:00:00',
    'F',
    '7654323',
    '7543456',
    'av bolivar',
    'SUS',
    0,
    'dolores musculares',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    54,
    'Luis',
    'Martínez',
    'García',
    '1990-05-10 00:00:00',
    'M',
    '88654321',
    '78912350',
    'Av. Siempre Viva',
    'SUS',
    0,
    'Fractura en el brazo',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    55,
    'Monica',
    'Llave',
    'Contreras',
    '2020-06-17 00:00:00',
    'F',
    '7345678',
    '8757670',
    'av. civico',
    'sus',
    1,
    'fractura',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    62,
    'Maria',
    'Vela',
    'Lopez',
    '2021-06-18 00:00:00',
    'F',
    '83456732',
    '756777',
    'av. civico',
    'sus',
    0,
    'general',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    63,
    'Carlos',
    'Monte',
    'Paco',
    '2011-07-20 00:00:00',
    'M',
    '23456783',
    '7654312',
    'av. civico',
    'sus',
    1,
    'segedad del ojo ',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    65,
    'Carlos',
    'Perez',
    'LLave',
    '2003-09-25 00:00:00',
    'M',
    '7654321',
    '76543221',
    'av. civico',
    'sus',
    1,
    'pierna derecha',
    11
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    66,
    'Rosa',
    'Martínez',
    'López',
    '2018-06-08 00:00:00',
    'F',
    '63748593',
    '71045761',
    'av. civico',
    'SUS',
    1,
    'muculares',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    67,
    'Luis',
    'Fernández',
    'Gomez',
    '2011-06-21 00:00:00',
    'M',
    '93848595',
    '71045761',
    'av. civico',
    'SUS',
    1,
    'habla',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    68,
    'Marta',
    'Llave',
    '',
    '2025-03-01 00:00:00',
    'F',
    '83748593',
    '71045761',
    'av. civico',
    'SUS',
    0,
    'perdidad de vista',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    69,
    'Alice',
    'Gómez',
    '',
    '2025-01-19 00:00:00',
    'F',
    '2452656',
    '71045761',
    'av. civico',
    'SUS',
    1,
    'fractura',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    71,
    'Rosa',
    'Paz',
    'Guiles',
    '2025-02-04 00:00:00',
    'F',
    '58535672',
    '76543213',
    'Av. Bolivar Llallagua',
    'SUS',
    1,
    'lesion ',
    20
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    73,
    'Sofía',
    'Fernández',
    '',
    '2024-10-10 00:00:00',
    'F',
    '76789876',
    '76543212',
    'bolivar',
    'SUS',
    1,
    'dolores',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    74,
    'Luisa',
    'Mamani',
    '',
    '2025-01-15 00:00:00',
    'F',
    '98765126',
    '71045761',
    'av. civico',
    'SUS',
    NULL,
    'fractura',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    86,
    'Sofía',
    'Fernández',
    '',
    '2025-05-01 00:00:00',
    'F',
    '76543234',
    '71045761',
    'av. civico',
    'SUS',
    1,
    'oiuytre',
    45
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    90,
    'Sofía',
    'Villca',
    '',
    '2017-06-28 00:00:00',
    'F',
    '76543212',
    '78909876',
    'av. civica',
    'SUS',
    0,
    'fractura en el brazo',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    91,
    'Karol',
    'Martinez',
    '',
    '2024-07-16 00:00:00',
    'F',
    '73605384',
    '98765443',
    'av. civica',
    'SUS',
    1,
    'fractura',
    46
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    100,
    'Calos',
    'Medina',
    'Chavez',
    '1990-01-24 00:00:00',
    'M',
    '72839495',
    '78495032',
    'av.civica',
    'SUS',
    1,
    'fractura',
    55
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    102,
    'Nayeli',
    'Velasco',
    'Lopez',
    '2000-04-19 00:00:00',
    'F',
    '73849502',
    '72838495',
    'av.civica',
    'SUS',
    1,
    'lesion',
    57
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    104,
    'Maira',
    'Fernández',
    '',
    '2021-02-25 00:00:00',
    'F',
    '75234566',
    '76543234',
    'av.civico',
    'SUS',
    1,
    'sdtrytuiuoi',
    59
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    105,
    'Carlos',
    'Villca',
    '',
    '2019-10-18 00:00:00',
    'M',
    '45678987',
    '56789098',
    'av. civico',
    'SUS',
    1,
    'sdfghj',
    60
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    106,
    'laila',
    'Martínez',
    'Calle',
    '2025-08-01 00:00:00',
    'F',
    '45678934',
    '345678',
    'dfghj',
    'SUS',
    0,
    'dfghjklgh',
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    113,
    'Juana',
    'Perez',
    'Gomez',
    '1990-01-01 00:00:00',
    'F',
    '56789088',
    '77777577',
    'Calle viva',
    'No',
    0,
    NULL,
    NULL
  );
INSERT INTO
  `paciente` (
    `Idpac`,
    `Nombre_pac`,
    `Appaterno_pac`,
    `Apmaterno_pac`,
    `Fnaci_pac`,
    `Genero_pac`,
    `Ci_pac`,
    `Telefono_pac`,
    `Direccion_pac`,
    `Seguro`,
    `Tienediscapacidad`,
    `Diagnostico`,
    `Iddisc`
  )
VALUES
  (
    114,
    'Julia',
    'Lopez',
    'Gomez',
    '1990-01-01 00:00:00',
    'F',
    '98766782',
    '76545678',
    'Calle viva',
    'No',
    0,
    'Fractura en el brazo',
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: prof_salud
# ------------------------------------------------------------

INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    1,
    'Juan',
    'Pérez',
    'González',
    '12345678',
    '1988-05-10 00:00:00',
    'M',
    'Fisioterapeuta',
    '78912345',
    3
  );
INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    2,
    'María',
    'López',
    'Fernández',
    '23456789',
    '1981-07-20 00:00:00',
    'F',
    'Psicóloga',
    '78912346',
    5
  );
INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    3,
    'Carlos',
    'Gómez',
    'Vellido',
    '34567890',
    '1995-01-15 00:00:00',
    'M',
    'Fonoaudiólogo',
    '78912347',
    1
  );
INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    4,
    'Andrea',
    'Cruz',
    'Mendoza',
    '45678901',
    '1992-03-25 00:00:00',
    'F',
    'Terapeuta Ocupacional',
    '78912348',
    1
  );
INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    5,
    'José',
    'Rodríguez',
    NULL,
    '56789012',
    '1974-11-30 00:00:00',
    'M',
    'Especialista en Trabajo Social',
    '78912349',
    2
  );
INSERT INTO
  `prof_salud` (
    `Idprof`,
    `Nombre_prof`,
    `Appaterno_prof`,
    `Apmaterno_prof`,
    `Ci_prof`,
    `Fnaci_prof`,
    `Genero_prof`,
    `Especialidad`,
    `Telefono_prof`,
    `Idarea`
  )
VALUES
  (
    9,
    'Mario',
    'López',
    '',
    '23456785',
    '1996-06-14 00:00:00',
    'M',
    'Especialista en Trabajo Social',
    '77654347',
    5
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sesion
# ------------------------------------------------------------

INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    1,
    '2025-01-09',
    'Nuevo',
    'Dentro de la institución',
    '08:30:00',
    '09:30:00',
    'Primera sesión programada',
    'Sin novedades',
    1,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    2,
    '2025-01-01',
    'Repetido',
    'Fuera de la institucion',
    '10:00:00',
    '11:00:00',
    'Rehabilitación avanzada',
    'Progreso notable',
    2,
    2,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    3,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '09:00:00',
    '10:00:00',
    'Sesión inicial',
    'Evaluación',
    3,
    3,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    5,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '14:00:00',
    '15:00:00',
    'Sesión de trabajo social',
    'Intervención exitosa',
    5,
    5,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    6,
    '2025-01-01',
    'Nuevo',
    NULL,
    '09:00:00',
    '10:00:00',
    'Evaluación completa',
    'Sin novedades',
    6,
    6,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    8,
    '2025-01-01',
    'Nuevo',
    '',
    '14:00:00',
    '15:00:00',
    'Sesión inicial',
    'Sin observaciones',
    4,
    7,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    9,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '15:30:00',
    '16:30:00',
    'Progreso satisfactorio',
    'Paciente mejorando',
    9,
    8,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    10,
    '2025-07-18',
    'Repetido',
    'Dentro de la institucion',
    '17:20:00',
    '18:00:00',
    ' Luxacion',
    'Evaluación positiva',
    31,
    90,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    11,
    '2025-01-01',
    'Nuevo',
    'Fuera de la institución',
    '09:00:00',
    '10:00:00',
    'Evaluación inicial',
    'Sin novedades',
    11,
    10,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    12,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '10:30:00',
    '11:30:00',
    'Avances en tratamiento',
    'Paciente en progreso',
    12,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    13,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '11:00:00',
    '12:00:00',
    ' Otros',
    'Sin observaciones',
    16,
    25,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    14,
    '2025-01-01',
    'Repetido',
    'Fuera de la institución',
    '12:00:00',
    '13:00:00',
    'Buena respuesta',
    'Notas positivas',
    14,
    3,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    16,
    '2025-01-01',
    'Nuevo',
    NULL,
    '08:30:00',
    '09:30:00',
    'Primera evaluación física.',
    'Paciente cooperativo.',
    1,
    5,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    17,
    '2025-01-01',
    'Repetido',
    'Fuera de la institución',
    '09:45:00',
    '10:45:00',
    'Seguimiento postoperatorio.',
    'Progreso observado.',
    2,
    6,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    18,
    '2025-01-01',
    'Nuevo',
    NULL,
    '10:15:00',
    '11:15:00',
    'Consulta inicial de terapia ocupacional.',
    'Diagnóstico en curso.',
    3,
    7,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    19,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '11:30:00',
    '12:30:00',
    'Terapia psicológica.',
    'Paciente responde favorablemente.',
    4,
    8,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    20,
    '2025-01-01',
    'Nuevo',
    NULL,
    '12:00:00',
    '13:00:00',
    'Primera sesión para trastorno del lenguaje.',
    'Paciente se ausentó.',
    5,
    9,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    21,
    '2025-01-01',
    'Repetido',
    '',
    '14:30:00',
    '15:30:00',
    ' Distrofias musculares',
    'Dolor persistente reportado.',
    17,
    6,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    22,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '15:00:00',
    '16:00:00',
    'Sesión de integración social.',
    'Progreso comunitario positivo.',
    7,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    23,
    '2025-05-05',
    'Repetido',
    '',
    '16:45:00',
    '17:45:00',
    'Evaluación para déficit auditivo.',
    'Requiere tratamiento adicional.',
    6,
    6,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    25,
    '2024-12-12',
    'Repetido',
    '',
    '18:00:00',
    '19:00:00',
    'Sesión de rehabilitación física.',
    'Evolución favorable.',
    3,
    3,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    137,
    '2025-01-01',
    'Nuevo',
    '',
    '08:30:00',
    '09:30:00',
    'Evaluación inicial',
    'Sin novedades',
    18,
    4,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    138,
    '2025-01-01',
    'Repetido',
    NULL,
    '10:00:00',
    '11:00:00',
    'Revisión de avances',
    'Progreso satisfactorio',
    3,
    5,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    139,
    '2025-01-01',
    'Nuevo',
    '',
    '09:00:00',
    '10:00:00',
    ' Distrofias musculares',
    'Mejora en la movilidad',
    6,
    6,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    140,
    '2025-01-01',
    'Repetido',
    NULL,
    '11:00:00',
    '12:00:00',
    'Seguimiento y ajustes',
    'Avance en la flexibilidad',
    12,
    7,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    141,
    '2025-01-01',
    'Nuevo',
    '',
    '14:00:00',
    '15:00:00',
    ' Luxacion',
    'Paciente en progreso',
    20,
    9,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    142,
    '2025-01-01',
    'Repetido',
    NULL,
    '15:00:00',
    '16:00:00',
    'Evaluación de tratamiento',
    'Evaluación positiva',
    14,
    9,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    143,
    '2025-01-01',
    'Nuevo',
    NULL,
    '10:00:00',
    '11:00:00',
    'Tratamiento de lenguaje',
    'Progreso en el habla',
    7,
    10,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    144,
    '2025-01-01',
    'Repetido',
    NULL,
    '12:00:00',
    '13:00:00',
    'Rehabilitación avanzada',
    'Mejora significativa en la movilidad',
    5,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    145,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '14:00:00',
    '15:00:00',
    ' Sindrome de Down',
    'Sin novedades',
    13,
    4,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    146,
    '2025-01-01',
    'Repetido',
    NULL,
    '09:00:00',
    '10:00:00',
    'Seguimiento de tratamiento',
    'Mejoría en el dolor',
    11,
    3,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    147,
    '2025-01-01',
    'Nuevo',
    '',
    '11:00:00',
    '12:00:00',
    'Tratamiento de movilidad articular',
    'Avance en la amplitud de movimiento',
    13,
    4,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    148,
    '2025-01-01',
    'Repetido',
    NULL,
    '13:00:00',
    '14:00:00',
    'Evaluación postquirúrgica',
    'Recuperación parcial',
    2,
    5,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    149,
    '2025-01-01',
    'Nuevo',
    NULL,
    '10:00:00',
    '11:00:00',
    'Rehabilitación neurológica',
    'Progreso en la función cognitiva',
    13,
    6,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    150,
    '2025-01-01',
    'Repetido',
    NULL,
    '12:30:00',
    '13:30:00',
    'Seguimiento post tratamiento',
    'Paciente en buen estado',
    10,
    7,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    151,
    '2025-01-01',
    'Nuevo',
    '',
    '14:30:00',
    '15:30:00',
    '  Enf. Respiratorias (asma, epoc)',
    'Mejora en la fuerza muscular sdfghjklñoiuygtfdfghjkjuhgf sdfghjkliuytrdfghjkjhygfvbkjhgfv',
    2,
    2,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    152,
    '2025-01-01',
    'Repetido',
    NULL,
    '10:00:00',
    '11:00:00',
    'Rehabilitación de columna vertebral',
    'Avances en la movilidad',
    15,
    9,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    153,
    '2025-01-01',
    'Nuevo',
    NULL,
    '15:00:00',
    '16:00:00',
    'Evaluación motora inicial',
    'Sin novedades',
    12,
    10,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    154,
    '2025-01-01',
    'Repetido',
    NULL,
    '14:23:00',
    '15:41:00',
    'sdfgh',
    'dsfghhjkjlkl',
    7,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    155,
    '2025-01-01',
    'Repetido',
    NULL,
    '09:58:00',
    '10:58:00',
    'dfghjklñl',
    'ewrtyuioo',
    13,
    2,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    156,
    '2025-01-01',
    'Repetido',
    NULL,
    '10:33:00',
    '11:33:00',
    'ewrtyuiopo',
    'dsfdgfhhjkk',
    2,
    3,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    157,
    '2025-01-01',
    'Repetido',
    '',
    '10:50:00',
    '11:50:00',
    ' Luxacion',
    '',
    4,
    4,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    158,
    '2025-01-01',
    'Repetido',
    NULL,
    '11:20:00',
    '12:00:00',
    'dgfhjk',
    'sfdgfhgjh',
    1,
    5,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    159,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '02:40:00',
    '03:04:00',
    'recuperacion razonable',
    'ninguna',
    1,
    6,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    160,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '09:58:00',
    '10:55:00',
    ' Enf. Respiratorias (asma, epoc)',
    'ninguna',
    19,
    7,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    161,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '14:35:00',
    '15:35:00',
    'mejoramiento ',
    'ninguno',
    27,
    8,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    162,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '14:39:00',
    '15:39:00',
    'progresivamente ',
    'ninguna',
    27,
    9,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    163,
    '2025-01-01',
    'Nuevo',
    'Dentro de la institucion',
    '14:39:00',
    '15:39:00',
    'progresivamente ',
    'ninguna',
    27,
    10,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    164,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '14:50:00',
    '15:50:00',
    'sdfghjkjl',
    'ghjhkj',
    27,
    1,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    165,
    '2025-03-10',
    'Repetido',
    'Dentro de la institucion',
    '14:57:00',
    '15:57:00',
    'mejora',
    'ñlkjhg',
    2,
    2,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    167,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '15:06:00',
    '16:06:00',
    'fghjk',
    'ertyu',
    13,
    4,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    168,
    '2025-01-05',
    'Repetido',
    'Dentro de la institucion',
    '15:06:00',
    '16:06:00',
    'fghjk',
    'ertyu',
    5,
    5,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    169,
    '2025-01-04',
    'Repetido',
    'Dentro de la institucion',
    '15:22:00',
    '16:22:00',
    'dfghjk',
    'fghj',
    6,
    6,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    170,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '15:31:00',
    '16:31:00',
    'fghjk',
    'uytrew',
    20,
    7,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    171,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '15:37:00',
    '16:37:00',
    'gfd',
    'saf',
    28,
    63,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    172,
    '2025-04-21',
    'Repetido',
    'Dentro de la institución',
    '15:00:00',
    '16:58:00',
    '',
    'sdfghjk',
    5,
    5,
    1
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    173,
    '2025-06-13',
    'Nuevo',
    'Fuera de la institución',
    '10:15:00',
    '11:46:00',
    ' Artritis',
    'sdfghjkl',
    25,
    10,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    174,
    '2025-01-01',
    'Repetido',
    'Dentro de la institucion',
    '15:22:00',
    '16:22:00',
    'dfghjk',
    'fghj',
    6,
    6,
    5
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    175,
    '2025-07-10',
    'Repetido',
    'Dentro de la institucion',
    '17:20:00',
    '18:00:00',
    ' Sindrome de Down',
    'Evaluación positiva',
    9,
    9,
    4
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    176,
    '2025-06-21',
    'Nuevo',
    'Dentro de la institución',
    '00:52:00',
    '01:53:00',
    ' Fracturas',
    'wwwwwwwww',
    18,
    4,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    177,
    '2025-06-22',
    'Nuevo',
    'Dentro de la institución',
    '17:47:00',
    '18:47:00',
    'mejoramiento',
    'ninguna',
    32,
    102,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    178,
    '2025-05-05',
    'Repetido',
    '',
    '16:45:00',
    '17:45:00',
    'Evaluación para déficit auditivo.',
    'Requiere tratamiento adicional.',
    6,
    6,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    182,
    '2025-08-04',
    'Repetido',
    'Dentro de la institución',
    '16:29:00',
    '17:29:00',
    ' Displasia del desarrollo de cadera',
    'otros',
    6,
    6,
    2
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    183,
    '2025-08-14',
    'Repetido',
    'Dentro de la institución',
    '10:36:00',
    '11:36:00',
    ' Enf. Respiratorias (asma, epoc)',
    'ninguna',
    2,
    2,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    184,
    '2025-08-14',
    'Repetido',
    'Dentro de la institución',
    '11:31:00',
    '12:31:00',
    ' Deformidades angulares de rodilla',
    'fdgfhjkjlk',
    4,
    4,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    185,
    '2025-08-26',
    'Nuevo',
    'Dentro de la institución',
    '16:59:00',
    '17:59:00',
    ' Luxacion',
    'ninguno',
    2,
    2,
    3
  );
INSERT INTO
  `sesion` (
    `Idsesion`,
    `Fecha`,
    `Tipo`,
    `Atencion`,
    `Hora_ini`,
    `Hora_fin`,
    `Notas`,
    `Novedades`,
    `Idtrat`,
    `Idpac`,
    `idprof`
  )
VALUES
  (
    186,
    '2025-09-01',
    'Terapia',
    'Individual',
    '10:00:00',
    '11:00:00',
    'Primera sesión',
    'Ninguna',
    1,
    1,
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: sesion_tecnica
# ------------------------------------------------------------

INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (1, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (5, 2);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (8, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (5, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (2, 5);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (20, 12);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (18, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (19, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (25, 11);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (150, 4);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (8, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (148, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (20, 13);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (1, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (3, 2);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (5, 9);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (2, 4);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (20, 4);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (160, 14);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (8, 2);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (1, 11);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (3, 8);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (170, 4);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (170, 16);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (171, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (171, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (145, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (145, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (162, 13);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (165, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (172, 11);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (173, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (174, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (175, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (175, 9);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (10, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (10, 9);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (23, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (173, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (25, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (165, 2);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (168, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (176, 14);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (169, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (10, 8);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (177, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (177, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (157, 8);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (137, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (147, 8);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (167, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (23, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (178, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (178, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (182, 2);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (183, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (184, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (21, 7);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (139, 11);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (160, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (145, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (141, 6);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (13, 10);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (185, 3);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (151, 8);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (186, 1);
INSERT INTO
  `sesion_tecnica` (`Idsesion`, `Idtec`)
VALUES
  (186, 2);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tecnicas
# ------------------------------------------------------------

INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (1, 'Electroterapias', 2);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (2, 'Terapia cognitivo-conductual', 5);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (3, 'Estimulación temprana', 1);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (4, 'Ejercicios de integración sensorial', 3);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (5, 'Atención social comunitaria', 4);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (6, 'Masoterapia', 1);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (7, 'Terapia de exposición', 2);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (8, 'Reeducación postural global', 1);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (9, 'Intervención en crisis', 2);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (10, 'Entrenamiento en habilidades sociales', 5);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (11, 'Rehabilitación del lenguaje', 3);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (12, 'Terapia ocupacional en niños', 4);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (13, 'Apoyo psicosocial', 5);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (14, 'masajes', 1);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (
    15,
    'Terapia ocupacional en integración sensorial',
    4
  );
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (16, 'Terapias en patologías de la deglución', 3);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (17, 'Atención psicopedagógica', 5);
INSERT INTO
  `tecnicas` (`Idtec`, `Descripcion`, `Idarea`)
VALUES
  (18, 'Evaluación en Terapia ocupacional', 4);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: tratamiento
# ------------------------------------------------------------

INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    1,
    NULL,
    'Tratamiento inicial para movilidad reducida.',
    '2024-12-11',
    '2025-01-25',
    1,
    'Alta temporal',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    2,
    '',
    'Rehabilitación postoperatoria en progreso.',
    '2024-12-12',
    NULL,
    2,
    'En tratamiento',
    5,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    3,
    '',
    'Mejoras significativas en habilidades motoras.',
    '2024-12-13',
    '2024-12-30',
    3,
    'Alta definitiva',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    4,
    'fghjklkl',
    'Terapia psicológica enfocada en manejo del estrés.',
    '2024-12-14',
    NULL,
    4,
    'En tratamiento',
    1,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    5,
    '',
    'Terapia de lenguaje completada exitosamente.',
    '2024-12-15',
    '2024-12-20',
    5,
    'Alta definitiva',
    3,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    6,
    '',
    'Tratamiento para dolor lumbar crónico.',
    '2024-12-16',
    NULL,
    6,
    'En tratamiento',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    7,
    '',
    'Trabajo social con enfoque comunitario.',
    '2024-12-17',
    '2024-12-31',
    7,
    'Alta temporal',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    8,
    NULL,
    'Evaluación para déficit auditivo en progreso.',
    '2025-12-18',
    NULL,
    8,
    'En tratamiento',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    9,
    '',
    'Sesiones de psicoterapia concluidas.',
    '2024-12-19',
    '2024-12-29',
    9,
    'Alta definitiva',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    10,
    '',
    'Rehabilitación de lesiones deportivas.',
    '2024-12-20',
    NULL,
    10,
    'En tratamiento',
    5,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    11,
    NULL,
    'Tratamiento inicial de fisioterapia',
    '2025-01-01',
    NULL,
    2,
    'En tratamiento',
    3,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    12,
    '',
    'Sesiones de seguimiento completadas',
    '2024-12-02',
    '2024-12-10',
    35,
    'Alta definitiva',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    13,
    NULL,
    'Evaluación y tratamiento inicial',
    '2024-12-03',
    '2025-01-22',
    4,
    'Abandono',
    2,
    'abandono',
    'Violencia'
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    14,
    '',
    'Tratamiento cancelado por el paciente',
    '2024-12-04',
    '2024-12-05',
    3,
    'Alta temporal',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    15,
    '',
    'Intervención social en progreso',
    '2024-12-05',
    NULL,
    5,
    'Abandono',
    4,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    16,
    NULL,
    'Nuevo programa de rehabilitación',
    '2024-12-06',
    '2025-08-14',
    25,
    'Alta definitiva',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    17,
    '',
    'Rehabilitación física avanzada',
    '2024-12-07',
    '2024-12-15',
    6,
    'Alta definitiva',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    18,
    NULL,
    'Inicio del tratamiento postoperatorio',
    '2024-12-08',
    NULL,
    4,
    'En tratamiento',
    3,
    'mejoramiento',
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    19,
    '',
    'Seguimiento de progreso en rehabilitación',
    '2024-12-09',
    NULL,
    7,
    'En tratamiento',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    20,
    '',
    'Primeras sesiones en curso',
    '2024-12-10',
    NULL,
    9,
    'En tratamiento',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    21,
    '',
    'Evaluación física completa',
    '2024-12-11',
    NULL,
    36,
    'Alta temporal',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    22,
    '',
    'Sesiones avanzadas en desarrollo',
    '2024-12-12',
    NULL,
    7,
    'En tratamiento',
    5,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    23,
    '',
    'Tratamiento inicial con enfoque multidisciplinario',
    '2024-12-13',
    NULL,
    8,
    'En tratamiento',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    24,
    '',
    'Terapia satisfactoriamente finalizada',
    '2024-12-14',
    '2024-12-20',
    9,
    'Alta definitiva',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    25,
    '',
    'Primera fase de tratamiento en curso',
    '2024-12-15',
    NULL,
    10,
    'En tratamiento',
    3,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    26,
    '',
    'ninguna',
    '2025-05-15',
    '2025-05-20',
    7,
    'Alta temporal',
    NULL,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    27,
    '',
    'mejorarmiento',
    '2025-05-26',
    NULL,
    22,
    'En tratamiento',
    1,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    28,
    NULL,
    'Tratamiento para dolor lumbar crónico.',
    '2024-05-26',
    '2025-01-22',
    74,
    'Alta temporal',
    5,
    'sdfghjk',
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    30,
    NULL,
    'ninguna',
    '2024-06-14',
    '2025-01-14',
    54,
    'Alta definitiva',
    2,
    NULL,
    NULL
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    31,
    'fractura',
    'ninguna ',
    '2024-06-15',
    '2025-01-22',
    90,
    'Abandono',
    3,
    'abandono',
    'Educación'
  );
INSERT INTO
  `tratamiento` (
    `Idtrat`,
    `diagnostico`,
    `nombre`,
    `Fecha_ini`,
    `Fecha_fin`,
    `Idpac`,
    `Estado`,
    `Idprof`,
    `Obs`,
    `Razon`
  )
VALUES
  (
    32,
    'fghjkl',
    'en tratamiendo de movilidad ',
    '2025-06-15',
    NULL,
    102,
    'En tratamiento',
    3,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: usuario
# ------------------------------------------------------------

INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    2,
    'medico1',
    '$2b$10$Z0BS8XQCP4i7fzmPDu.6cuGMnq6GjFMchSismAly3cy1QYF6xBkWu',
    'Medico',
    1,
    3
  );
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (3, 'psico1', 'password123', 'Medico', 1, 1);
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (4, 'fono1', 'password123', 'Auxiliar', 1, 4);
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (5, 'terapeuta1', 'password123', 'Medico', 1, 5);
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    6,
    'trabajosocial',
    '$2b$10$u2Y4xHdC22hQaZnwQzyqUOtR9tNhOUjdm95UNDpnSqjiBj3f83feu',
    'Medico',
    1,
    2
  );
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    7,
    'admin',
    '$2b$10$ofvCShmy9LGsWB6W7PO9jOpzROC3DCeWYTocUMuy9yxSYHr5q.Xbm',
    'Administrador',
    1,
    3
  );
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    8,
    'deysi',
    '$2b$10$xOv05kDCHCq1ZgPDa7d.N.dc2mWBDpYWsQqlef3U88DwkQGvlZNY6',
    'Administrador',
    1,
    1
  );
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    12,
    'ronald',
    '$2b$10$nBCGj5H90IW4W9YtFi0rPemSslCV32JSL8c7nYBkseUoY2En/DAua',
    'Medico',
    1,
    5
  );
INSERT INTO
  `usuario` (
    `Iduser`,
    `Usuario`,
    `Pass`,
    `Rol`,
    `Activo`,
    `Idprof`
  )
VALUES
  (
    14,
    'Maria',
    '$2b$10$kdsuAQWO234x0aBnG1HJDuht4YM2lZuMmGbpTABbhgMz5f.jZgZjm',
    'Medico',
    1,
    2
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
