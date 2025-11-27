CREATE DATABASE UO300619_DB;
USE UO300619_DB;

CREATE TABLE Generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE NivelesPericia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesion VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    id_genero INT NOT NULL,
    id_pericia INT NOT NULL,
    FOREIGN KEY (id_genero) REFERENCES Generos(id),
    FOREIGN KEY (id_pericia) REFERENCES NivelesPericia(id),
    CHECK (edad > 0)
);

-- Tabla de Resultados
CREATE TABLE Resultados (
    id_usuario INT PRIMARY KEY,
    id_dispositivo INT NOT NULL,
    tiempo INT NOT NULL,
    completada BOOLEAN NOT NULL,
    comentarios_usuario VARCHAR(255),
    propuestas VARCHAR(255),
    valoracion INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id),
    FOREIGN KEY (id_dispositivo) REFERENCES Dispositivos(id),
    CHECK (valoracion BETWEEN 0 AND 10)
);

-- Tabla de Comentarios del Facilitador
CREATE TABLE Comentarios_Facilitador (
    id_usuario INT PRIMARY KEY,
    comentarios_facilitador VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id)
);

INSERT INTO Generos (descripcion) VALUES ('Masculino'), ('Femenino'), ('Otro'), ('Prefiero no decirlo');
INSERT INTO NivelesPericia (descripcion) VALUES ('Baja'), ('Media'), ('Alta');
INSERT INTO Dispositivos (descripcion) VALUES ('Ordenador'), ('Tableta'), ('Teléfono');