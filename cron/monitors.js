var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var cronParser = require('cron-parser');
var domain = require('domain');
var Services = require('../models/services');
var Servers = require('../models/servers');
var Ticks = require('../models/ticks');

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
					var plugin = _.find(plugins.monitors, {ref: service.plugin});
					if (!plugin) {
						service.enabled = false;
						return next('Plugin not found: ' + service.plugin);
					}
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
					var pluginDomain = domain.create();
					var plugin = this.plugin;
					var hasTimeout = false;

					pluginDomain
						.on('error', function(err) {
							console.log(colors.blue('[PLUGIN ' + service.plugin + ']'), colors.red('CRASHED!'), err);
							return next('Plugin ' + service.plugin + ' crashed - ' + err);
						})
						.run(function() {
							var pluginTimer = setTimeout(function() {
								hasTimeout = true;
								pluginDomain.exit();
								return next('Plugin timed out: ' + service.plugin);
							}, config.plugins.timeout);

							console.log(colors.blue('[PLUGIN ' + service.plugin + ']'), (service.address || service.server.address));
							plugin.callback.call(service, function(err, res) {
								clearTimeout(pluginTimer);
								if (hasTimeout) return; // Plugin timed out
								if (err) {
									service.lastCheck.status = 'error';
									service.lastCheck.value = null;
									service.lastCheck.response = err;
									return next();
								} else if (_.isObject(res)) {
									// Process incomming status {{{
									// Sanity checks on incomming object {{{
									if (!res.status) return next('No status return for plugin ' + service.plugin);
									if (!_.includes(['ok', 'warning', 'danger', 'error', 'unknown'], res.status)) return next('Invalid status return for plugin ' + service.plugin);
									if (res.value && !_.isNumber(res.value)) return next('Returned tick value for plugin ' + service.plugin + ' is not a valid number');
									// }}}
									service.lastCheck.status = res.status;
									service.lastCheck.value = res.value || null;
									service.lastCheck.response = res.response || null;
									// }}}
									return next();
								} else {
									service.lastCheck.status = 'error';
									service.lastCheck.value = null;
									service.lastCheck.response = 'Unknown type return for plugin ' + service.plugin;
									return next();
								}
							}, service);
						});
					// }}}
				})
				.parallel([
					function(next) {
						// Process tick {{{
						Ticks.create({
							serverRef: service.server.ref,
							serviceRef: service.ref,
							status: service.lastCheck.status,
							value: service.lastCheck.value,
							response: service.lastCheck.response,
						}, next);
						// }}}
					},
					function(next) {
						// Calculate the nextCheck {{{
						try {
							var parsedCron = cronParser.parseExpression(service.cronSchedule);
							service.nextCheck.date = parsedCron.next();
							// console.log('Next run set to', service.nextCheck.date, 'FROM', (service.lastCheck.date || service.created));
							next();
						} catch (e) {
							return next('Error while parsing cron expression: ' + self.cronSchedule);
						}
						// }}}
					},
				])
				.end(function(err) {
					if (err) {
						service.lastCheck.status = 'error';
						service.lastCheck.value = null;
						service.lastCheck.response = err;
						console.log(colors.red('[PLUGIN ERR ' + service.plugin + ']'), err);
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
							.select('_id status ref')
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
							if (service.status == 'danger') {
								bestResponse = 'danger';
							} else if (service.status == 'warning' && bestResponse != 'danger') {
								bestResponse = 'warning';
							} else if (service.status == 'error' && (bestResponse != 'warning' || bestResponse != 'danger')) {
								bestResponse = 'error';
							} else if (service.status == 'unknown' && (bestResponse != 'warning' || bestResponse != 'danger' || bestRepsponse != 'error')) {
								bestResponse = 'unknown';
							}
						});

					if (server.status != bestResponse) { // We're actually changing the status
						server.status = bestResponse;
						async()
							.parallel([
								function(next) {
									server.save(next);
								},
								function(next) {
									Ticks.create({
										serverRef: server.ref,
										status: bestResponse,
									}, next);
								},
							])
							.end(next);
					} else {
						return next();
					}
				})
				.end(next);
			// }}}
		})
		.end(finish);
};
