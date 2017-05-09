var karaoke = {
	promedios: ko.observableArray([]),
	fechas: ko.observableArray([]),
	fecha: ko.observable(),
	ordenar: ko.observable('avg'),
	init: function () {
		ko.applyBindings(this);
		
		sheetrock.defaults.url = 'https://docs.google.com/spreadsheets/d/13ywXsMPe0JNZCxWLp3VJnlfMZYDZc2Q6rqxtEAP79Hk/edit#gid=483247872';
		sheetrock.defaults.reset = true;
		sheetrock.defaults.rowTemplate = function () { return ''; }
		
		karaoke.cargarFechas(karaoke.cargarPromedios);
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