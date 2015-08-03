app.controller('serverViewController', function($scope, $location, $stateParams, $timeout, Servers, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.lastRefresh = null;
	$scope.server = null;
	
	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		Servers.get({id: $stateParams.id}).$promise
			.then(function(data) {
				$scope.server = data
				$scope.loading = false;
			})
			.finally(function() {
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
