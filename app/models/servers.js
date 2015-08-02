app.factory('Servers', function($resource) {
	return $resource('/api/servers/:id', {}, {
	});
});
