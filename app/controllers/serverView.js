app.controller('serverViewController', function($scope, $location, $q, $stateParams, $timeout, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.server = null;
	$scope.services = null;

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
			Servers.get({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.server = data
				}),
			Servers.chart({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.chartData.data = data.data;
					$scope.chartData.keys = data.keys;
					$scope.chartData.labels = data.labels;
				}),
			Services.query({server: $stateParams.id}).$promise
				.then(function(data) {
					$scope.services = data;

					// Calculate donut chart data {{{
					var donutStatus = {
						ok: {label: 'Ok', value: 0, color: '#4CAF50'},
						warning: {label: 'Warning', value: 0, color: '#FF9800'},
						danger: {label: 'Danger', value: 0, color: '#F44336'},
						error: {label: 'Error', value: 0, color: '#9C27B0'},
						unknown: {label: 'Unknown', value: 0, color: '#9E9E9E'},
					};
					data.forEach(function(service) {
						if (!donutStatus[service.status]) donutStatus[service.status] = {label: service.status, value: 0};
						donutStatus[service.status].value++;
					});
					$scope.donutData.data = _.values(donutStatus);
					// }}}
				}),
		]).finally(function() {
			$scope.loading = false;
			$scope.loadingSilent = false;
			$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
			if (Settings.poll.server)
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.server);
		});
	};
	// }}}

	// Load state {{{
	if (!$stateParams.id) {
		return $location.path('/servers');
	} else {
		$scope.refresh();
	}
	// }}}
});
