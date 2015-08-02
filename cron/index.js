/**
* Cron core
* Used as the periodic task runner to poll the tasks collection and distribute tasks out to ./cron/*.js workers
*/

var _ = require('lodash');
var async = require('async-chainable');
var events = require('events');
var requireDir = require('require-dir');
var util = require('util');

function Cron() {
	this.workers = requireDir('.');

	this.cycle = function(finish) {
		var self = this;

		async()
			.parallel([
				function(next) {
					self.workers['monitors'](next);
				},
			])
			.end(function(err) {
				if (err) self.emit('err', err);

				if (!this.toProcess) {
					self.emit('idle', 'Nothing to do');
				} else if (err) {
					self.emit('info', 'Cron Error - ' + err);
				}

				finish();
			});
	};

	this.install = function() {
		var self = this;
		// Cron runner process {{{
		var cronRunner = function() {
			setTimeout(function() {
				if (config.cron.verbose) self.emit('info', 'Beginning cron cycle');
				self.cycle(function() {
					if (config.cron.verbose) self.emit('info', 'Cycle complete');
					cronRunner();
				});
			}, config.cron.waitTime);
		};
		cronRunner();
		if (config.cron.verbose) self.emit('info', 'Installed');
		// }}}
	};
}

util.inherits(Cron, events.EventEmitter);
module.exports = new Cron();
