class Cronometro {
    constructor() {
        this.tiempo = 0;      // tiempo acumulado en milisegundos
        this.inicio = null;   // instante en el que se inicia o reanuda
        this.corriendo = null; // id del intervalo activo
        this.usandoTemporal = false; // true si se usa Temporal
    }

    arrancar() {
        // Evita crear más de un intervalo
        if (this.corriendo) return;

        try {
            const ahora = Temporal.Now.instant();
            this.usandoTemporal = true;

            if (this.tiempo > 0) {
                // Si ya había tiempo acumulado (reanudamos)
                const dur = Temporal.Duration.from({ milliseconds: this.tiempo });
                this.inicio = ahora.subtract(dur);
            } else {
                // Primera vez que arranca
                this.inicio = ahora;
            }

        } catch (error) {
            // Fallback si Temporal no está disponible
            this.usandoTemporal = false;
            const ahora = new Date();

            if (this.tiempo > 0) {
                // Si ya había tiempo acumulado, restamos ese tiempo
                this.inicio = new Date(ahora.getTime() - this.tiempo);
            } else {
                this.inicio = ahora;
            }
        }

        // Actualiza cada décima de segundo (100 ms)
        this.corriendo = setInterval(this.actualizar.bind(this), 100);
        this.actualizar(); // actualiza inmediatamente
    }

    actualizar() {
        try {
            if (this.usandoTemporal) {
                const ahora = Temporal.Now.instant();
                const duracion = ahora.since(this.inicio, { largestUnit: "milliseconds" });
                this.tiempo = Math.round(duracion.total({ unit: "milliseconds" }));
            } else {
                const ahora = new Date();
                this.tiempo = ahora.getTime() - this.inicio.getTime();
            }
        } catch (error) {
            // Fallback seguro
            const ahora = new Date();
            if (this.inicio instanceof Date)
                this.tiempo = ahora.getTime() - this.inicio.getTime();
        }

        this.mostrar();
    }

    mostrar() {
        const minutos = parseInt(this.tiempo / 60000, 10);
        const segundos = parseInt((this.tiempo % 60000) / 1000, 10);
        const decimas = parseInt((this.tiempo % 1000) / 100, 10);

        const mm = String(minutos).padStart(2, "0");
        const ss = String(segundos).padStart(2, "0");

        let cadena = mm + ":" + ss + "." + decimas;

        const parrafo = document.getElementById("pantalla") || document.querySelector("main p");
        if (parrafo) parrafo.textContent = cadena;
    }

    parar() {
        if (this.corriendo) {
            clearInterval(this.corriendo);
            this.corriendo = null;
        }
    }

    reiniciar() {
        if (this.corriendo) {
            clearInterval(this.corriendo);
            this.corriendo = null;
        }
        this.tiempo = 0;
        this.inicio = null;
        this.mostrar();
    }
}