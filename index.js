/**
* Scio object
* This object gets passed to various plugins in order to access global models, events and other such shared functionality
*/
var events = require('events');
var util = require('util');

function ScioObject () {
	this.models = {
		Servers: require('./models/servers'),
		Services: require('./models/services'),
		Ticks: require('./models/ticks'),
	};

	/**
	* Merge a plugins options structure by applying user defaults
	* @param function(err, settings) next Callback on finish
	* @param object plugin The plugin to read the options table from
	* @param object overrides Any overrides to apply
	*/
	this.compileOptions = function(next, plugin, overrides) {
		var out = {};
		if (!plugin.options) return next(null, {});
		plugin.options.forEach(function(option) {
			if (option.default === undefined) return; // No need to apply a default
			if (overrides[option.id]) return; // Option manually specified by the user
			out[option.id] = option.default; // Read in from defaults
		});
		next(null, out);
	};
};
util.inherits(ScioObject, events.EventEmitter);

module.exports = new ScioObject();
