app.controller('serverListController', function($scope, Notification, Servers, Services) {
	$scope.loading = true;
	$scope.servers = null;

	// Data refresher {{{
	$scope.refresh = function() {
		Servers.query().$promise.then(function(data) {
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
