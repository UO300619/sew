
class  Ciudad{
     constructor (nombre,pais,gentilicio){
        this.nombre=nombre;
        this.pais=pais;
        this.gentilicio=gentilicio;
    }

    rellenarPoblacionYCoordenada(){
        this.poblacion=402.739;
        this.coordenada="49.2066944,16.486389";
    }

    getNombre(){
        return this.nombre;
    }

    getPais(){
        return this.pais;
    }

    getPoblacionAndGentilicio(){
        return `<ul>
            <li>Poblacion: ${this.poblacion} </li>
            <li>Gentilicio: ${this.gentilicio}</li>
        </ul>`;
    }

    writeCoordenadas(){
        document.write('<p>Coordenada:' + this.coordenada + '</p>');
    }

}