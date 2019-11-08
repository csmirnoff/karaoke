var karaoke = {
	canciones: ko.observableArray([]),
	cancion: ko.observable(),
	dueto: ko.observable('todas'),
	nuevas: ko.observable('todas'),
	cantadas: ko.observable('todas'),
	detalleCancion: ko.observable(),
	detallePuntajes: ko.observableArray([]),
	cancionesRandom: ko.observableArray([]),
	cantidadRandom: ko.observable(1),
	init: function () {
		ko.applyBindings(this);
		
		sheetrock.defaults.reset = true;
		sheetrock.defaults.rowTemplate = function () { return ''; }
		
		karaoke.cargarCanciones();
	},
	cargarCanciones: function () {
		$('body').sheetrock({
			url: 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=1613025820',
			query: "select A, B, C, D, E where 1 = 1 " +
				   (karaoke.cancion() ? "and lower(A) contains '" + karaoke.cancion().toLowerCase() + "'" : "") +
				   (karaoke.dueto() === 'si' ? "and B = 'SI'" : (karaoke.dueto() === 'no' ? "and B = 'NO'" : "")) +
				   (karaoke.nuevas() === 'si' ? "and C = 'Nueva'" : "") +
				   (karaoke.cantadas() === 'si' ? "and D > 0" : (karaoke.cantadas() === 'no' ? "and D is null" : "")) +
				   " order by A",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.canciones(response.rows.filter(function (obj) {
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
		karaoke.cancion('').dueto('todas').cantadas('todas').nuevas('todas');
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