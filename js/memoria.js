class Memoria {
    constructor() {
        this.primera_carta = null;
        this.segunda_carta = null;
        this.tablero_bloqueado = false;

        this.cartas = Array.from(document.querySelectorAll("main article"));
        this.barajarCartas();

        this.crono = new Cronometro();
        this.crono.arrancar();
        
    }

    barajarCartas() {
        const main = document.querySelector("main");
        const cartas = [...this.cartas];

        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }

        cartas.forEach(carta => main.appendChild(carta));
    }

    flip(card) {
        if (this.tablero_bloqueado) return;
        if (card.dataset.state === "flip") return;

        card.dataset.state = "flip";

        if (!this.primera_carta) {
            this.primera_carta = card;
            return;
        }

        this.segunda_carta = card;
        this.tablero_bloqueado = true;

        this.comprobarPareja();
    }

    comprobarPareja() {
        const img1 = this.primera_carta.querySelector("img").src;
        const img2 = this.segunda_carta.querySelector("img").src;

        img1 === img2 ? this.deshabilitarCartas() : this.cubrirCartas();
    }

    deshabilitarCartas() {
        this.primera_carta.removeAttribute("onclick");
        this.segunda_carta.removeAttribute("onclick");
        this.comprobarFinJuego();

        this.reiniciar();
    }

    cubrirCartas() {
        setTimeout(() => {
            this.primera_carta.removeAttribute("data-state");
            this.segunda_carta.removeAttribute("data-state");
            this.reiniciar();
        }, 1000);
    }

    reiniciar() {
        this.primera_carta = null;
        this.segunda_carta = null;
        this.tablero_bloqueado = false;
    }

    comprobarFinJuego() {
        const cartas = document.querySelectorAll("main article");
        const todasReveladas = Array.from(cartas).every(
            carta => carta.dataset.state === "flip"
        );

        if (todasReveladas) {
            this.crono.parar();
            alert("¡Has ganado!");
        }
    }

}