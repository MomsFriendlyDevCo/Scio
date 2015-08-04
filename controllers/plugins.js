var _ = require('lodash');
var async = require('async-chainable');
var colors = require('colors');

app.get('/api/plugins/count', function(req, res) {
	var pluginCount = 0;
	_.forEach(plugins, function(tree) {
		pluginCount += tree.length;
	});

	res.send({count: pluginCount});
});

app.post('/api/plugins/parse', function(req, res) {
	async()
		.set('responses', [])
		.then('files', function(next) {
			if (!req.files || !_.values(req.files).length) return next('No files uploaded for parsing');
			next(null, _.values(req.files));
		})
		.forEach('files', function(next, file) {
			var responses = this.responses;
			async()
				.set('parser', null)
				.then(function(next) {
					console.log(colors.blue('[Parser]'), 'Accepted upload of', colors.cyan(file.path));
					next();
				})
				.forEach(plugins.parsers, function(next, parser) {
					var self = this;
					parser.canParse(function(err, canParse) {
						if (canParse) {
							console.log(colors.blue('[Parser]'), colors.cyan(parser.name), 'accepted parsing of', colors.cyan(file.path));
							self.parser = parser;
						}
					}, file);
					next();
				})
				.then('response', function(next) {
					console.log(colors.blue('[Parser]'), 'Begin parsing with', colors.cyan(this.parser.name));
					this.parser.callback(next, file, scio);
				})
				.end(function(err) {
					if (err) return next(err);
					responses.push(this.response);
					next();
				});
		})
		.end(function(err) {
			if (err) return res.send(err).status(400);
			res.send(this.responses);
		});
});
