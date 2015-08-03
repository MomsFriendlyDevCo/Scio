var _ = require('lodash');
var async = require('async-chainable');
var Servers = require('../models/servers');
var Services = require('../models/services');
var Ticks = require('../models/ticks');

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
				Services.find({server: req.params.id}, next);
			},
		})
		.then('ticks', function(next) {
			if (!this.server) return next('Server not found');
			if (!this.services) return next('No services found');

			var keys = this.keys;
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

restify.serve(app, Servers);
