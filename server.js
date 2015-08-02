#!/usr/bin/env node
// Initial / Config {{{
global.config = require('./config');
// }}}
// Initial / NewRelic {{{
if (config.newrelic.enabled) require('newrelic');
// }}}
// Requires {{{
var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');
var bodyParser = require('body-parser');
var express = require('express');
var layouts = require('express-ejs-layouts')
var fs = require('fs');
var fspath = require('path');
var requireDir = require('require-dir');
global.app = express();
// }}}
// Settings {{{
require('./config/db');
app.set('title', config.title);
app.set('view engine', "html");
app.set('layout', 'layouts/main');
app.engine('.html', require('ejs').renderFile);
app.enable('view cache');
app.use(layouts);
// }}}
// Settings / Basic Auth (DEBUGGING) {{{
// Enable this to temporarily lock down the server
// app.use(express.basicAuth('user', 'letmein'));
// }}}
// Settings / Parsing {{{
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(require('multer')());
// }}}
// Settings / Cookies + Sessions {{{
app.use(require('connect-flash')());
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
app.use(session({
	secret: config.secret,
	store: new mongoStore({mongooseConnection: mongoose.connection}),
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: new Date(Date.now() + (3600000 * 48)), // 48 hours
		maxAge: (3600000 * 48) // 48 hours
	}
}));
// }}}
// Settings / Passport {{{
global.passport = require('passport');

var passportLocalStrategy = require('passport-local').Strategy;
var Users = new require('./models/users');

passport.use(new passportLocalStrategy({
	passReqToCallback: true,
	usernameField: 'username',
}, function(req, username, password, next) {
	console.log('Check login', colors.cyan(username));
	Users.findByLogin(req, username, password, next); // Delegate to the user model
}));
passport.serializeUser(function(user, next) {
	next(null, user.username);
});
passport.deserializeUser(function(id, next) {
	Users
		.findOne({username: id})
		.populate('country')
		.exec(function(err, user) {
			return next(err, user);
		});
});

// Various security blocks
global.ensure = {
	loginFail: function(req, res, next) { // Special handler to reject login and redirect to login screen or raise error depending on context
		console.log(colors.red('DENIED'), colors.cyan(req.url));
		// Failed login - decide how to return
		res.format({
			'application/json': function() {
				res.status(401).send({err: "Not logged in"}).end();
			},
			'default': function() {
				res.redirect('/login');
			},
		});
	},

	login: function(req, res, next) {
		if (req.user && req.user._id) { // Check standard passport auth (inc. cookies)
			return next();
		} else if (req.body.token) { // Token has been provided
			Users.findOne({'auth.tokens.token': req.body.token}, function(err, user) {
				if (err || !user) return ensure.loginFail(req, res, next);
				console.log('Accepted auth token', colors.cyan(req.body.token));
				req.user = user;
				next();
			});
		} else { // Not logged in and no method being passed to handle - reject
			ensure.loginFail(req, res, next);
		}
	}
};

app.use(passport.initialize());
app.use(passport.session());
// }}}
// Settings / Restify {{{
global.restify = require('express-restify-mongoose');
var ERMGuard = require('express-restify-mongoose-guard')({
	// Forbid any field that begins with '_'
	removeFields: [/^_/],

	// Allow _id and __v (but map to _v)
	renameFields: {_id: '_id', __v: '_v'},

	// Remap all DELETE methods to UPDATE setting enabled=false
	deleteUpdateRemap: {enabled: false},
});
restify.defaults({
	version: '',
	middleware: ERMGuard.preHook,
	outputFn: ERMGuard.postHook,
});
// }}}
// Settings / Logging {{{
app.use(require('express-log-url'));
// }}}
// Controllers {{{
requireDir('./controllers');
// }}}

// Static pages {{{
app.use(express.static(__dirname + '/public'));
app.use('/app', express.static(__dirname + '/app'));
app.use('/build', express.static(__dirname + '/build'));
app.use('/partials', express.static(__dirname + '/views/partials'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
// }}}

// Error catcher {{{
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.send(500, 'Something broke!').end();
});
// }}}

// Init {{{
var server = app.listen(config.port, config.host, function() {
	console.log('Web interface listening at', colors.cyan('http://' + (config.host || 'localhost') + (config.port == 80 ? '' : ':' + config.port)));
});
// }}}
// Plugins {{{
global.plugins = {
	monitors: [],
	alerters: [],
};

async()
	.then(function(next) {
		console.log('Loading plugins...');
		next();
	})
	.set('pluginsList', [])
	.forEach(config.plugins.sources, function(next, source) {
		var self = this;
		fs.readdir(source, function(err, files) {
			if (err) return next(err);
			files.forEach(function(file) {
				if (/^scio-/.test(file))
					self.pluginsList.push(source + '/' + file);
			});
			next();
		});
	})
	.then(function(next) {
		console.log('Detected', colors.cyan(this.pluginsList.length), 'plugins');
		next();
	})
	.forEach('pluginsList', function(next, plugin) {
		var basename = fspath.basename(plugin);
		console.log(colors.blue('[PLUGIN]'), basename);
		var plugin = require(plugin);
		if (!plugin._scio) {
			return next('Plugin does not look like a Scio compatible module: ' + basename);
		} else { // All is well
			Object.keys(plugins).forEach(function(pluginType) {
				if (!plugin[pluginType]) return; // Not provided
				if (!_.isArray(plugin[pluginType])) return next('Plugin ' + basename + ' must return an array for plugin type "' + pluginType + '"');
				_.merge(plugins[pluginType], plugin[pluginType]);
			});
			next();
		}
	})
	.end(function(err) {
		if (err) {
			console.log(colors.red('[ERROR]'), err);
			process.exit(1);
		}
	});
// }}}
// Cron {{{
if (config.cron.enabled) {
	var cron = require('./cron');
	cron
		.on('info', function(msg) {
			console.log(colors.blue('CRON'), msg);
		})
		.on('err', function(msg) {
			if (msg == 'Nothing to do') return;
			console.log(colors.blue('CRON'), colors.red('ERROR'), msg);
		})
		.install();
}
// }}}
