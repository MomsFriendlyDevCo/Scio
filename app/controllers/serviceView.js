app.controller('serviceViewController', function($scope, $location, $q, $stateParams, $timeout, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.service = null;

	$scope.chartData = {
		// data: [],
	};
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;

		$q.all([
			Services.get({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.service = data
				}),
			Services.chart({id: $stateParams.id}).$promise
				.then(function(data) {
					$scope.chartData = data;
				}),
		]).finally(function() {
			$scope.loading = false;
			$scope.loadingSilent = false;
			$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
			if (Settings.poll.service)
				$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.service);
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
