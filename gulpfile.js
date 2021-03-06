var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');

// Configure / Plugins {{{
requireDir('./gulp-tasks');
notify.logLevel(0);
// }}}

// Configure / Paths {{{
// All paths should be relative to the project root directory
global.paths = {
	ignore: [ // Do not monitor these paths for changes
		'app/', // No need to watch this with nodemon as its handled seperately
		'views/partials',
		'bower_components/',
		'node_modules/',
		'build/',
		'data/',
		'test/',
	],
	scripts: [
		'app/**/*.js',
	],
	css: [
		'public/css/**/*.css',
	],
	partials: [
		'views/partials/**/*.html',
	],
	data: [
		'models/data/**/*.js'
	],
	scenarios: [
		'models/scenarios/**/*.json',
	],
	build: 'build',
};
// }}}

// Redirectors {{{
gulp.task('default', ['serve']);
gulp.task('clean', ['scripts:clean']);
gulp.task('db', ['scenario']);
gulp.task('fakes', ['fake-users']);
gulp.task('deploy', ['pm2-deploy']);
gulp.task('serve', ['nodemon']);
gulp.task('start', ['pm2-start']);
gulp.on('stop', function() { process.exit(0) });

gulp.task('build', function(finish) {
	runSequence(
		'clean',
		['scripts', 'css'],
		finish
	);
});
// }}}

// Loaders {{{
gulp.task('load:config', [], function(finish) {
	global.config = require('./config');
	finish();
});

gulp.task('load:db', ['load:config'], function(finish) {
	require('./config/db');
	finish();
});

gulp.task('load:models', ['load:db'], function(finish) {
	require('./models');
	finish();
});
// }}}

/**
* Launch a plain server without Nodamon
*/
gulp.task('server', ['build'], function() {
	require('./server.js');
});
// }}}

// Various config profiles {{{
// Remove all profiles on the server
gulp.task('config-nuke', ['load:config'], function(next) {
	superagent.post(config.url + '/api/plugins/nuke')
		.send({token: config.token})
		.end(function(err, res) {
			if (err) return next(err);
			if (!res.ok) return next("Failed nuke, return code: " + res.statusCode + ' - ' + res.text);
			next();
		});
});

// Load the ./docs/example-configs/debug.yaml config file as the main profile
gulp.task('config-debug', ['load:config', 'config-nuke'], function(next) {
	superagent.post(config.url + '/api/plugins/parse')
		.send({token: config.token})
		.type('form')
		.attach('file', './docs/example-configs/debug.yaml')
		.end(function(err, res) {
			if (err) return next(err);
			if (!res.ok || res.statusCode != 200) return next('Failed upload, return code: ' + res.statusCode + ' - ' + res.text);
			if (!_.isArray(res.body)) return next(res.text);
			gutil.log(res.body);
			next();
		})
});
// }}}
