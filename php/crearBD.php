<?php

$host = "Local";
$usuario = "DBUSER2025";
$contraseña = "DBPSWD2025";
$archivoSQL = "crearBD.sql";


echo "<h3>Creando base de datos...</h3>";

$conexion = new mysqli($host, $usuario, $contraseña);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

echo "Conexión establecida.<br>";

$sql = file_get_contents($archivoSQL);

if ($sql === false) {
    die("No se pudo leer el archivo SQL.");
}

echo "Archivo SQL cargado.<br>";

if ($conexion->multi_query($sql)) {

    do {
        if ($resultado = $conexion->store_result()) {
            $resultado->free();
        }

    } while ($conexion->more_results() && $conexion->next_result());

    echo "<strong>Base de datos y tablas creadas correctamente.</strong>";

} else {

    echo "<strong>Error ejecutando SQL:</strong><br>";
    echo $conexion->error;

}

$conexion->close();
?>