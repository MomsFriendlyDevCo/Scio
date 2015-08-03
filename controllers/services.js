var async = require('async-chainable');
var Services = require('../models/services');
var Ticks = require('../models/ticks');
var strtotime = require('strtotime');

app.get('/api/services/:id/chart', function(req, res) {
	async()
		.then(function(next) {
			// Sanity checks {{{
			if (!req.params.id) return next('No ID specified');
			next();
			// }}}
		})
		.then('service', function(next) {
			Services.findOne({_id: req.params.id})
				.populate('server')
				.exec(next);
		})
		.then('ticks', function(next) {
			Ticks.find({serviceRef: this.service.ref, serverRef: this.service.server.ref})
				.select('created status value')
				.sort('-created')
				.limit(100)
				.exec(function(err, data) {
					if (err) return next(err);
					return next(null, data.map(function(tick) {
						return {
							y: tick.created,
							x: tick.value,
							z: tick.status,
						};
					}));
				});
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				data: this.ticks,
			});
		});
});


app.get('/api/services/tickCount', function(req, res) {
	async()
		.then('since', function(next) {
			if (req.query.since) {
				var since = strtotime(req.query.since);
				if (!since) return next('Invalid since specification');
				return next(null, since);
			}
			return next();
		})
		.then('count', function(next) {
			var query = {};
			if (this.since) query.created = {'$gt': this.since};
			Ticks.count(query, next);
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send({
				count: this.count,
			});
		});
});

restify.serve(app, Services);
