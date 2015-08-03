app.controller('dashboardController', function($scope, $q, $timeout, Plugins, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.servers = null;
	$scope.serviceCount = null;
	$scope.pluginCount = null;

	// Charts {{{
	$scope.chartData = {
		// data: [],
		// keys: [],
		// labels: [],
		colors: ['#4285F4', '#FFC107', '#3F51B5', '#00BCD4', '#E91E63', '#607D8B', '#8BC34A', '#673AB7', '#009688'],
	};

	$scope.donutData = {
		//data: [],
	};
	// }}}
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		$q.all([
			Servers.query({enabled: true}).$promise
				.then(function(data) {
					$scope.servers = data
					// Calculate donut chart data {{{
					var donutStatus = {
						ok: {label: 'Ok', value: 0, color: '#4CAF50'},
						warning: {label: 'Warning', value: 0, color: '#FF9800'},
						danger: {label: 'Danger', value: 0, color: '#F44336'},
						error: {label: 'Error', value: 0, color: '#9C27B0'},
						unknown: {label: 'Unknown', value: 0, color: '#9E9E9E'},
					};
					data.forEach(function(server) {
						if (!donutStatus[server.status]) donutStatus[server.status] = {label: server.status, value: 0};
						donutStatus[server.status].value++;
					});
					$scope.donutData.data = _.values(donutStatus);
					// }}}
				}),
			Servers.chartAll().$promise
				.then(function(data) {
					$scope.chartData.keys = data.keys;
					$scope.chartData.labels = data.labels;
					$scope.chartData.data = data.data
						.map(function(tick) {
							Object.keys(tick).forEach(function(key) {
								switch (tick[key]) {
									case 'ok': tick[key] = 100; break;
									case 'warning': tick[key] = 75; break;
									case 'danger': tick[key] = 50; break;
									case 'error': tick[key] = 30; break;
									case 'unknown': tick[key] = 10; break;
								}
							});
							return tick;
						});
				}),
			Services.count().$promise
				.then(function(data) {
					$scope.serviceCount = data.count;
				}),
			Plugins.count().$promise
				.then(function(data) {
					$scope.pluginCount = data.count;
				}),
		]).finally(function() {
			$scope.loading = false;
			$scope.loadingSilent = false;
			$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
			if (Settings.poll.dashboard)
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.dashboard);
		});
	};
	$scope.refresh();
	// }}}
});
