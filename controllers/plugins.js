var _ = require('lodash');

app.get('/api/plugins/count', function(req, res) {
	var pluginCount = 0;
	_.forEach(plugins, function(tree) {
		pluginCount += tree.length;
	});

	res.send({count: pluginCount});
});
