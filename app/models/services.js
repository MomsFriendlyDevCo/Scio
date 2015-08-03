app.factory('Services', function($resource) {
	return $resource('/api/services/:id', {}, {
		count: {url: '/api/services/count', method: 'GET'},
		chart: {url: '/api/services/:id/chart', method: 'GET'},
		tickCount: {url: '/api/services/tickCount', method: 'GET'},
	});
});
