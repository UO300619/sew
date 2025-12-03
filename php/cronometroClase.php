<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Cronometro {

    public function arrancar() {
        $_SESSION["cronometro_inicio"] = microtime(true);
        unset($_SESSION["cronometro_fin"]);
    }

    public function parar() {
        if (isset($_SESSION["cronometro_inicio"])) {
            $_SESSION["cronometro_fin"] = microtime(true);
        }
    }

    public function tiempoTranscurrido() {
        if (!isset($_SESSION["cronometro_inicio"])) return 0;

        $fin = $_SESSION["cronometro_fin"] ?? microtime(true);
        return $fin - $_SESSION["cronometro_inicio"];
    }

    public function mostrar() {
        $t = $this->tiempoTranscurrido();

        $min = floor($t / 60);
        $seg = floor($t % 60);
        $dec = floor(($t - floor($t)) * 10);

        return sprintf("%02d:%02d.%01d", $min, $seg, $dec);
    }
}



if(!isset($_SESSION["cronometro"])) {
    $_SESSION["cronometro"] = new Cronometro();
}

$cronometro = $_SESSION["cronometro"];
$salida = "";

if(isset($_POST["accion"])) {
    switch($_POST["accion"]) {
        case "arrancar":
            $cronometro->arrancar();
            $salida = "Cronómetro arrancado.";
            break;

        case "parar":
            $cronometro->parar();
            $salida = "Cronómetro parado.";
            break;

        case "mostrar":
            $salida = "Tiempo transcurrido: " . $cronometro->mostrar();
            break;
    }
}
?>