class Circuito {
    constructor() {
        this.comprobarApiFile();
        this.configurarInput();
    }

    comprobarApiFile() {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            document.body.insertAdjacentHTML(
                "afterbegin",
                "<p>Tu navegador no soporta la API File. No se puede cargar HTML.</p>"
            );
            return false;
        }
        return true;
    }



    configurarInput() {
        const input = document.querySelector("article section label input");
        if (input) {
            input.addEventListener("change", (event) => this.leerArchivoHTML(event));
        }
    }

    leerArchivoHTML(event) {
        const archivo = event.target.files[0];
        if (!archivo) {
            alert("No se ha seleccionado ningún archivo.");
            return;
        }

        const lector = new FileReader();
        lector.onload = (e) => {
            const contenido = e.target.result;
            this.procesarContenido(contenido);
        };
        lector.readAsText(archivo);
    }

    procesarContenido(contenido) {
        const parser = new DOMParser();
        const docHTML = parser.parseFromString(contenido, "text/html");

        const contenedor = document.querySelector("main article section");
        contenedor.innerHTML = "";



        const datosGenerales = docHTML.querySelector("dl");
        if (datosGenerales) {
            contenedor.insertAdjacentHTML("beforeend", "<h3>Datos generales</h3>");
            contenedor.insertAdjacentHTML("beforeend", datosGenerales.outerHTML);
        }


        const referencias = docHTML.querySelector("section:nth-of-type(2) ul");
        if (referencias) {
            contenedor.insertAdjacentHTML("beforeend", "<h3>Referencias</h3>");
            contenedor.insertAdjacentHTML("beforeend", referencias.outerHTML);
        }


        const imagenes = docHTML.querySelector("section:nth-of-type(3) section");
        if (imagenes) {
            contenedor.insertAdjacentHTML("beforeend", "<h3>Imágenes</h3>");
            contenedor.insertAdjacentHTML("beforeend", imagenes.outerHTML);
        }


        const resultados = docHTML.querySelector("section:nth-of-type(5)");
        if (resultados) {
            contenedor.insertAdjacentHTML("beforeend", "<h3>Resultados</h3>");
            contenedor.insertAdjacentHTML("beforeend", resultados.outerHTML);
        }



    }
}


class CargadorSVG {
    constructor() {
        this.comprobarApiFile();
        this.configurarInput();
    }

    comprobarApiFile() {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            document.body.insertAdjacentHTML(
                "afterbegin",
                "<p>Tu navegador no soporta la API File. No se puede cargar SVG.</p>"
            );
            return false;
        }
        return true;
    }

    configurarInput() {
        const input = document.querySelector("main article > section:nth-of-type(2) input[type='file']");

        if (input) {
            input.addEventListener("change", (event) => this.leerArchivoSVG(event));
        } else {
            console.error("No se encontró el input del segundo <section>.");
        }
    }

    leerArchivoSVG(event) {
        const archivo = event.target.files[0];
        if (!archivo) {
            alert("No se ha seleccionado ningún archivo SVG.");
            return;
        }

        if (!archivo.name.endsWith(".svg")) {
            alert("Por favor, selecciona un archivo con extensión .svg");
            return;
        }

        const lector = new FileReader();

        lector.onload = (e) => {
            const contenidoSVG = e.target.result;
            contenidoSVG.querySelector("svg").attr('xmlns', 'http://www.w3.org/2000/svg').attr('version', '1.1');
            this.insertarSVG(contenidoSVG);
        };

        lector.readAsText(archivo);
    }

    insertarSVG(svgTexto) {

        const contenedor = document.querySelector("main article > section:nth-of-type(2)");

        if (!contenedor) {
            console.error("No se encontró el segundo <section> para insertar el SVG.");
            return;
        }

        contenedor.innerHTML = "";


        const encabezado = document.createElement("h3");
        encabezado.textContent = "SVG cargado";
        contenedor.appendChild(encabezado);


        contenedor.insertAdjacentHTML("beforeend", svgTexto);

    }
}


class CargadorKML {
    constructor(map) {
        this.map = map;
        this.comprobarApiFile();
        this.configurarInput();
    }

    comprobarApiFile() {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            document.body.insertAdjacentHTML(
                "afterbegin",
                "<p>Tu navegador no soporta la API File. No se puede cargar KML.</p>"
            );
            return false;
        }
        return true;
    }

    configurarInput() {
        const input = document.querySelector(
            "main article > section:nth-of-type(3) input[type='file']"
        );

        if (input) {
            input.addEventListener("change", (event) => this.leerArchivoKML(event));
        } else {
            console.error("No se encontró el input del archivo KML.");
        }
    }

    leerArchivoKML(event) {
        const archivo = event.target.files[0];

        if (!archivo) {
            alert("No has seleccionado ningún archivo KML.");
            return;
        }

        if (!archivo.name.endsWith(".kml")) {
            alert("Por favor selecciona un archivo con extensión .kml");
            return;
        }

        const lector = new FileReader();

        lector.onload = (e) => {
            const contenido = e.target.result;

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(contenido, "text/xml");

            // Origen
            const nodoPunto = xmlDoc.querySelector("Point > coordinates");
            let origen = null;
            if (nodoPunto) {
                const [lon, lat] = nodoPunto.textContent.trim().split(",").map(Number);
                origen = [lon, lat];
            }

            // Tramos
            const nodosLineas = xmlDoc.querySelectorAll("LineString > coordinates");
            const tramos = [];
            nodosLineas.forEach(ls => {
                const textoCoords = ls.textContent.trim();
                const coords = textoCoords.split(/\s+/).map(pair => {
                    const [lon, lat] = pair.split(",").map(Number);
                    return [lon, lat];
                });
                tramos.push(coords);
            });

            this.insertarCapaKML(origen, tramos);
        };

        lector.readAsText(archivo);
    }

    insertarCapaKML(origen, tramos) {
        if (!this.map) return;

        // Marcador
        if (origen) {
            new mapboxgl.Marker({ color: "blue" })
                .setLngLat(origen)
                .addTo(this.map);

            this.map.flyTo({ center: origen, zoom: 14 });
        }

        if (tramos.length === 0) return;

        const geojson = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: tramos[0]
            }
        };

        if (this.map.getSource("circuito")) {
            this.map.getSource("circuito").setData(geojson);
        } else {
            this.map.addSource("circuito", { type: "geojson", data: geojson });

            this.map.addLayer({
                id: "trazado",
                type: "line",
                source: "circuito",
                paint: {
                    "line-width": 4,
                    "line-color": "#ff0000"
                }
            });
        }

        const bounds = new mapboxgl.LngLatBounds();
        tramos[0].forEach(c => bounds.extend(c));
        this.map.fitBounds(bounds, { padding: 20 });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZW5vbHJ1aXoiLCJhIjoiY21pNjFtcHZjMWVpNDJ3cXZ3cm5nbTk0aSJ9.-vWFwMCSPSC2zigmHTDtcw';

    // Crear div dinámico para el mapa
    const mapDiv = document.createElement("div");
    mapDiv.style.width = "100%";
    mapDiv.style.height = "500px";
    document.body.appendChild(mapDiv);

    // Inicializar Mapbox
    const map = new mapboxgl.Map({
        container: mapDiv,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [16.44528, 49.20278],
        zoom: 13
    });

    map.on('load', () => map.resize());

    // Inicializar clases
    new Circuito();
    new CargadorSVG();
    new CargadorKML(map); // pasamos el mapa a la clase
});

