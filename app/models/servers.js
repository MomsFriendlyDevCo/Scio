app.factory('Servers', function($resource) {
	return $resource('/api/servers/:id', {}, {
		chart: {url: '/api/servers/:id/chart', method: 'GET'},
		chartAll: {url: '/api/servers/chart', method: 'GET'},
	});
});
