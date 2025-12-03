<?php

class Configuracion {
    private $host = "localhost";
    private $usuario = "DBUSER2025";
    private $contraseña = "DBPSWD2025";
    private $baseDatos = "UO300619_DB";

    private function conectar() {
        return new mysqli($this->host, $this->usuario, $this->contraseña);
    }

    public function conectarBD() {
        $conexion = $this->conectar();
        $conexion->select_db($this->baseDatos);
        return $conexion;
    }

   
    public function crearBD($archivoSQL = "crearBD.sql") {
        $conexion = $this->conectar();


        $existe = $conexion->query("SHOW DATABASES LIKE '$this->baseDatos'");

        if ($existe && $existe->num_rows > 0) {

            return "existe";
        }


        $sql = file_get_contents($archivoSQL);
        if ($sql === false) return false;

        if ($conexion->multi_query($sql)) {
            while ($conexion->more_results() && $conexion->next_result()) {}
            return true;
        } else {
            return "error:" . $conexion->error;
        }
    }

    public function reiniciarBD() {
        $conexion = $this->conectar();
        $conexion->select_db($this->baseDatos);

        $tablas = ["Comentarios_Facilitador", "Resultados", "Usuarios"];

        foreach ($tablas as $tabla) {
            $conexion->query("DELETE FROM $tabla");
        }

        return true;
    }


    public function eliminarBD() {
        $conexion = $this->conectar();
        return $conexion->query("DROP DATABASE IF EXISTS $this->baseDatos");
    }


    public function exportarCSV($archivo = "exportacion.csv") {
        $conexion = $this->conectar();
        $conexion->select_db($this->baseDatos);

        $consulta = $conexion->query("
            SELECT 
                Usuarios.id AS usuario_id,
                profesion,
                edad,
                Generos.descripcion AS genero,
                NivelesPericia.descripcion AS pericia,
                Dispositivos.descripcion AS dispositivo,
                tiempo,
                completada,
                comentarios_usuario,
                propuestas,
                valoracion,
                Comentarios_Facilitador.comentarios_facilitador
            FROM Usuarios
            LEFT JOIN Resultados ON Usuarios.id = Resultados.id_usuario
            LEFT JOIN Comentarios_Facilitador ON Usuarios.id = Comentarios_Facilitador.id_usuario
            LEFT JOIN Generos ON Usuarios.id_genero = Generos.id
            LEFT JOIN NivelesPericia ON Usuarios.id_pericia = NivelesPericia.id
            LEFT JOIN Dispositivos ON Resultados.id_dispositivo = Dispositivos.id
        ");

        $archivoCSV = fopen($archivo, "w");

        // encabezados
        fputcsv($archivoCSV, array_keys($consulta->fetch_assoc()));
        $consulta->data_seek(0);

        // datos
        while ($fila = $consulta->fetch_assoc()) {
            fputcsv($archivoCSV, $fila);
        }

        fclose($archivoCSV);

        return true;
    }
}
?>
