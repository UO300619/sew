class Noticias {
    constructor(busqueda = '') {
        this.busqueda = String(busqueda);
        this.url = 'https://api.thenewsapi.com/v1/news/all';
        this.apiKey = '';
    }

    setBusqueda(term) { this.busqueda = String(term); }
    setApiKey(key) { this.apiKey = String(key); }

    buscar() {
        if (!this.apiKey) return Promise.reject(new Error('API key no establecida. Use setApiKey(apiKey).'));
        const params = new URLSearchParams({
            api_token: this.apiKey,
            language: 'es',
            search: this.busqueda || '',
            page: '1',
            limit: '10'
        });
        const endpoint = `${this.url}?${params.toString()}`;
        return fetch(endpoint)
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta de la API: ' + response.status);
                return response.json();
            })
            .then(json => {
                const articles = json.data || json.articles || [];
                return { source: 'thenewsapi', raw: json, articles: Array.isArray(articles) ? articles : [] };
            });
    }

    procesarInformacion(jsonObj) {
        const src = jsonObj || null;
        if (!src) return null;
        const rawArticles = src.data || src.articles || (src.raw && (src.raw.data || src.raw.articles)) || [];
        const articles = Array.isArray(rawArticles) ? rawArticles : [];
        const noticias = articles.map(a => ({
            title: a.title || a.headline || null,
            description: a.description || a.summary || a.excerpt || null,
            url: a.url || a.link || a.source_url || null,
            image: a.image_url || a.image || a.media || null,
            author: a.author || (a.source && a.source.name) || null,
            source: (a.source && (a.source.name || a.source_id)) || a.source || null,
            published_at: a.published_at || a.published || a.publishedAt || null,
            raw: a
        }));
        return {
            total: noticias.length,
            noticias: noticias,
            metadata: { origen: 'thenewsapi', busqueda: this.busqueda || null },
            source_raw: src
        };
    }

    // -------------------------------
    // Nuevo método: inicializa noticias en un contenedor específico
    // -------------------------------
    inicializarEn(mainSelector) {
        const main = $(mainSelector);
        const contNoticias = $('<section>').appendTo(main);
        contNoticias.append($('<h2>').text('Noticias sobre MotoGP'));

        this.buscar()
            .then(response => {
                let procesado;
                if (response && Array.isArray(response.articles)) {
                    procesado = { total: response.articles.length, noticias: response.articles, source_raw: response.raw || response };
                } else if (typeof this.procesarInformacion === 'function') {
                    procesado = this.procesarInformacion(response);
                } else {
                    procesado = { total: 0, noticias: [] };
                }

                if (!procesado || !Array.isArray(procesado.noticias) || procesado.noticias.length === 0) {
                    contNoticias.append($('<p>').text('No se han encontrado noticias.'));
                    return;
                }

                const listado = $('<section>');
                procesado.noticias.forEach(item => {
                    const title = item.title || item.headline || item.name || 'Sin titular';
                    const desc = item.description || item.summary || item.excerpt || '';
                    const url = item.url || item.link || item.source_url || '#';
                    const source = (item.source && (item.source.name || item.source)) || item.author || 'Desconocida';
                    
                    listado.append($('<h3>').text(title));
                    const art = $('<article>');
                    art.append($('<h4>').append($('<a>').attr('href', url).attr('target', '_blank').text(title)));
                    if (desc) art.append($('<p>').text(desc));
                    art.append($('<p>').append($('<small>').text('Fuente: ' + source)));
                    listado.append(art);
                });
                contNoticias.append(listado);
            })
            .catch(err => {
                contNoticias.append($('<p>').text('Error al obtener noticias: ' + (err && err.message ? err.message : err)));
                console.error('Error en buscar():', err);
            });
    }
}
