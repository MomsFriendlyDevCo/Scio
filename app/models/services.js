app.factory('Services', function($resource) {
	return $resource('/api/services/:id', {}, {
		count: {url: '/api/services/count', method: 'GET'},
	});
});
