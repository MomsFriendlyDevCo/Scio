var _ = require('lodash');
var path = require('path');
var fs = require('fs');

// Determine 'ENV' {{{
var env = 'dev';
if (/-e\s*([a-z0-9\-]+)/i.test(process.argv.slice(1).join(' '))) { // exec with '-e env'
	var eargs = /-e\s*([a-z0-9\-]+)/i.exec(process.argv.slice(1).join(' '));
	env = eargs[1];
} else if (process.env.NODE_ENV) { // Inherit from NODE_ENV
	env = process.env.NODE_ENV;
}
// }}}

var defaults = {
	name: "scio",
	title: "Scio",
	env: env,
	root: path.normalize(__dirname + '/..'),
	host: null, // Listen to all host requests
	port: process.env.PORT || 80,
	url: 'http://localhost',
	secret: "HWkozqfP6+6h9XV25KvD75/ri3nkjcu8wD/imnLwBtk+iyFJiy1M8qotLCnnEjtZI", // A quick way to populate this is with `cat /dev/urandom | base64`
	gulp: {
		debugJS: true,
		minifyJS: false,
		debugCSS: true,
		minifyCSS: false,
	},
	mongo: {
		uri: 'mongodb://localhost/scio',
		options: {
			db: {
				safe: true
			}
		}
	},
	newrelic: {
		enabled: false,
		name: 'Scio',
		license: '{{FIXME.newrelic.license}}',
	},
	plugins: {
		sources: ['./node_modules', './plugins'],
		monitors: {
			complain: true, // Also output down states to the console
			parallalLimit: 20, // Number of services that can run concurrently, set to falsy for unlimited
		},
	},
	cron: {
		enabled: true,
		debugForceAll: true, // Debugging - Force every service to refresh every cron cycle
		verbose: false,
		waitTime: 1 * 1000, // Wait between cron cycles
	},
};

module.exports = _.merge(
	// Adopt defaults...
	defaults,

	// Which are overriden by private.js if its present
	fs.existsSync(__dirname + '/private.js') ? require(__dirname + '/private.js') : {},

	// Whish are overriden by the NODE_ENV.js file if its present
	fs.existsSync(__dirname + '/' + defaults.env + '.js') ? require(__dirname + '/' + defaults.env + '.js') : {}
);
