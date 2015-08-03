app.factory('Plugins', function($resource) {
	return $resource('/api/plugins/:id', {}, {
		count: {url: '/api/plugins/count', method: 'GET'},
	});
});
