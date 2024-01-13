var karaoke = {
	canciones: ko.observableArray([]),
	cancion: ko.observable(),
	idiomas: ko.observableArray([]),
	idioma: ko.observable(),
	decada: ko.observable(),
	decadas: ko.observableArray([]),
	anio: ko.observable(),
	anios: ko.observableArray([]),
	dueto: ko.observable('todas'),
	nuevas: ko.observable('todas'),
	cantadas: ko.observable('todas'),
	detalleCancion: ko.observable(),
	detallePuntajes: ko.observableArray([]),
	cancionesRandom: ko.observableArray([]),
	cantidadRandom: ko.observable(1),
	cantidad: ko.observable(0),
	init: function () {
		ko.applyBindings(this);
		
		sheetrock.defaults.reset = true;
		sheetrock.defaults.rowTemplate = function () { return ''; }
		
		karaoke.cargarIdiomas();
		karaoke.cargarDecadas();
		karaoke.cargarAnios();
		karaoke.cargarCanciones();
	},
	cargarCanciones: function () {
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=1613025820',
			query: "select A, B, C, D, E, F, G where 1 = 1 " +
				   (karaoke.cancion() ? "and lower(A) contains '" + karaoke.cancion().toLowerCase() + "'" : "") +
				   (karaoke.dueto() === 'si' ? "and B = 'SI'" : (karaoke.dueto() === 'no' ? "and B = 'NO'" : "")) +
				   (karaoke.nuevas() === 'si' ? "and C = 'Nueva'" : "") +
				   (karaoke.cantadas() === 'si' ? "and D > 0" : (karaoke.cantadas() === 'no' ? "and D is null" : "")) +
				   (karaoke.idioma() ? "and F = '" + karaoke.idioma() + "'" : "") +
				   (karaoke.decada() ? "and H = " + karaoke.decada() : "") +
				   (karaoke.anio() ? "and G = " + karaoke.anio() : "") +
				   " order by A",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.cantidad(response.rows.length - 1);
					karaoke.canciones(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});
	},
	cargarIdiomas: function () {
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=1613025820',
			query: "select F, count(E) group by F order by F",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.idiomas(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});	
	},
	cargarDecadas: function () {
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=1613025820',
			query: "select H, count(E) group by H order by H DESC",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.decadas(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});	
	},
	cargarAnios: function () {
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=1613025820',
			query: "select G, count(E) group by G order by G DESC",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.anios(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});	
	},
	cargarDetalle: function (row) {
		karaoke.detalleCancion(row.cells.Cancion);
		
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=483247872',
			query: "select A, B, C, D, E where lower(C) = '" + karaoke.detalleCancion().toLowerCase() + "' order by E desc",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.detallePuntajes(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
					
					$('#modalDetalle').modal('show');
				}
			}
		});
	},
	limpiarFiltros: function () {
		karaoke.cancion('').dueto('todas').cantadas('todas').nuevas('todas').idioma('').decada('').anio('');
		karaoke.cargarCanciones();
	},
	random: function() {
		karaoke.cancionesRandom.removeAll();

		for (var i = 0; i < karaoke.cantidadRandom(); i += 1) {
			var indice = Math.floor(Math.random() * karaoke.canciones().length);
			karaoke.cancionesRandom.push(karaoke.canciones()[indice]);
		}

		$('#modalRandom').modal('show');
	},
	clasePuntos: function (puntos) {
		if (puntos >= 9000) { return 'puntos-9k'; }
		if (puntos >= 8000) { return 'puntos-8k'; }
		if (puntos >= 7000) { return 'puntos-7k'; }
		if (puntos >= 6000) { return 'puntos-6k'; }
		if (puntos >= 5000) { return 'puntos-5k'; }
		if (puntos !== '') { return 'puntos-0k'; }
		return '';
	}
};