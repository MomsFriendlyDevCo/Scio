app.controller('serviceViewController', function($scope, $location, $stateParams, $timeout, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.service = null;

	$scope.lineChartData = [ { y: "2006", x: 100}, { y: "2007", x: 75}, { y: "2008", x: 50}, { y: "2009", x: 75}, { y: "2010", x: 50}, { y: "2011", x: 75}, { y: "2012", x: 100} ];
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		Services.get({id: $stateParams.id}).$promise
			.then(function(data) {
				$scope.service = data
				$scope.loading = false;
			})
			.finally(function() {
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
