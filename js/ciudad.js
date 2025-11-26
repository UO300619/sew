
class Ciudad {
    constructor(nombre, pais, gentilicio) {
        this.nombre = nombre || '';
        this.pais = pais || '';
        this.gentilicio = gentilicio || '';
        this.poblacion = null;
        this.coordenada = '';
        this.meteorologia = null;
        this.rellenarPoblacionYCoordenada();
    }

    rellenarPoblacionYCoordenada() {
        this.poblacion = 402739;
        this.coordenada = "49.2066944,16.486389";
    }

    getNombre() {
        return this.nombre;
    }

    getPais() {
        return this.pais;
    }

    getPoblacionAndGentilicio() {
        return `<ul>
            <li>Población: ${this.poblacion}</li>
            <li>Gentilicio: ${this.gentilicio}</li>
        </ul>`;
    }

    writeCoordenadas() {
        const p = document.createElement('p');
        p.textContent = "Coordenadas: " + this.coordenada;
        document.body.appendChild(p);
    }

    // Realiza la llamada AJAX a Open-Meteo, almacena resultado en this.meteorologia
    // y notifica mediante eventos jQuery: 'meteorologiaReady' o 'meteorologiaError' en document.
    getMeteorologiaCarrera() {
        const coord = (this.coordenada || '').split(',').map(s => s.trim());
        const lat = parseFloat(coord[0]);
        const lon = parseFloat(coord[1]);

        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            const err = new Error('Coordenadas inválidas. Use formato "lat,lon" en this.coordenada.');
            $(document).trigger('meteorologiaError', [err]);
            return;
        }

        const endpoint = "https://api.open-meteo.com/v1/forecast";
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: [
                'temperature_2m',
                'apparent_temperature',
                'precipitation',
                'relativehumidity_2m',
                'windspeed_10m',
                'winddirection_10m'
            ].join(','),
            daily: ['sunrise', 'sunset'].join(','),
            timezone: 'auto'
        };

        const self = this;
        $.getJSON(endpoint, params)
            .done(function (data) {
                try {
                    const meteorologia = {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        hourly: {
                            time: (data.hourly && data.hourly.time) || [],
                            temperature_2m: (data.hourly && data.hourly.temperature_2m) || [],
                            apparent_temperature: (data.hourly && data.hourly.apparent_temperature) || [],
                            precipitation: (data.hourly && data.hourly.precipitation) || [],
                            relativehumidity_2m: (data.hourly && data.hourly.relativehumidity_2m) || [],
                            windspeed_10m: (data.hourly && data.hourly.windspeed_10m) || [],
                            winddirection_10m: (data.hourly && data.hourly.winddirection_10m) || []
                        },
                        daily: {
                            time: (data.daily && data.daily.time) || [],
                            sunrise: (data.daily && data.daily.sunrise) || [],
                            sunset: (data.daily && data.daily.sunset) || []
                        },
                        metadata: {
                            diarios: ['sunrise', 'sunset'],
                            horarios: ['temperature_2m', 'apparent_temperature', 'precipitation', 'relativehumidity_2m', 'windspeed_10m', 'winddirection_10m']
                        },
                        source_raw: data
                    };

                    self.meteorologia = meteorologia;

                    // Procesar para obtener 'diarios' y 'horariosCarrera' antes de notificar
                    const procesado = (typeof self.procesarJSONCarrera === 'function') ?
                        self.procesarJSONCarrera(meteorologia) :
                        meteorologia;

                    $(document).trigger('meteorologiaReady', [procesado]);
                } catch (e) {
                    self.meteorologia = null;
                    $(document).trigger('meteorologiaError', [e]);
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                const err = new Error('Fallo al obtener datos meteorológicos: ' + (error || textStatus));
                self.meteorologia = null;
                $(document).trigger('meteorologiaError', [err]);
            });
            
    }


    procesarJSONCarrera(jsonObj) {
        const src = jsonObj || this.meteorologia || (this.meteorologia && this.meteorologia.source_raw) || null;
        if (!src) return null;

        const data = (src.hourly && src.hourly.time) ? src : (src.source_raw ? src.source_raw : src);

        const hourly = {
            time: (data.hourly && data.hourly.time) || [],
            temperature_2m: (data.hourly && data.hourly.temperature_2m) || [],
            apparent_temperature: (data.hourly && data.hourly.apparent_temperature) || [],
            precipitation: (data.hourly && data.hourly.precipitation) || [],
            relativehumidity_2m: (data.hourly && data.hourly.relativehumidity_2m) || [],
            windspeed_10m: (data.hourly && data.hourly.windspeed_10m) || [],
            winddirection_10m: (data.hourly && data.hourly.winddirection_10m) || []
        };

        const daily = {
            time: (data.daily && data.daily.time) || [],
            sunrise: (data.daily && data.daily.sunrise) || [],
            sunset: (data.daily && data.daily.sunset) || []
        };

        // construir array de horarios completos
        const horarios = [];
        for (let i = 0; i < hourly.time.length; i++) {
            horarios.push({
                time: hourly.time[i] || null,
                temperature_2m: hourly.temperature_2m[i] !== undefined ? hourly.temperature_2m[i] : null,
                apparent_temperature: hourly.apparent_temperature[i] !== undefined ? hourly.apparent_temperature[i] : null,
                precipitation: hourly.precipitation[i] !== undefined ? hourly.precipitation[i] : null,
                relativehumidity_2m: hourly.relativehumidity_2m[i] !== undefined ? hourly.relativehumidity_2m[i] : null,
                windspeed_10m: hourly.windspeed_10m[i] !== undefined ? hourly.windspeed_10m[i] : null,
                winddirection_10m: hourly.winddirection_10m[i] !== undefined ? hourly.winddirection_10m[i] : null
            });
        }

        // construir array diario
        const diarios = [];
        for (let i = 0; i < daily.time.length; i++) {
            diarios.push({
                date: daily.time[i] || null,
                sunrise: daily.sunrise[i] || null,
                sunset: daily.sunset[i] || null
            });
        }

        // determinar día de la carrera: primer día disponible en daily.time o fecha del primer horario
        const carreraDate = (daily.time && daily.time[0]) ?
            daily.time[0] :
            (horarios[0] && typeof horarios[0].time === 'string' ? horarios[0].time.split('T')[0] : null);

        // filtrar horarios para el día de la carrera
        const horariosCarrera = carreraDate ? horarios.filter(h => {
            const d = (h.time && typeof h.time === 'string') ? h.time.split('T')[0] : null;
            return d === carreraDate;
        }) : horarios.slice(0, 24);

        return {
            ubicacion: {
                latitude: data.latitude || null,
                longitude: data.longitude || null
            },
            diarios: diarios,
            horarios: horarios,
            horariosCarrera: horariosCarrera,
            metadata: {
                diarios: ['sunrise', 'sunset'],
                horarios: ['temperature_2m', 'apparent_temperature', 'precipitation', 'relativehumidity_2m', 'windspeed_10m', 'winddirection_10m']
            },
            source_used: data
        };
    }

     getMeteorologiaEntrenos() {
        const coord = (this.coordenada || '').split(',').map(s => s.trim());
        const lat = parseFloat(coord[0]);
        const lon = parseFloat(coord[1]);

        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            const err = new Error('Coordenadas inválidas. Use formato "lat,lon" en this.coordenada.');
            $(document).trigger('meteorologiaEntrenosError', [err]);
            return;
        }

        //formatear YYYY-MM-DD
        const fmt = (d) => {
            const yy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yy}-${mm}-${dd}`;
        };

        // intentar obtener la fecha de la carrera desde this.meteorologia (si existe)
        let raceDateStr = null;
        if (this.meteorologia && Array.isArray(this.meteorologia.diarios) && this.meteorologia.diarios.length) {
            raceDateStr = this.meteorologia.diarios[0].date || this.meteorologia.diarios[0].time || null;
        } else if (this.meteorologia && this.meteorologia.daily && Array.isArray(this.meteorologia.daily.time) && this.meteorologia.daily.time.length) {
            raceDateStr = this.meteorologia.daily.time[0];
        }

        // si no hay fecha de carrera, usar hoy como referencia
        const raceDate = raceDateStr ? new Date(raceDateStr) : new Date();

        // entrenamientos: 3 días previos
        const startDate = new Date(raceDate);
        startDate.setDate(startDate.getDate() - 3);
        const endDate = new Date(raceDate);
        endDate.setDate(endDate.getDate() - 1);

        const start_date = fmt(startDate);
        const end_date = fmt(endDate);

        const endpoint = "https://api.open-meteo.com/v1/forecast";
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: [
                'temperature_2m',
                'precipitation',
                'windspeed_10m',
                'relativehumidity_2m'
            ].join(','),
            timezone: 'auto',
            start_date: start_date,
            end_date: end_date
        };

        const self = this;
        $.getJSON(endpoint, params)
            .done(function (data) {
                try {
                    // construir estructura horaria para las franjas pedidas
                    const hourly = data.hourly || {};
                    const times = Array.isArray(hourly.time) ? hourly.time : [];
                    const temps = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
                    const precs = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];
                    const winds = Array.isArray(hourly.windspeed_10m) ? hourly.windspeed_10m : [];
                    const hums = Array.isArray(hourly.relativehumidity_2m) ? hourly.relativehumidity_2m : [];

                    const entrenos = [];
                    for (let i = 0; i < times.length; i++) {
                        const t = times[i];
                        // comprobar que la fecha t está dentro de start_date..end_date
                        const fecha = (typeof t === 'string') ? t.split('T')[0] : null;
                        if (!fecha) continue;
                        if (fecha < start_date || fecha > end_date) continue;
                        entrenos.push({
                            time: t,
                            temperature_2m: temps[i] !== undefined ? temps[i] : null,
                            precipitation: precs[i] !== undefined ? precs[i] : null,
                            windspeed_10m: winds[i] !== undefined ? winds[i] : null,
                            relativehumidity_2m: hums[i] !== undefined ? hums[i] : null
                        });
                    }

                    const resultado = {
                        latitude: data.latitude || null,
                        longitude: data.longitude || null,
                        start_date: start_date,
                        end_date: end_date,
                        hourly_raw: hourly,
                        entrenos: entrenos,
                        metadata: {
                            horarios: ['temperature_2m', 'precipitation', 'windspeed_10m', 'relativehumidity_2m']
                        },
                        source_raw: data
                    };

                    // almacenar y notificar
                    self.meteorologiaEntrenos = resultado;
                    const procesado2 = (typeof self.procesarJSONEntrenos === 'function') ?
                        self.procesarJSONEntrenos(resultado) :
                        resutado;
                    $(document).trigger('meteorologiaEntrenosReady', [procesado2]);
                } catch (e) {
                    self.meteorologiaEntrenos = null;
                    $(document).trigger('meteorologiaEntrenosError', [e]);
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                const err = new Error('Fallo al obtener datos meteorológicos de entrenamientos: ' + (error || textStatus));
                self.meteorologiaEntrenos = null;
                $(document).trigger('meteorologiaEntrenosError', [err]);
            });
    }

    procesarJSONEntrenos(jsonObj) {
        const src = jsonObj || this.meteorologiaEntrenos || (this.meteorologiaEntrenos && this.meteorologiaEntrenos.source_raw) || null;
        if (!src) return null;

        // Preferimos la estructura ya procesada por getMeteorologiaEntrenos
        let entradas = [];
        if (Array.isArray(src.entrenos) && src.entrenos.length) {
            entradas = src.entrenos.slice();
        } else if (src.hourly_raw && Array.isArray(src.hourly_raw.time)) {

            const hr = src.hourly_raw;
            const times = hr.time || [];
            const temps = hr.temperature_2m || [];
            const precs = hr.precipitation || [];
            const winds = hr.windspeed_10m || [];
            const hums = hr.relativehumidity_2m || [];
            for (let i = 0; i < times.length; i++) {
                entradas.push({
                    time: times[i],
                    temperature_2m: temps[i] !== undefined ? temps[i] : null,
                    precipitation: precs[i] !== undefined ? precs[i] : null,
                    windspeed_10m: winds[i] !== undefined ? winds[i] : null,
                    relativehumidity_2m: hums[i] !== undefined ? hums[i] : null
                });
            }
        } else {
            return null;
        }

        // Agrupar por día (YYYY-MM-DD)
        const grupos = Object.create(null);
        entradas.forEach(e => {
            if (!e || !e.time) return;
            const fecha = (typeof e.time === 'string') ? e.time.split('T')[0] : null;
            if (!fecha) return;
            if (!grupos[fecha]) {
                grupos[fecha] = {
                    temperature_2m_sum: 0, temperature_2m_count: 0,
                    precipitation_sum: 0, precipitation_count: 0,
                    windspeed_10m_sum: 0, windspeed_10m_count: 0,
                    relativehumidity_2m_sum: 0, relativehumidity_2m_count: 0
                };
            }
            const g = grupos[fecha];

            if (typeof e.temperature_2m === 'number') {
                g.temperature_2m_sum += e.temperature_2m;
                g.temperature_2m_count++;
            }
            if (typeof e.precipitation === 'number') {
                g.precipitation_sum += e.precipitation;
                g.precipitation_count++;
            }
            if (typeof e.windspeed_10m === 'number') {
                g.windspeed_10m_sum += e.windspeed_10m;
                g.windspeed_10m_count++;
            }
            if (typeof e.relativehumidity_2m === 'number') {
                g.relativehumidity_2m_sum += e.relativehumidity_2m;
                g.relativehumidity_2m_count++;
            }
        });

        // Construir array de días ordenados y calcular medias a 2 decimales
        const fechas = Object.keys(grupos).sort();
        const dias = fechas.map(fecha => {
            const g = grupos[fecha];
            const mean = (sum, count) => {
                if (!count || count === 0) return null;
                return Number((sum / count).toFixed(2));
            };
            return {
                date: fecha,
                mean_temperature_2m: mean(g.temperature_2m_sum, g.temperature_2m_count),
                mean_precipitation: mean(g.precipitation_sum, g.precipitation_count),
                mean_windspeed_10m: mean(g.windspeed_10m_sum, g.windspeed_10m_count),
                mean_relativehumidity_2m: mean(g.relativehumidity_2m_sum, g.relativehumidity_2m_count),
                counts: {
                    temperature_2m: g.temperature_2m_count,
                    precipitation: g.precipitation_count,
                    windspeed_10m: g.windspeed_10m_count,
                    relativehumidity_2m: g.relativehumidity_2m_count
                }
            };
        });

        // Si se requieren sólo los 3 días de entrenamientos, tomar los últimos/primeros 3 según rango disponible
        const resultado = {
            start_date: src.start_date || null,
            end_date: src.end_date || null,
            days: dias.slice(0, 3), // devolver como máximo 3 días
            metadata: {
                agregacion: 'media',
                decimales: 2,
                variables: ['temperature_2m', 'precipitation', 'windspeed_10m', 'relativehumidity_2m']
            },
            source_used: src
        };

        // Guardar en la instancia
        this.meteorologiaEntrenosProcesada = resultado;
        return resultado;
    }
}


