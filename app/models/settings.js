app.factory('Settings', function() {
	return {
		poll: {
			dashboard: 5 * 1000,
			server: 5 * 1000,
			servers: 5 * 1000,
			service: 5 * 1000,
			services: 5 * 1000,
		},
		statuses: {
			ok: {label: 'Ok', value: 100, color: '#4CAF50'},
			warning: {label: 'Warning', value: 75, color: '#FF9800'},
			danger: {label: 'Danger', value: 50, color: '#F44336'},
			error: {label: 'Error', value: 30, color: '#9C27B0'},
			unknown: {label: 'Unknown', value: 10, color: '#9E9E9E'},
		},
	};
});
