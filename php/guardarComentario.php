<?php

include("configuracionClase.php");

$config = new Configuracion();
$conn = $config->conectarBD();

$id = $_POST["id_usuario"];
$comentario = $_POST["comentario"];

$stmt = $conn->prepare("
    INSERT INTO Comentarios_Facilitador (id_usuario, comentarios_facilitador)
    VALUES (?, ?)
");

$stmt->bind_param("is", $id, $comentario);
$stmt->execute();

$stmt->close();
$conn->close();

echo "<h1>Comentario guardado correctamente</h1>";
echo "<p><a href='../juegos.html'>Volver</a></p>";
