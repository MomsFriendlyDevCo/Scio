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
					.exec(function(err, data) {
						if (err) return next(err);
						return next(null, data.map(function(tick) {
							var outTick = {y: tick.created};
							outTick[tick.serverRef] = tick.status;
							return outTick;
						}));
					});
			},
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				data: this.ticks,
				keys: _.pluck(this.servers, 'ref'),
				labels: this.servers.map(function(server) { return server.name || server.address || 'Untitled' }),
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
				.exec(function(err, data) {
					if (err) return next(err);
					return next(null, data.map(function(tick) {
						var outTick = {y: tick.created};
						outTick[tick.serviceRef] = tick.value;
						return outTick;
					}));
				});
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				data: this.ticks,
				keys: _.pluck(this.services, 'ref'),
				labels: this.services.map(function(service) { return service.name || service.plugin || 'Untitled' }),
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
