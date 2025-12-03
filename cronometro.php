<?php
include("php/cronometroClase.php");
?>
<html lang="es">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="multimedia/logoFM.ico">
        <title>MotoGP-Cronometro</title>
        <meta name ="author" content ="Enol Ruiz Barcala" />
        <meta name ="description" content ="pagina de Franco Morbidelli de MotoGP" />
        <meta name ="keywords" content ="Moto2,MotoGP,Franco,Morbidelli,campeón,Pertamina,Enduro,Petronas,Yamaha,nacimiento,Fecha,Lugar,Altura,Peso,Dorsal,Moto,Equipos,Conceptos,Puntos" />
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
            <a href="clasificaciones.html">Clasificaciones</a>
            <a href="juegos.html" class="active">Juegos</a>
            <a href="ayuda.html">Ayuda</a>
        </nav>
        </header>

        <p>Estás en: <a href="index.html">Inicio</a> >>> 
           <a href="juegos.html">Juegos</a> >>> 
           <strong>Cronómetro</strong></p>

        <main>
            <h2>Prueba del Cronómetro</h2>
            <p><?php echo $salida; ?></p>
            <form method="post">
                <button name="accion" value="arrancar">Arrancar</button>
                <button name="accion" value="parar">Parar</button>
                <button name="accion" value="mostrar">Mostrar tiempo</button>
            </form>
        </main>

        <footer>
            <p>&copy; 2025 MotoGP Desktop - Enol Ruiz Barcala</p>
        </footer>
    </body>      
</html>
