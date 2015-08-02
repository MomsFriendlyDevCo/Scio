app.factory('Services', function($resource) {
	return $resource('/api/services/:id', {}, {
	});
});
