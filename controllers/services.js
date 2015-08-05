var async = require('async-chainable');
var Services = require('../models/services');
var Ticks = require('../models/ticks');
var strtotime = require('strtotime');

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
