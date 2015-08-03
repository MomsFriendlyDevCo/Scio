app.factory('Settings', function() {
	return {
		poll: {
			dashboard: 5 * 1000,
			server: 5 * 1000,
			servers: 5 * 1000,
			service: 5 * 1000,
			services: 5 * 1000,
		},
	};
});
