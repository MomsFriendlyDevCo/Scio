app.factory('Servers', function($resource) {
	return $resource('/api/servers/:id', {}, {
		chart: {url: '/api/servers/:id/chart', method: 'GET'},
		chartAll: {url: '/api/servers/chart', method: 'GET'},
		timeline: {url: '/api/servers/timeline', method: 'GET', isArray: true},
		tree: {url: '/api/servers/tree', method: 'GET', isArray: true},
	});
});
