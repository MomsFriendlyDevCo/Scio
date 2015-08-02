var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var cronParser = require('cron-parser');
var Services = require('../models/services');
var Servers = require('../models/servers');

module.exports = function(finish) {
	async()
		.set('touchedServers', {}) // Set of servers we have seen status alterations for (used to cascade the server status later)
		.then('services', function(next) {
			var query = { // What query to use when filtering the DB
				enabled: true,
				'$or': [
					{ 'nextCheck.date': {'$lte': new Date()} },
					{ 'nextCheck.date': null },
					{ 'nextCheck.force': true },
				],
			};

			if (config.cron.debugForceAll) query = {enabled: true};

			Services.find(query)
				.populate('server')
				.exec(next);
		})
		.limit(config.plugins.monitors.parallelLimit)
		.forEach('services', function(nextService, service) {
			var touchedServers = this.touchedServers;
			async()
				.then('plugin', function(next) {
					// Find the right plugin {{{
					console.log(colors.blue('[MONITOR ' + service.plugin + ']'), (service.address || service.server.address));
					var plugin = _.find(plugins.monitors, {ref: service.plugin});
					if (!plugin) return next('Plugin not found: ' + service.plugin);
					next(null, plugin);
					// }}}
				})
				.then(function(next) {
					// Apply options {{{
					if (!service.options) service.options = {};
					this.plugin.options.forEach(function(option) {
						if (!option.default) return; // No need to apply a default
						if (service.options[option.id]) return; // Option manually specified by the user
						service.options[option.id] = option.default; // Read in from defaults
					});
					next();
					// }}}
				})
				.then(function(next) {
					// Run plugin {{{
					var plugin = this.plugin;
					plugin.callback.call(service, function(err, res) {
						if (err) {
							return next(err);
						} else if (plugin.type == 'boolean') {
							service.lastCheck = {
								status: (!!res.value ? 'ok' : 'danger'),
								response: res.value,
							};
							if (!res.value) console.log(colors.blue('[PLUGIN ' + service.plugin + '@' + (service.address || service.server.address) + ']'), 'Service is down!');
						} else if (!plugin.type) {
							return next('Plugin has no type specified: ' + service.plugin);
						} else {
							return next('Unknown type for plugin: ' + service.plugin);
						}
						next();
					}, service);
					// }}}
				})
				.then(function(next) {
					// Calculate the nextCheck {{{
					try {
						var parsedCron = cronParser.parseExpression(service.cronSchedule);
						service.nextCheck.date = parsedCron.next();
						console.log('Next run set to', service.nextCheck.date, 'FROM', (service.lastCheck.date || service.created));
						next();
					} catch (e) {
						return next('Error while parsing cron expression: ' + self.cronSchedule);
					}
					// }}}
				})
				.end(function(err) {
					if (err) {
						service.lastCheck = {
							status: 'error',
							response: err,
						};
						console.log(colors.red('[MONITOR ERR ' + service.plugin + ']'), err);
					}
					service.lastCheck.date = new Date();
					service.nextCheck.force = false;
					service.status = service.lastCheck.status;
					delete service.options; // Dont overwrite the users options with our calculated ones

					// Mark the server as dirty so we can recalc later
					touchedServers[service.server._id] = true;

					service.save(nextService);
				});
		})
		.then(function(next) {
			// Update server status (i.e. cascade up from service status') {{{
			var touchedServers = Object.keys(this.touchedServers);
			async()
				.parallel({
					servers: function(next) {
						Servers.find({_id: {'$in': touchedServers}})
							.select('_id status')
							.exec(next);
					},
					services: function(next) {
						Services.find({server: {'$in': touchedServers}})
							.select('server status')
							.exec(next);
					},
				})
				.forEach('servers', function(next, server) {
					var bestResponse = 'ok';
					this.services
						.filter(function(service) { return service.server.toString() == server._id.toString() })
						.forEach(function(service) {
							if (service.status == 'warning' && bestResponse == 'ok') {
								bestResponse = 'warning';
							} else if (service.status == 'unknown' && bestResponse == 'ok') {
								bestResponse = 'unknown';
							} else if (service.status == 'error') {
								bestResponse = 'error';
							} else if (service.status == 'danger') {
								bestResponse = 'danger';
							}
						});

					server.status = bestResponse;
					server.save(next);
				})
				.end(next);
			// }}}
		})
		.end(finish);
};
