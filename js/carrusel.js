class Carrusel {
    constructor(busqueda = '') {
        this.busqueda = String(busqueda); 
        this.actual = 0;                  
        this.maximo = 4;                  
        this.fotos = [];                 
        this._intervalId = null;         
        this._targetSelector = null;      
    }

    _normalizarSrc(src) {
        if (!src || typeof src !== 'string') return '';
        return src.replace(/_(?:s|q|t|m|n|z|c|b|h|k)\.(jpg|jpeg|png)$/i, '_z.$1');
    }

    getFotografias(onSuccess, onError) {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
        const self = this;
        return $.getJSON(flickrAPI, {
            tags: this.busqueda,
            tagmode: "any",
            format: "json"
        })
        .done(function(data) {
            try {
                const fotos = self.procesarJSONFotografias(data, 5);
                self.fotos = fotos.slice(0, self.maximo);
                if (typeof onSuccess === 'function') onSuccess({ fotos: self.fotos });
            } catch (err) {
                if (typeof onError === 'function') onError(err);
            }
        })
        .fail(function(jqxhr, textStatus, error) {
            if (typeof onError === 'function') onError(new Error("Fallo al obtener fotos de Flickr: " + (error || textStatus)));
        });
    }

    procesarJSONFotografias(jsonObj, cantidad = 5) {
        if (!jsonObj) return [];
        const entradas = [];
        if (Array.isArray(jsonObj.items)) {
            for (const it of jsonObj.items) {
                entradas.push({ src: (it.media && it.media.m) || '', title: it.title || '', author: it.author || '' });
            }
        } else if (Array.isArray(jsonObj.fotos)) {
            for (const f of jsonObj.fotos) {
                entradas.push({ src: f.src || '', title: f.title || '', author: f.author || '' });
            }
        } else if (Array.isArray(jsonObj)) {
            for (const it of jsonObj) {
                entradas.push({ src: (it.media && it.media.m) || it.src || '', title: it.title || '', author: it.author || '' });
            }
        } else {
            return [];
        }

        const resultado = [];
        const vistos = new Set();
        for (const e of entradas) {
            const src = this._normalizarSrc(e.src);
            if (!src) continue;
            if (vistos.has(src)) continue;
            vistos.add(src);
            resultado.push({ src, title: e.title || '', author: e.author || '' });
            if (resultado.length >= cantidad) break;
        }
        return resultado;
    }

    mostrarFotografias(target = 'main') {
        const destino = $(target);
        this._targetSelector = target;
        const nombre = this.busqueda || 'circuito';

        const insertar = (fotos) => {
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = null;
            }
            this.actual = 0;

            const art = $('<article>');

            if (Array.isArray(fotos) && fotos.length > 0) {
                const f = fotos[0];
                const img = $('<img>').attr('src', f.src).attr('alt', `Imagen del ${nombre}`);
                const cap = $('<p>').text(f.title || f.author || '');
                art.append(img).append(cap);
                if (destino.length) destino.append(art); else $('body').append(art);

                this.fotos = fotos.slice(0, this.maximo);
                this._intervalId = setInterval(this.cambiarFotografia.bind(this), 3000);
            } else {
                art.append($('<p>').text('No se han encontrado imágenes.'));
                if (destino.length) destino.append(art); else $('body').append(art);
            }
        };

        if (this.fotos && this.fotos.length > 0) {
            insertar(this.fotos);
            return;
        }

        this.getFotografias((res) => {
            const fotos = (res && res.fotos) ? res.fotos : [];
            insertar(fotos);
        }, (err) => {
            const art = $('<article>')
                .append($('<h2>').text(`Imágenes del circuito de ${nombre}`))
                .append($('<p>').text('Error al obtener imágenes.'));
            if (destino.length) destino.append(art); else $('body').append(art);
            console.error(err);
        });
        
    }

    cambiarFotografia() {
        const nombre = this.busqueda || 'circuito';
        const fotosDisponibles = Math.min(this.maximo, this.fotos.length || 0);
        if (fotosDisponibles === 0) return;

        this.actual = (this.actual + 1) % fotosDisponibles;
        const $lastArticle = $(this._targetSelector).find('article').last();
        let $img = $lastArticle.find('img').first();
        let $cap = $lastArticle.find('p').first();

        const foto = this.fotos[this.actual];
        if ($img.length && foto) $img.attr('src', foto.src).attr('alt', `Imagen del ${nombre}`);
        if ($cap.length && foto) $cap.text(foto.title || foto.author || '');
    }
    inicializarEn(mainSelector) {
        const main = $(mainSelector);
        const articuloBienvenida = main.find('article').first();
        const contCarrusel = $('<section>').insertAfter(articuloBienvenida);
        contCarrusel.append($('<h2>').text('Imágenes del circuito de Brno'));
        this.mostrarFotografias(contCarrusel);
        
    }
}
