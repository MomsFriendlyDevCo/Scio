var _ = require('lodash');
var async = require('async-chainable');
var Servers = require('../models/servers');
var Services = require('../models/services');
var Ticks = require('../models/ticks');

/**
* Return chart info for all servers
*/
app.get('/api/servers/chart', function(req, res) {
	async()
		.parallel({
			servers: function(next) {
				Servers.find({enabled: true}, next);
			},
			ticks: function(next) {
				Ticks.find({serviceRef: null})
					.select('created status serverRef')
					.sort('-created')
					.limit(100)
					.exec(next);
			},
		})
		.set('series', [])
		.set('seriesPointer', {})
		.forEach('servers', function(next, server) {
			var newSeries = {name: server.name || server.address || 'Untitled', data: []};
			this.series.push(newSeries);
			this.seriesPointer[server.ref] = newSeries;
			next();
		})
		.forEach('ticks', function(next, tick) {
			this.seriesPointer[tick.serverRef].data.push([tick.created, tick.status]);
			next();
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				series: this.series,
			});
		});
});

/**
* Return chart info for all services under a server
*/
app.get('/api/servers/:id/chart', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.params.id) return next('No ID specified');
			next();
			// }}}
		})
		.parallel({
			server: function(next) {
				Servers.findOne({_id: req.params.id}, next);
			},
			services: function(next) {
				Services.find({enabled: true, server: req.params.id}, next);
			},
		})
		.then('ticks', function(next) {
			if (!this.server) return next('Server not found');
			if (!this.services) return next('No services found');

			Ticks.find({serverRef: this.server.ref})
				.select('created serviceRef value')
				.sort('-created')
				.limit(100)
				.exec(next);
		})
		.set('series', [])
		.set('seriesPointer', {})
		.forEach('services', function(next, service) {
			var newSeries = {name: service.name || service.plugin || 'Untitled', data: []};
			this.series.push(newSeries);
			this.seriesPointer[service.ref] = newSeries;
			next();
		})
		.forEach('ticks', function(next, tick) {
			if (!tick.serviceRef) return next(); // Ignore server specific ticks
			if (tick.value === null) return next(); // Ignore blank values
			this.seriesPointer[tick.serviceRef].data.push([tick.created, tick.value]);
			next();
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				series: this.series,
			});
		});
});


/**
* Detail significant events about servers
*/
app.get('/api/servers/timeline', function(req, res) {
	async()
		.then('ticks', function(next) {
			Ticks.find({serviceRef: null})
				.select('_id created status serverRef')
				.sort('-created')
				.limit(20)
				.exec(function(err, data) {
					if (err) return next(err);
					return next(null, data);
				});
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send(this.ticks);
		});
});

restify.serve(app, Servers);
