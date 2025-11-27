<?php
class Clasificacion {

    public $documento;

    public function __construct() {
        $this->documento = "xml/circuitoEsquema.xml";
    }

    public function consultar() {
        if (!file_exists($this->documento)) {
            return false;
        }

        $xml = simplexml_load_file($this->documento);

        if ($xml === false) {
            return false;
        }

        return $xml;
    }
}
?>

<html lang="es">
<head>

    <meta charset="UTF-8" />
    <link rel="icon" href="multimedia/logoFM.ico">
    <title>MotoGP-Clasificaciones</title>
    
    <meta name ="author" content ="Enol Ruiz Barcala" />
    <meta name ="description" content ="pagina de las clasificaciones de MotoGP" />
    <meta name ="keywords" content ="desarrollo,Clasificaciones" />
    <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />

    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
</head>

<body>
<header>
    <h1><a href="index.html">MotoGP Desktop</a></h1>
    <nav>
        <a href="index.html">Inicio</a>
        <a href="piloto.html">Piloto</a> 
        <a href="circuito.html">Circuito</a>
        <a href="meteorologia.html">Meteorología</a>
        <a href="clasificaciones.php" class="active">Clasificaciones</a>
        <a href="juegos.html">Juegos</a>
        <a href="ayuda.html">Ayuda</a>
    </nav>
</header>

<p>Estás en: <a href="index.html">Inicio</a> >>> <strong>Clasificaciones</strong></p>

<main>
<article>
<header>
    <h2>Clasificaciones de MotoGP-Desktop</h2>
</header>

<?php
$clasificacion = new Clasificacion();
$xml = $clasificacion->consultar();

if ($xml === false) {
    echo "<p>Error al cargar el archivo de clasificación.</p>";
    return;
}

// Registrar namespace del XML
$xml->registerXPathNamespace('u', 'http://www.uniovi.es');

// Leer clasificados
$clasificados = $xml->xpath('//u:clasificados/u:persona');

// Si no hay resultados
if (!$clasificados) {
    echo "<p>No se encontraron clasificados en el XML.</p>";
    return;
}

echo "
<h3>Clasificación del Mundial Tras la Carrera</h3>
<table>
    <tr>
        <th scope='col'>Posición</th>
        <th scope='col'>Piloto</th>
    </tr>
";

$posicion = 1;
foreach ($clasificados as $persona) {
    $nombre = htmlspecialchars((string)$persona['nombre']);
    echo "
        <tr>
            <th scope='row'>$posicion</th>
            <td>$nombre</td>
        </tr>
    ";
    $posicion++;
}

echo "</table>";
?>

</article>
</main>

<footer>
    <p>&copy; 2025 MotoGP Desktop - Enol Ruiz Barcala</p>
</footer>

</body>
</html>
