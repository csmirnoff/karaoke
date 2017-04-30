var karaoke = {
	puntajes: ko.observableArray([]),
	promedios: ko.observableArray([]),
	fechas: ko.observableArray([]),
	cantantes: ko.observableArray([]),
	canciones: ko.observableArray([]),
	fecha: ko.observable(),
	cantante: ko.observable(),
	cancion: ko.observable(),
	ordenar: ko.observable('avg'),
	init: function () {
		ko.applyBindings(this);
		
		sheetrock.defaults.url = 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=483247872';
		sheetrock.defaults.reset = true;
		sheetrock.defaults.rowTemplate = function () { return ''; }
	},
	initPuntajes: function () {
		karaoke.init();
		
		karaoke.cargarFechas();
		karaoke.cargarCantantes();
		karaoke.cargarCanciones();
		
		karaoke.cargarPuntajes();
	},
	initPromedios: function () {
		karaoke.init();
		
		karaoke.cargarFechas(karaoke.cargarPromedios);
	},
	cargarPuntajes: function () {
		$('body').sheetrock({
			query: "select A, B, C, D, E where 1 = 1 " + 
				   (karaoke.fecha() ? "and A = '" + karaoke.fecha() + "'" : "") + 
				   (karaoke.cantante() ? "and B = '" + karaoke.cantante() + "'" : "") + 
				   (karaoke.cancion() ? "and C = '" + karaoke.cancion() + "'" : "") + 
				   " order by E desc",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.puntajes(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});
	},
	cargarPromedios: function () {
		$('body').sheetrock({
			query: "select B, avg(E), max(E), min(E) where A = '" +
				   karaoke.fecha() + 
				   "' group by B order by " +
				   (karaoke.ordenar() === 'avg' ? "avg(E) desc" : (karaoke.ordenar() === 'max' ? "max(E) desc" : "min(E) desc")) +
				   " label B 'Cantante', avg(E) 'Promedio', max(E) 'Maximo', min(E) 'Minimo'",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.promedios(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});
	},
	cargarFechas: function (callback) {
		$('body').sheetrock({
			query: "select A, count(E) group by A order by A desc",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.fechas(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
					
					if (callback && karaoke.fechas().length > 0) {
						karaoke.fecha(karaoke.fechas()[0]);
						callback();
					}
				}
			}
		});	
	},
	cargarCantantes: function () {
		$('body').sheetrock({
			query: "select B, count(E) group by B order by B",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.cantantes(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});	
	},
	cargarCanciones: function () {
		$('body').sheetrock({
			query: "select C, count(E) group by C order by C",
			callback: function (error, options, response) {
				if (error === null) {
					karaoke.canciones(response.rows.filter(function (obj) {
						return obj.num > 0;
					}));
				}
			}
		});	
	},
	filtrarFecha: function (row) {
		karaoke.fecha(row.cells.Fecha);
		karaoke.cargarPuntajes();
	},
	filtrarCantante: function (row) {
		karaoke.cantante(row.cells.Cantante);
		karaoke.cargarPuntajes();
	},
	filtrarCancion: function (row) {
		karaoke.cancion(row.cells.Cancion);
		karaoke.cargarPuntajes();
	},
	limpiarFiltros: function () {
		karaoke.fecha('').cantante('').cancion('');
		karaoke.cargarPuntajes();
	},
	clasePuntos: function (puntos) {
		if (puntos >= 9000) { return 'puntos-9k'; }
		if (puntos >= 8000) { return 'puntos-8k'; }
		if (puntos >= 7000) { return 'puntos-7k'; }
		if (puntos >= 6000) { return 'puntos-6k'; }
		if (puntos >= 5000) { return 'puntos-5k'; }
		return 'puntos-0k';
	},
	clasePuntosMejor: function (col, puntos) {
		if (col === 'avg' && puntos == karaoke.mejorPromedio()) { return karaoke.clasePuntos(puntos) };
		if (col === 'max' && puntos == karaoke.mejorMaximo()) { return karaoke.clasePuntos(puntos) };
		if (col === 'min' && puntos == karaoke.mejorMinimo()) { return karaoke.clasePuntos(puntos) };
		return '';
	},
	promedioTotal: ko.pureComputed(function () {
		var sum = 0;
		for (var i = 0; i < karaoke.promedios().length; i++) {
			sum += parseFloat(karaoke.promedios()[i].cells.Promedio);
		}
		return karaoke.promedios().length > 0 ? Math.round(sum / karaoke.promedios().length) : 0;
	}),
	maximoTotal: ko.pureComputed(function () {
		var max = 0;
		for (var i = 0; i < karaoke.promedios().length; i++) {
			max = Math.max(karaoke.promedios()[i].cells.Maximo, max);
		}
		return max;
	}),
	minimoTotal: ko.pureComputed(function () {
		var min = 10000;
		for (var i = 0; i < karaoke.promedios().length; i++) {
			min = Math.min(karaoke.promedios()[i].cells.Minimo, min);
		}
		return min;
	}),
	mejorPromedio: ko.pureComputed(function () {
		var max = 0;
		for (var i = 0; i < karaoke.promedios().length; i++) {
			max = Math.max(karaoke.promedios()[i].cells.Promedio, max);
		}
		return Math.round(max);
	}),
	mejorMaximo: ko.pureComputed(function () { 
		return karaoke.maximoTotal(); 
	}),
	mejorMinimo: ko.pureComputed(function () {
		var max = 0;
		for (var i = 0; i < karaoke.promedios().length; i++) {
			max = Math.max(karaoke.promedios()[i].cells.Minimo, max);
		}
		return max;
	})
};