app.controller('serverListController', function($scope, $timeout, Notification, Servers, Services, Settings) {
	$scope.loading = true;
	$scope.loadingSilent = false;
	$scope.servers = null;
	$scope.lastRefresh = null;

	// Data refresher {{{
	$scope.refreshTimer = null;
	$scope.refresh = function() {
		$timeout.cancel($scope.refreshTimer);
		$scope.loadingSilent = true;
		Servers.query({enabled: true}).$promise
			.then(function(data) {
				$scope.servers = data
				// Decorators {{{
				.map(function(server) {
					// Service count {{{
					server.serviceCount = 'loading';
					Services.count({server: server._id}).$promise.then(function(data) {
						server.serviceCount = data.count;
					});
					// }}}
					return server;
				});
				// }}}
				$scope.loading = false;
			})
			.finally(function() {
				$scope.loadingSilent = false;
				$scope.lastRefresh = moment().format('D/MM/YYYY HH:mm:ss');
				if (Settings.poll.servers)
					$scope.refreshTimer = $timeout($scope.refresh, Settings.poll.servers);
			});
	};
	$scope.refresh();
	// }}}

	// Editing {{{
	$scope.deleteServer = function(server) {
		Servers.delete({id: server._id}).$promise.then(function() {
			Notification.success('<i class="fa fa-trash"></i> Server <strong>' + (server.name || server.address || 'Untitled') + '</strong> has been deleted');
			$scope.refresh();
		});
	};
	// }}}
});
