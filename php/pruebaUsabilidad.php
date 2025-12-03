<?php
include("cronometroClase.php");
include("configuracionClase.php");

$cronometro = new Cronometro(); 
$config = new Configuracion();

$pruebaTerminada = false;
$idUsuarioInsertado = null;
$tiempoFinal = null;


if (isset($_POST["accion"]) && $_POST["accion"] === "iniciar") {  
    $cronometro->arrancar();
}


if (isset($_POST["accion"]) && $_POST["accion"] === "terminar") {

    $cronometro->parar();
    $tiempoFinal = $cronometro->tiempoTranscurrido();

    $conn = $config->conectarBD();
    if ($conn->connect_errno) {
        die("Error conexión: " . $conn->connect_error);
    }
    $conn->query("INSERT INTO Usuarios (profesion, edad, id_genero, id_pericia)
                  VALUES ('No indicado', 20, 1, 1)");
    $idUsuarioInsertado = $conn->insert_id;

    $stmt = $conn->prepare("
        INSERT INTO Resultados (id_usuario, id_dispositivo, tiempo, completada, comentarios_usuario, propuestas, valoracion)
        VALUES (?, 1, ?, TRUE, '', '', 0)
    ");

    $stmt->bind_param("ii", $idUsuarioInsertado, $tiempoFinal);
    $stmt->execute();

    $stmt->close();
    $conn->close();

    $pruebaTerminada = true;
}
?>

<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" href="../multimedia/logoFM.ico">
    <title>Prueba de Usabilidad</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
</head>

<body>

<main>
    <h1>Prueba de Usabilidad del Proyecto MotoGP-Desktop</h1>


    <?php if (!isset($_POST["accion"])): ?>
        <form method="POST">
            <button type="submit" name="accion" value="iniciar">Iniciar prueba</button>
        </form>
        <?php exit; ?>
    <?php endif; ?>


    <?php if ($pruebaTerminada): ?>
        <h2>La prueba ha finalizado correctamente</h2>

        <p><em>El tiempo real no se muestra al usuario.</em></p>

        <h3>Comentarios del facilitador</h3>

        <form method="POST" action="guardarComentario.php">
            <input type="hidden" name="id_usuario" value="<?= $idUsuarioInsertado ?>">

            <label for="comentario">Comentarios adicionales:</label>
            <textarea id="comentario" name="comentario"></textarea>
            <br><br>

            <button type="submit">Guardar comentario</button>
        </form>

        <?php exit; ?>
    <?php endif; ?>




    <form method="POST">

        <h2>Responde a las siguientes 10 preguntas</h2>
        <p>Debes responder todas las preguntas antes de terminar la prueba.</p>

        <ol>
            <li>
                <label for="p1">¿Cuál es el nombre del piloto principal del proyecto?</label>
                <input id="p1" type="text" name="p1" required />
            </li>

            <li>
                <label for="p2">¿En qué categoría compite Franco Morbidelli?</label>
                <input id="p2" type="text" name="p2" required />
            </li>

            <li>
                <label for="p3">¿Cuál es la escudería actual de Morbidelli?</label>
                <input id="p3" type="text" name="p3" required />
            </li>

            <li>
                <label for="p4">¿Qué altura tiene?</label>
                <input id="p4" type="text" name="p4" required />
            </li>

            <li>
                <label for="p5">¿Cuál es el circuito principal del proyecto?</label>
                <input id="p5" type="text" name="p5" required />
            </li>

            <li>
                <label for="p6">¿Qué juego aparece primero en la sección Juegos?</label>
                <input id="p6" type="text" name="p6" required />
            </li>

            <li>
                <label for="p7">¿Qué información meteorológica se muestra?</label>
                <textarea id="p7" name="p7" required></textarea>
            </li>

            <li>
                <label for="p8">¿Qué top aparece en la sección Clasificaciones?</label>
                <input id="p8" type="text" name="p8" required />
            </li>

            <li>
                <label for="p9">¿Qué contenido se muestra en Ayuda?</label>
                <textarea id="p9" name="p9" required></textarea>
            </li>

            <li>
                <label for="p10">¿Donde aparecen las noticias?</label>
                <textarea id="p10" name="p10" required></textarea>
            </li>
        </ol>

        <br>
        <button type="submit" name="accion" value="terminar">Terminar prueba</button>

    </form>

</main>
<footer>
    <p>&copy; 2025 MotoGP Desktop - Enol Ruiz Barcala</p>
</footer>

</body>
</html>
