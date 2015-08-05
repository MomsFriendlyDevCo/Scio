app.controller('serverViewController', function($scope, $location, $q, $stateParams, $timeout, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.server = null;
	$scope.services = null;

	// Charts {{{
	$scope.chartConfig = {
		options: {
			chart: {
				type: 'line',
			},
			legend: {
				enabled: false,
			},
		},

		series: [], // Will be replaced by data via refresh()

		title: {text: false},

		yAxis: {
			title: {text: false},
		},

		xAxis: {
			type: 'datetime',
			title: {text: 'Date'}
		},

		loading: true,
	};
	// }}}
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		$q.all([
			Servers.get({enabled: true, id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.server = data
				}),
			Servers.chart({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.loading = false;
					$scope.loadingSilent = false;
					$scope.chartConfig.loading = false;

					var newSeries = data.series.map(function(series) {
						series.data = series.data.map(function(point) {
							point[0] = Date.parse(point[0]);
							return point;
						});
						return series;
					});
					// Deal with dynamic updates {{{
					for (var s = 0; s < newSeries.length; s++) {
						if (!$scope.chartConfig.series[s]) { // Never been set before
							$scope.chartConfig.series[s] = newSeries[s];
						} else {
							$scope.chartConfig.series[s].data.splice(0, $scope.chartConfig.series[s].data.length);
							for (var d = 0; d < newSeries[s].data.length; d++) {
								$scope.chartConfig.series[s].data.push(newSeries[s].data[d]);
							}
						}
					}
					// }}}

					$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
					if (Settings.poll.service)
						$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.service);
				}),
			Services.query({enabled: true, server: $stateParams.id}).$promise
				.then(function(data) {
					$scope.services = data;
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
