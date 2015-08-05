app.controller('serviceViewController', function($scope, $location, $stateParams, $timeout, Services, Servers, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.service = null;

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

		Services.get({id: $stateParams.id, populate: 'server'}).$promise
			.then(function(data) {
				$scope.service = data
				Servers.chart({id: $scope.service.server._id, services: [$stateParams.id]}).$promise
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
						if (!$scope.chartConfig.series.length) {
							$scope.chartConfig.series = newSeries;
						} else {
							// Deal with dynamic updates {{{
							$scope.chartConfig.series[0].data.splice(0, $scope.chartConfig.series[0].data.length);
							newSeries[0].data.forEach(function(point) {
								$scope.chartConfig.series[0].data.push(point);
							});
							// }}}
						}

						$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
						if (Settings.poll.service)
							$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.service);
					});
			});
	};
	// }}}

	// Load state {{{
	if (!$stateParams.id) {
		return $location.path('/services');
	} else {
		$scope.refresh();
	}
	// }}}
});
