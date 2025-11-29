CREATE DATABASE IF NOT EXISTS water_quality_db;
USE water_quality_db;

-- Tabla de mediciones históricas
CREATE TABLE IF NOT EXISTS mediciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tds FLOAT NOT NULL,
    temperatura FLOAT NOT NULL,
    turbidez FLOAT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('normal', 'alerta', 'critico') DEFAULT 'normal',
    origen VARCHAR(50) DEFAULT 'esp32_1'
);

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'tds', 'temperatura', 'turbidez'
    valor FLOAT NOT NULL,
    nivel ENUM('advertencia', 'critico') NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    atendida BOOLEAN DEFAULT FALSE
);
