app.controller('serviceListController', function($scope, $location, $timeout, Notification, Services) {
	$scope.loading = true;
	$scope.services = null;
	$scope.lastRefresh = null;

	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		var query = {populate: 'server', enabled: true};
		if ($location.search().server) query.server = $location.search().server;

		Services.query(query).$promise
			.then(function(data) {
				$scope.services = data;
				$scope.loading = false;
			})
			.finally(function() {
				$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
				if (Settings.poll.services)
					$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.services);
			});
	};
	$scope.refresh();
	// }}}

	// Editing {{{
	$scope.deleteService = function(service) {
		Services.delete({id: service._id}).$promise.then(function() {
			Notification.success('<i class="fa fa-trash"></i> Service <strong>' + (service.name || service.plugin || 'Untitled') + '</strong> for server <strong>' + (service.server.name || service.server.address || 'Untitled') + '</strong> has been deleted');
			$scope.refresh();
		});
	};
	// }}}
});
