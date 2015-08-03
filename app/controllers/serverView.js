app.controller('serverViewController', function($scope, $location, $q, $stateParams, $timeout, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.server = null;
	$scope.services = null;

	$scope.chartData = {
		// data: [],
		// keys: [],
		// labels: [],
		colors: ['#4285F4', '#FFC107', '#3F51B5', '#00BCD4', '#E91E63', '#607D8B', '#8BC34A', '#673AB7', '#009688'],
	};
	
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
