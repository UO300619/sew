<?php
include "configuracionClase.php";
$config = new Configuracion();

$mensaje = "";

if (isset($_POST['accion'])) {
    switch ($_POST['accion']) {
        case 'crear':
            $resultado = $config->crearBD();

            if ($resultado === true) {
                $mensaje = "Base de datos creada correctamente.";
            } elseif ($resultado === "existe") {
                $mensaje = "La base de datos ya existe. No se ha vuelto a crear.";
            } elseif (str_starts_with($resultado, "error:")) {
                $mensaje = "Error al crear la base de datos: " . substr($resultado, 6);
            }
            break;

        case 'reiniciar':
            $config->reiniciarBD();
            $mensaje = "Base de datos reiniciada (datos eliminados).";
            break;

        case 'eliminar':
            $config->eliminarBD();
            $mensaje = "Base de datos eliminada.";
            break;

        case 'exportar':
            $config->exportarCSV();
            $mensaje = "Datos exportados a exportacion.csv.";
            break;
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="../multimedia/logoFM.ico">
    <title>Configuración BD</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
</head>

<body>
    <header>
    	<h1><a href="../index.html">MotoGP Desktop</a></h1>
		<nav>
			<a href="../index.html" title="Página principal">Inicio</a>
			<a href="../piloto.html" title="Información del piloto">Piloto</a>	
			<a href="../circuito.html" title="Circuito de la carrera">Circuito</a>
			<a href="../meteorologia.html" title="Meteorologia del dia">Meteorología</a>
			<a href="../clasificaciones.php" title="Clasificaciones de la carrera">Clasificaciones</a>
			<a href="../juegos.html" title="Juegos de MotoGP"  class="active">Juegos</a>
			<a href="../ayuda.html" title="Ayuda sobre la pagina">Ayuda</a>
		</nav>
    </header>
<p>Estás en: <a href="../index.html">Inicio</a> >>> <a href="../juegos.html">Juegos</a> >>> <strong>Configuración de Base de Datos</strong></p>
<main>

<h1>Configuración de Base de Datos</h1>

<?php if ($mensaje != ""): ?>
<p><strong><?= $mensaje ?></strong></p>
<?php endif; ?>

<form method="POST">

    <button name="accion" value="crear">Crear Base de Datos</button><br><br>

    <button name="accion" value="reiniciar">Reiniciar Base de Datos</button><br><br>

    <button name="accion" value="eliminar" onclick="return confirm('¿Seguro?')">Eliminar Base de Datos</button><br><br>

    <button name="accion" value="exportar">Exportar datos a CSV</button>

</form>
</main>
<footer>
        <p>&copy; 2025 MotoGP Desktop - Enol Ruiz Barcala</p>
</footer>

</body>
</html>
